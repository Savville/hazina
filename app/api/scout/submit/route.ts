import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // For development, if no user is found and we are testing, we might want to bypass or mock.
    // But since it's a protected route, we enforce it.
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const payloadStr = formData.get('payload') as string;
    
    if (!payloadStr) {
      return NextResponse.json({ error: 'Missing payload data' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    
    // Extract photos
    const photos: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'photos' && value instanceof Blob) {
        photos.push(value as File);
      }
    }

    // 3. Upload photos to Supabase Storage
    const uploadedPaths: string[] = [];
    const assessmentId = crypto.randomUUID(); // generate an ID for the folder

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${assessmentId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scout_photos')
        .upload(filePath, photo, {
          contentType: photo.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
      } else {
        uploadedPaths.push(filePath);
      }
    }

    // 4. Insert data into database
    const form = payload.form || {};
    const category = form.category || 'UNKNOWN';
    const property_name = form.name || 'Unnamed Property';
    const lr_number = form.lr_number || null;

    const { error: dbError } = await supabase
      .from('scout_assessments')
      .insert({
        scout_id: user.id,
        property_name,
        lr_number,
        category,
        distance_meters: payload.dist ? parseFloat(payload.dist) : 0,
        path_points: payload.path || [],
        form_data: form,
        area_data: payload.area || {},
        vision_tags: payload.visionTags || [],
        photo_urls: uploadedPaths
      });

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({ error: 'Failed to save assessment to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Assessment submitted successfully' });

  } catch (error) {
    console.error('Submission processing error:', error);
    return NextResponse.json({ error: 'Internal server error processing submission' }, { status: 500 });
  }
}
