import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use service role key to bypass RLS for admin insertions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // fallback for dev if service role is missing
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    const { data: { user } } = await supabaseServer.auth.getUser();
    
    const formData = await req.formData();
    const payloadStr = formData.get('payload') as string;
    
    if (!payloadStr) {
      return NextResponse.json({ error: 'Missing payload data' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    
    // Extract photos
    const photos: { file: File, originalName: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'photos' && value instanceof Blob) {
        // We stored the original name in the Blob's name property on the client
        photos.push({ file: value as File, originalName: (value as File).name });
      }
    }

    // 1. Upload photos to Supabase Storage
    const uploadedPhotoMap: Record<string, string> = {}; // map original filename to uploaded path
    const assessmentId = crypto.randomUUID();

    for (const { file, originalName } of photos) {
      const fileExt = originalName.split('.').pop() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `admin_kmz/${assessmentId}/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('scout_photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
      } else {
        uploadedPhotoMap[originalName] = filePath;
      }
    }

    // 2. Update POIs with the new uploaded image paths
    const updatedPOIs = payload.pois.map((poi: any) => {
      if (poi.photoFile && uploadedPhotoMap[poi.photoFile]) {
        return {
          ...poi,
          photoUrl: uploadedPhotoMap[poi.photoFile]
        };
      }
      return poi;
    });

    // 3. Insert data into database
    // We use a special category 'E_KMZ_TRACK' so the map knows how to render it
    const { error: dbError } = await supabaseAdmin
      .from('scout_assessments')
      .insert({
        scout_id: user?.id || null, // Ensure the uploader can view it via RLS
        property_name: payload.name || 'Imported KMZ Track',
        category: 'E_KMZ_TRACK',
        status: 'verified', // Immediately verified for the public map
        path_points: payload.track || [],
        vision_tags: updatedPOIs, // We store POIs in vision_tags
        form_data: { source: 'KMZ Import', originalFile: payload.originalFileName },
        photo_urls: Object.values(uploadedPhotoMap)
      });

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({ error: 'Failed to save KMZ to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'KMZ imported successfully' });

  } catch (error) {
    console.error('KMZ import error:', error);
    return NextResponse.json({ error: 'Internal server error processing KMZ' }, { status: 500 });
  }
}
