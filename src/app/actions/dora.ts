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
