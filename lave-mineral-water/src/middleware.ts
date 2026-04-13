import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "user-session-token",
  });

  const isUser =
    !!token && token.role === "user" && token.mode === "user";

  const isPublicRoute =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname === "/" ||
    pathname === "/explore" ||
    pathname === "/track" ||
    pathname === "/customize";

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup")
  ) {
    if (isUser) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const protectedUserRoutes = [
    "/cart",
    "/order",
    "/profile",
    "/cancel",
    "/update",
    "/orderHistory",
  ];

  const isUserProtected = protectedUserRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isUserProtected) {
    if (!isUser) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/cancel") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/profile")
  ) {
    if (!isUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/cart/:path*",
    "/order/:path*",
    "/profile/:path*",
    "/track/:path*",
    "/cancel/:path*",
    "/update/:path*",
    "/orderHistory/:path*",
    "/api/:path*",
  ],
};