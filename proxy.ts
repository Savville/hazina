import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy — Scout Route Protection
 *
 * AUTH CHECK IS DISABLED FOR UI PREVIEW.
 * Re-enable the Supabase block below before going to production.
 */
export async function proxy(request: NextRequest) {
  // UI preview mode — pass all requests through without auth check
  return NextResponse.next({ request });
}

export const matcher = ['/scout/:path*'];

