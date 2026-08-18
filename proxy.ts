import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const hasSession = request.cookies.has("pam_session");

  if (isProtectedRoute && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isPublicRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$|sw\\.js$).*)"],
};