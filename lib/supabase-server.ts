import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Returns a Supabase client for use in Server Components, Route Handlers,
 * and Middleware. Reads and writes cookies via Next.js `cookies()`.
 *
 * Must be called inside an async Server Component or route handler —
 * not at module level.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from a Server Component in some SSR flows.
            // Suppress the error — the middleware handles session refresh.
          }
        },
      },
    },
  );
}
