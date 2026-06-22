import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy — Scout Route Protection (Next.js 16 edge middleware convention)
 *
 * Gate 1: Unauthenticated users → /scout/login
 * Gate 2: Authenticated but no profile → /scout/profile
 * Gate 3: Auth pages when already logged in → /scout/dashboard
 */
export async function proxy(request: NextRequest) {
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

  // Refresh session — do NOT remove this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith('/scout/login') ||
    pathname.startsWith('/scout/register');

  const isProfilePage = pathname.startsWith('/scout/profile');

  const isProtected =
    pathname.startsWith('/scout') && !isAuthPage;

  // Gate 1: No session — send to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/scout/login';
    return NextResponse.redirect(url);
  }

  // Gate 2: Logged in but no completed profile — send to /scout/profile
  // (Skip this check if they are already on the profile page to avoid redirect loop)
  if (isProtected && user && !isProfilePage) {
    const { data: profile } = await supabase
      .from('scout_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/scout/profile';
      return NextResponse.redirect(url);
    }
  }

  // Gate 3: Already logged in + visiting auth pages — send to dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/scout/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/scout/:path*'],
};
