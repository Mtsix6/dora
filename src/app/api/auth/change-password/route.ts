import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ChangePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Password change is not available for OAuth accounts" },
        { status: 400 },
      );
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 403 },
      );
    }

    // Prevent setting the same password
    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (samePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    // Audit log
    if (session.user.workspaceId) {
      await prisma.auditLog.create({
        data: {
          workspaceId: session.user.workspaceId,
          userId: session.user.id,
          action: "change_password",
          entity: "user",
          entityId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/auth/change-password] Error:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
