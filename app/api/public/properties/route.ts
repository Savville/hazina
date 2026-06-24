import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS so the public map can read all verified properties
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('scout_assessments')
      .select('*')
      .eq('status', 'verified')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate signed URLs for all images in KMZ tracks so they load on the public map
    if (data) {
      for (const p of data) {
        if (p.category === 'E_KMZ_TRACK' && p.vision_tags && Array.isArray(p.vision_tags)) {
          for (const poi of p.vision_tags) {
            if (poi.photoUrl) {
              const { data: signed } = await supabaseAdmin.storage
                .from('scout_photos')
                .createSignedUrl(poi.photoUrl, 3600); // 1 hour expiry
              
              if (signed) {
                // Replace the relative path with the full signed URL
                poi.photoUrl = signed.signedUrl;
              }
            }
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
