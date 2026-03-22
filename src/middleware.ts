import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect all app routes except public pages and API auth routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/extraction/:path*",
    "/contracts/:path*",
    "/analytics/:path*",
    "/audit/:path*",
    "/review/:path*",
    "/incidents/:path*",
    "/resilience/:path*",
    "/ict-risk/:path*",
    "/library/:path*",
    "/third-party-risk/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
  ],
};
