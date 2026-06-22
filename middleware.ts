import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware — Route Protection
 *
 * Runs on every request that matches the `config.matcher` below.
 * Refreshes the Supabase session cookie and redirects unauthenticated
 * users away from protected routes.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — do NOT remove this.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If visiting a protected route without a session → redirect to login
  const isProtected = pathname.startsWith('/scout') &&
    !pathname.startsWith('/scout/login') &&
    !pathname.startsWith('/scout/register');

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/scout/login';
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login/register → redirect to dashboard
  const isAuthPage =
    pathname.startsWith('/scout/login') ||
    pathname.startsWith('/scout/register');

  if (isAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/scout/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/scout/:path*'],
};
