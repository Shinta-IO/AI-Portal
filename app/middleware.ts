import { createMiddlewareClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/", "/dashboard", "/projects", "/invoices"];
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  // 🔐 Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🚫 Redirect authenticated users away from login/register
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/projects/:path*", "/invoices/:path*", "/auth/:path*"],
};
