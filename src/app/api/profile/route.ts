import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const NOTIFICATION_PROVIDER_PREFIX = "notification_prefs_";

function notificationProvider(userId: string) {
  return `${NOTIFICATION_PROVIDER_PREFIX}${userId}`;
}

const defaultNotificationPrefs = {
  email: true,
  inApp: true,
  weeklyDigest: false,
  incidents: true,
  extractions: true,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch notification preferences from the Integration model
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: session.user.workspaceId,
        provider: notificationProvider(session.user.id),
      },
    });

    const notificationPrefs = integration?.config ?? defaultNotificationPrefs;

    return NextResponse.json({ ...user, notificationPrefs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/profile] Error:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

const PatchSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  notificationPrefs: z
    .object({
      email: z.boolean(),
      inApp: z.boolean(),
      weeklyDigest: z.boolean(),
      incidents: z.boolean(),
      extractions: z.boolean(),
    })
    .optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, notificationPrefs } = parsed.data;

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update notification preferences if provided
    if (notificationPrefs !== undefined) {
      const provider = notificationProvider(session.user.id);

      await prisma.integration.upsert({
        where: {
          id: (
            await prisma.integration.findFirst({
              where: {
                workspaceId: session.user.workspaceId,
                provider,
              },
              select: { id: true },
            })
          )?.id ?? "",
        },
        update: {
          config: notificationPrefs,
        },
        create: {
          workspaceId: session.user.workspaceId,
          name: "Notification Preferences",
          provider,
          status: "Active",
          config: notificationPrefs,
        },
      });
    }

    // Return the updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: session.user.workspaceId,
        provider: notificationProvider(session.user.id),
      },
    });

    const updatedPrefs = integration?.config ?? defaultNotificationPrefs;

    return NextResponse.json({ ...updatedUser, notificationPrefs: updatedPrefs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[PATCH /api/profile] Error:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
