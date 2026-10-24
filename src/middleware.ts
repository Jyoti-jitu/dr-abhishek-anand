import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /portal routes
  if (pathname.startsWith("/portal")) {
    const sessionCookie = request.cookies.get("nlc_session");
    if (!sessionCookie) {
      const loginUrl = new URL("/clinic-login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Singular appointment redirect to plural
  if (pathname === "/appointment") {
    return NextResponse.redirect(new URL("/appointments", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/appointment"
  ]
};
