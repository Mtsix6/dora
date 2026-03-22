import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get the authenticated session or throw a 401.
 * Use in API routes and server components.
 */
export async function getRequiredSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
