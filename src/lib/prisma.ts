import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// We use a function to initialize Prisma to avoid top-level execution crashes during build
function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  
  return client;
}

export const prisma = getPrismaClient();
