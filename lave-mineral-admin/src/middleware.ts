import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  const isAdmin =
    !!token && token.role === "admin" && token.mode === "admin";

  const isPublicRoute =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin/signup") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/login" ||
    pathname === "/signup";

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/orderHistory/:path*",
    "/profile/:path*",
    "/api/:path*",
    "/",
  ],
};