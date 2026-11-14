import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET =
  process.env.NEXTAUTH_SECRET ||
  "development-secret-key-32-characters-long-123456";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: SECRET,
  });

  const isAuthenticated = Boolean(token?.id || token?.sub || token?.email);

  // 1. Prevent logged-in users from accessing /login or /register
  if (
    isAuthenticated &&
    (pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/register" ||
      pathname.startsWith("/register/"))
  ) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.startsWith("/login") &&
      !callbackUrl.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Protect /booking/* and /bookings routes from unauthenticated users
  if (!isAuthenticated && pathname.startsWith("/booking")) {
    const callbackUrl = `${pathname}${search}`;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/register",
    "/register/:path*",
    "/booking/:path*",
    "/bookings",
  ],
};

