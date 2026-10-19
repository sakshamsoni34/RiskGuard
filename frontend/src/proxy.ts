import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/cases",
  "/simulator",
  "/models",
  "/audit",
  "/reports",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("riskguard_session")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // If unauthorized officer attempts to access protected investigation routes
  if (isProtected && !sessionToken) {
    // In demo environment, if officer hasn't logged in, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and accessing /login, route to dashboard
  if (pathname === "/login" && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/cases/:path*",
    "/simulator/:path*",
    "/models/:path*",
    "/audit/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
  ],
};
