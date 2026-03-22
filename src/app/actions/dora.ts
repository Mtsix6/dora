"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDoraData() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;
  const isTestAccount = session.user.role === "OWNER" || session.user.email.includes("test");

  if (isTestAccount) {
    return { isTestAccount: true, data: null };
  }

  const [incidents, ictAssets, policies, vendors, tests] = await Promise.all([
    prisma.incident.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.ictAsset.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.policyDocument.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.vendor.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.resilienceTest.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    isTestAccount: false,
    data: {
      incidents,
      ictAssets,
      policies,
      vendors,
      tests,
    },
  };
}

export async function createIncident(data: {
  title: string;
  severity: string;
  description?: string; 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.incident.create({
    data: {
      title: data.title,
      severity: data.severity,
      description: data.description,
      status: "Investigating",
      reportedById: session.user.id,
      workspaceId,
    },
  });
}

export async function createIctAsset(data: {
  name: string;
  category: string;
  criticality: string;
  riskScore?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.ictAsset.create({
    data: {
      name: data.name,
      category: data.category,
      criticality: data.criticality,
      riskScore: data.riskScore,
      workspaceId,
    },
  });
}

export async function createVendor(data: {
  name: string;
  category: string;
  criticality: string;
  status: string;
  nextReviewAt?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.vendor.create({
    data: {
      name: data.name,
      category: data.category,
      criticality: data.criticality,
      status: data.status,
      nextReviewAt: data.nextReviewAt ? new Date(data.nextReviewAt) : undefined,
      workspaceId,
    },
  });
}

export async function createPolicy(data: {
  title: string;
  type: string;
  status?: string;
  version: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.policyDocument.create({
    data: {
      title: data.title,
      type: data.type,
      status: data.status ?? "Draft",
      version: data.version,
      workspaceId,
    },
  });
}

export async function createResilienceTest(data: {
  name: string;
  type: string;
  scheduledAt?: string;
  scope?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.resilienceTest.create({
    data: {
      name: data.name,
      type: data.type,
      status: "Scheduled",
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      scope: data.scope,
      workspaceId,
    },
  });
}

export async function updateIncidentStatus(
  id: string,
  status: string,
  resolvedAt?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.incident.update({
    where: { id, workspaceId },
    data: {
      status,
      resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined,
    },
  });
}

export async function deleteRecord(model: string, id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  const allowedModels = [
    "incident",
    "ictAsset",
    "vendor",
    "policyDocument",
    "resilienceTest",
  ] as const;

  if (!allowedModels.includes(model as (typeof allowedModels)[number])) {
    throw new Error("Invalid model");
  }

  // Type-safe deletion mapping
  switch (model) {
    case "incident": return prisma.incident.delete({ where: { id, workspaceId } });
    case "ictAsset": return prisma.ictAsset.delete({ where: { id, workspaceId } });
    case "vendor": return prisma.vendor.delete({ where: { id, workspaceId } });
    case "policyDocument": return prisma.policyDocument.delete({ where: { id, workspaceId } });
    case "resilienceTest": return prisma.resilienceTest.delete({ where: { id, workspaceId } });
    default: throw new Error("Invalid model");
  }
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  category?: string;
  actionUrl?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceId = session.user.workspaceId;

  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      actionUrl: data.actionUrl,
      workspaceId,
    },
  });
}

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.findMany({
    where: {
      userId: session.user.id,
      workspaceId: session.user.workspaceId,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markNotificationsRead(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
      workspaceId: session.user.workspaceId,
    },
    data: { read: true },
  });
}
