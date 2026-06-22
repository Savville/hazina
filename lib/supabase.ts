import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';

/**
 * Returns a Supabase client for use in Client Components.
 * Call this inside a component or hook, not at module level,
 * to ensure environment variables are available at runtime.
 */
export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
