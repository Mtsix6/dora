```
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import type { WorkspaceTier } from "@prisma/client";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/** Map Stripe price IDs → internal workspace tiers. */
const PRICE_TO_TIER: Record<string, WorkspaceTier> = {
  [process.env.STRIPE_PRICE_PRO!]: "PRO",
  [process.env.STRIPE_PRICE_ENTERPRISE!]: "ENTERPRISE",
};

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  // ── Verify webhook signature ──
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  // ── Handle relevant events ──
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (workspaceId && customerId) {
          // Link Stripe customer to workspace
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: { stripeCustomerId: customerId },
          });

          // If there's a subscription, create/update our record
          if (session.subscription) {
            const subscriptionId =
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id;

            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = stripeSub.items.data[0]?.price?.id;
            const tier: WorkspaceTier = (priceId ? PRICE_TO_TIER[priceId] : undefined) ?? "PRO";

            await prisma.workspace.update({
              where: { id: workspaceId },
              data: { tier },
            });

            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: subscriptionId },
              create: {
                workspaceId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId || "",
                status: stripeSub.status === "trialing" ? "TRIALING" : "ACTIVE",
                currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
              },
              update: {
                stripePriceId: priceId || "",
                status: stripeSub.status === "trialing" ? "TRIALING" : "ACTIVE",
                currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const priceId = subscription.items.data[0]?.price?.id;
        const newTier: WorkspaceTier =
          (priceId ? PRICE_TO_TIER[priceId] : undefined) ?? "FREE";

        const activeTier =
          subscription.status === "active" || subscription.status === "trialing"
            ? newTier
            : "FREE";

        const workspace = await prisma.workspace.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (workspace) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { tier: activeTier },
          });

          // Update subscription record
          const subId = subscription.id;
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subId },
            create: {
              workspaceId: workspace.id,
              stripeSubscriptionId: subId,
              stripePriceId: priceId || "",
              status: subscription.status === "active" ? "ACTIVE" : subscription.status === "trialing" ? "TRIALING" : "CANCELED",
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            },
            update: {
              stripePriceId: priceId || "",
              status: subscription.status === "active" ? "ACTIVE" : subscription.status === "trialing" ? "TRIALING" : "CANCELED",
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const workspace = await prisma.workspace.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (workspace) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { tier: "FREE" },
          });

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "CANCELED" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
