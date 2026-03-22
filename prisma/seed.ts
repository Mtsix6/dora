import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const password = await bcrypt.hash("Test1234!", 12);

  // ── Free Plan Account ──────────────────────────────────────────
  const freeWorkspace = await prisma.workspace.upsert({
    where: { id: "ws-free-test" },
    update: {},
    create: {
      id: "ws-free-test",
      name: "Free Test Corp",
      tier: "FREE",
    },
  });

  await prisma.user.upsert({
    where: { email: "free@test.com" },
    update: {},
    create: {
      email: "free@test.com",
      name: "Free User",
      passwordHash: password,
      role: "OWNER",
      workspaceId: freeWorkspace.id,
    },
  });

  console.log("✓ Free account: free@test.com / Test1234!");

  // ── Pro Plan Account ───────────────────────────────────────────
  const proWorkspace = await prisma.workspace.upsert({
    where: { id: "ws-pro-test" },
    update: {},
    create: {
      id: "ws-pro-test",
      name: "Pro Financial Services",
      tier: "PRO",
    },
  });

  await prisma.user.upsert({
    where: { email: "pro@test.com" },
    update: {},
    create: {
      email: "pro@test.com",
      name: "Pro Manager",
      passwordHash: password,
      role: "OWNER",
      workspaceId: proWorkspace.id,
    },
  });

  console.log("✓ Pro account:  pro@test.com / Test1234!");

  // ── Enterprise Plan Account ────────────────────────────────────
  const entWorkspace = await prisma.workspace.upsert({
    where: { id: "ws-ent-test" },
    update: {},
    create: {
      id: "ws-ent-test",
      name: "Enterprise Bank AG",
      tier: "ENTERPRISE",
    },
  });

  await prisma.user.upsert({
    where: { email: "enterprise@test.com" },
    update: {},
    create: {
      email: "enterprise@test.com",
      name: "Enterprise Admin",
      passwordHash: password,
      role: "OWNER",
      workspaceId: entWorkspace.id,
    },
  });

  console.log("✓ Enterprise:   enterprise@test.com / Test1234!");

  // ── Owner / Admin Account (can manage all) ─────────────────────
  const ownerWorkspace = await prisma.workspace.upsert({
    where: { id: "ws-owner-test" },
    update: {},
    create: {
      id: "ws-owner-test",
      name: "DORA RoI Admin",
      tier: "ENTERPRISE",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@dora-roi.eu" },
    update: {},
    create: {
      email: "admin@dora-roi.eu",
      name: "Platform Admin",
      passwordHash: password,
      role: "OWNER",
      workspaceId: ownerWorkspace.id,
    },
  });

  console.log("✓ Admin:        admin@dora-roi.eu / Test1234!");

  console.log("\n🎉 Seed complete! All passwords: Test1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
