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

  // Use __Host- prefix (secure, path=/) — fallback to legacy names for migration period
  const hasSession =
    request.cookies.has("__Host-pam_session") || request.cookies.has("pam_session");
  const hasCustomerSession =
    request.cookies.has("__Host-customer_session") || request.cookies.has("customer_session");

  // Jalur lama portal pelanggan → satu halaman login
  if (path === "/customer/login") {
    const url = new URL("/login", request.url);
    if (request.nextUrl.searchParams.get("reset") === "true") {
      url.searchParams.set("reset", "true");
    }
    return disableCaching(NextResponse.redirect(url));
  }

  // Reset membersihkan kedua sesi (hapus __Host- dan legacy)
  if (isPublicRoute && request.nextUrl.searchParams.get("reset") === "true") {
    const response = NextResponse.next();
    for (const name of ["__Host-pam_session", "pam_session", "__Host-customer_session", "customer_session"]) {
      try {
        response.cookies.delete(name);
      } catch {}
      // Overwrite fallback for __Host- strict deletion
      response.cookies.set(name, "", {
        path: "/",
        secure: true,
        sameSite: "strict",
        httpOnly: true,
        expires: new Date(0),
        maxAge: 0,
      });
    }
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
  // Include /api (but exclude static assets); auth for /api is enforced via DAL, proxy only adds no-cache & pathname
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$|sw\\.js$).*)"],
};
