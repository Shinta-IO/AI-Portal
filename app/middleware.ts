import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
          });
          
          // Create a new response with the updated cookies
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // You can now use the supabase client to authenticate the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
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
