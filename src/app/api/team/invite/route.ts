import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const InviteSchema = z.object({
  email: z.string().email("Invalid email address").transform((v) => v.toLowerCase().trim()),
  role: z.enum(["MEMBER", "ADMIN"]).optional().default("MEMBER"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER or ADMIN can invite
    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: only OWNER or ADMIN can invite team members" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, role } = parsed.data;

    // Prevent non-owners from creating admins
    if (role === "ADMIN" && session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only OWNER can invite with ADMIN role" },
        { status: 403 },
      );
    }

    // Check if user already exists in this workspace
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Generate a temporary password and hash it
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Create the invited user
    const invitedUser = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0], // Default name from email prefix
        passwordHash,
        role,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Create a notification for the inviter
    await prisma.notification.create({
      data: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
        title: "Team member invited",
        message: `You invited ${email} to join the workspace as ${role}.`,
        type: "success",
        category: "system",
        actionUrl: "/settings",
      },
    });

    // Log to audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
        action: "invite_member",
        entity: "user",
        entityId: invitedUser.id,
        metadata: { invitedEmail: email, role },
      },
    });

    return NextResponse.json(invitedUser, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/team/invite] Error:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
