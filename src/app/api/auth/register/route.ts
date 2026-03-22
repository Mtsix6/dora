import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organisation: z.string().min(1, "Organisation is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      // Build a human-readable message from all field errors
      const messages = Object.entries(fieldErrors)
        .flatMap(([, errs]) => errs ?? []);
      const errorMessage = messages.join(". ") || "Validation failed";
      console.log("[POST /api/auth/register] Zod Error:", fieldErrors);
      return NextResponse.json(
        { error: errorMessage, details: fieldErrors },
        { status: 400 },
      );
    }

    const { email, password, firstName, lastName, organisation } = parsed.data;

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create workspace + user in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const workspace = await tx.workspace.create({
        data: { name: organisation },
      });

      const user = await tx.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          passwordHash,
          role: "OWNER",
          workspaceId: workspace.id,
        },
      });

      return { userId: user.id, email: user.email, workspaceId: workspace.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/auth/register] Error:", message, error);
    return NextResponse.json(
      { error: "Internal server error", detail: message },
      { status: 500 },
    );
  }
}
