import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnboarded = (req.auth?.user as any)?.isOnboarded;
  
  const path = req.nextUrl.pathname;
  
  // Routes qui ne nécessitent pas d'être onboardé ou connecté
  const isPublicRoute = path === "/" || path === "/login" || path === "/register";
  const isApiAuthRoute = path.startsWith("/api/auth");
  const isOnboardingRoute = path.startsWith("/onboarding");
  const isApiRoute = path.startsWith("/api") && !isApiAuthRoute;

  // Si on est sur une route liée à l'API Auth, on laisse passer (pour le OAuth flow)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Si l'utilisateur est connecté mais n'a pas fini l'onboarding
  if (isLoggedIn && !isOnboarded) {
    // S'il n'est pas déjà sur la page d'onboarding ou une route d'API (sauvegarde onboarding), on redirige
    if (!isOnboardingRoute && !isApiRoute) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
    }
  }

  // Si l'utilisateur a fini l'onboarding et essaie d'aller sur /onboarding
  if (isLoggedIn && isOnboarded && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api/generate|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
