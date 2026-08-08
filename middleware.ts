import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const isOnboarded = token?.isOnboarded;

  const path = req.nextUrl.pathname;

  const isPublicRoute = path === "/" || path === "/login" || path === "/register";
  const isApiAuthRoute = path.startsWith("/api/auth");
  const isOnboardingRoute = path.startsWith("/onboarding");
  const isApiRoute = path.startsWith("/api") && !isApiAuthRoute;

  if (isApiAuthRoute) return NextResponse.next();

  if (isLoggedIn && !isOnboarded) {
    if (!isOnboardingRoute && !isApiRoute) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
    }
  }

  if (isLoggedIn && isOnboarded && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/generate|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
