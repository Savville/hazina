import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * POST /api/scout/sign-out
 * Signs the authenticated scout out and redirects to the login page.
 */
export async function POST() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL(
      '/scout/login',
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        : 'http://localhost:3000',
    ),
  );
}
