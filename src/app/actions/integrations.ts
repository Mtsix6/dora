"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleIntegration(provider: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  // Check if integration already exists
  const existing = await prisma.integration.findFirst({
    where: { workspaceId, provider },
  });

  if (existing) {
    // Disconnect (Delete or Inactivate)
    await prisma.integration.delete({
      where: { id: existing.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "DISCONNECT_INTEGRATION",
        entity: "integration",
        entityId: existing.id,
        userId: session.user.id,
        workspaceId,
        metadata: { provider, name },
      },
    });
  } else {
    // Connect
    const integration = await prisma.integration.create({
      data: {
        workspaceId,
        provider,
        name,
        status: "Active",
        config: {},
        lastSyncAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        workspaceId,
        title: "Integration Connected",
        message: `${name} has been successfully connected to your workspace.`,
        type: "success",
        category: "system",
        actionUrl: "/integrations",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CONNECT_INTEGRATION",
        entity: "integration",
        entityId: integration.id,
        userId: session.user.id,
        workspaceId,
        metadata: { provider, name },
      },
    });
  }

  revalidatePath("/integrations");
}
