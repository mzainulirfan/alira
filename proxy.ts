import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/customers",
  "/meter-readings",
  "/bills",
  "/payments",
  "/expenses",
  "/reports",
  "/more",
];
const publicRoutes = ["/login"];
const customerHomeRoute = "/customer/dashboard";
const customerLoginRoute = "/customer/login";

function disableCaching(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const hasSession = request.cookies.has("pam_session");
  const hasCustomerSession = request.cookies.has("customer_session");
  const shouldResetStaffSession =
    isPublicRoute && request.nextUrl.searchParams.get("reset") === "true";
  const shouldResetCustomerSession =
    path === customerLoginRoute && request.nextUrl.searchParams.get("reset") === "true";

  if (shouldResetStaffSession || shouldResetCustomerSession) {
    const response = NextResponse.next();
    if (shouldResetStaffSession) response.cookies.delete("pam_session");
    if (shouldResetCustomerSession) response.cookies.delete("customer_session");
    return disableCaching(response);
  }

  if (hasCustomerSession && !hasSession && (isProtectedRoute || isPublicRoute)) {
    return disableCaching(NextResponse.redirect(new URL(customerHomeRoute, request.url)));
  }

  if (isProtectedRoute && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return disableCaching(NextResponse.redirect(url));
  }

  if (isPublicRoute && hasSession) {
    return disableCaching(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  return disableCaching(
    NextResponse.next({ request: { headers: requestHeaders } })
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$|sw\\.js$).*)"],
};
