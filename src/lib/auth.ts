import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      workspaceId: string;
      workspaceName: string;
      workspaceTier: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    workspaceId: string;
    workspaceName: string;
    workspaceTier: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/login",
  },

  providers: [
    // ── Credentials (email + password) ──
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { workspace: true },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          workspaceId: user.workspaceId,
          workspaceName: user.workspace.name,
          workspaceTier: user.workspace.tier,
        };
      },
    }),

    // ── Google OAuth (only if env vars are set) ──
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, auto-create workspace + user if they don't exist
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const workspace = await prisma.workspace.create({
            data: { name: `${user.name ?? "My"}'s Workspace` },
          });

          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: "OWNER",
              workspaceId: workspace.id,
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // On first sign-in, add custom fields to the JWT
      if (user) {
        // For credentials provider, user object already has our fields
        if ("workspaceId" in user) {
          token.userId = user.id as string;
          token.role = (user as unknown as { role: string }).role;
          token.workspaceId = (user as unknown as { workspaceId: string }).workspaceId;
          token.workspaceName = (user as unknown as { workspaceName: string }).workspaceName;
          token.workspaceTier = (user as unknown as { workspaceTier: string }).workspaceTier;
        } else if (account?.provider === "google" && user.email) {
          // For OAuth, look up the user we just created / already exists
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { workspace: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.workspaceId = dbUser.workspaceId;
            token.workspaceName = dbUser.workspace.name;
            token.workspaceTier = dbUser.workspace.tier;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.workspaceId = token.workspaceId;
      session.user.workspaceName = token.workspaceName;
      session.user.workspaceTier = token.workspaceTier;
      return session;
    },
  },
};
