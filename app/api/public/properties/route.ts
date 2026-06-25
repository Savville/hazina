import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use service role key to bypass RLS so the public map can read all verified properties
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const n = searchParams.get('n');
    const s = searchParams.get('s');
    const e = searchParams.get('e');
    const w = searchParams.get('w');
    const id = searchParams.get('id');

    let query = supabaseAdmin
      .from('scout_assessments')
      .select('*')
      .eq('status', 'verified')
      .order('created_at', { ascending: false });

    if (id && !id.startsWith('mock-')) {
      query = query.eq('id', id);
    }

    // Apply Viewport Spatial Filtering (BBox) if bounds are provided
    if (n && s && e && w) {
      query = query
        .gte('center_lat', parseFloat(s))
        .lte('center_lat', parseFloat(n))
        .gte('center_lng', parseFloat(w))
        .lte('center_lng', parseFloat(e));
    }

    const { data, error } = await query;

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

    // ── MOCK DATA INJECTION (3 "For Sale" Properties) ──
    const mockProperties = [
      {
        id: 'mock-1',
        property_name: 'Lakeview Estate Acreage',
        category: 'E_VACANT_LAND',
        status: 'verified',
        center_lat: -0.7171,
        center_lng: 36.4310,
        distance_meters: 4000,
        photo_urls: [], // We will use vision_tags for the photo since the map reads it from there or we can provide a mock URL.
        vision_tags: [
          { tag: 'Hero Image', photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop' }
        ],
        agent: 'Hazina Direct',
        location: 'Naivasha, Nakuru County',
        description: 'Prime 10-acre block with direct views of Lake Naivasha. Ideal for a luxury lodge or subdivision. Access road is all-weather.',
        intelligence: 'Hazina Scout notes: Grid power is 200m away. High potential for eco-tourism. Not affected by recent riparian disputes.'
      },
      {
        id: 'mock-2',
        property_name: 'Ruaka Prime Commercial Plot',
        category: 'B_COMMERCIAL',
        status: 'verified',
        center_lat: -1.1965,
        center_lng: 36.7844,
        distance_meters: 150,
        photo_urls: [],
        vision_tags: [
          { tag: 'Hero Image', photoUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1000&auto=format&fit=crop' }
        ],
        agent: 'Karengata Realtors',
        location: 'Ruaka, Kiambu County',
        description: '1/4 acre commercial plot touching the main tarmac. Perfect for a high-rise residential apartment block.',
        intelligence: 'Hazina Scout notes: Sewer line connection available. Very high foot traffic. Title deed is clean and freehold.'
      },
      {
        id: 'mock-3',
        property_name: 'Nanyuki Gateway Ranch',
        category: 'A_AGRICULTURAL',
        status: 'verified',
        center_lat: 0.0125,
        center_lng: 37.0728,
        distance_meters: 15000,
        photo_urls: [],
        vision_tags: [
          { tag: 'Hero Image', photoUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f860f385?q=80&w=1000&auto=format&fit=crop' }
        ],
        agent: 'Savannah Lands',
        location: 'Nanyuki, Laikipia County',
        description: '50 acres of flat, arable land facing Mt. Kenya. Excellent for a holiday home or horticulture.',
        intelligence: 'Hazina Scout notes: Has a functioning borehole. Wildlife corridor nearby but safely fenced. Highly motivated seller.'
      }
    ];

    let finalMock = mockProperties;
    if (id) {
      finalMock = mockProperties.filter(m => m.id === id);
    }

    // Merge mock data with db data (filtering out any non-sale if needed)
    // The user requested removing Kilima Mbogo. We'll just return the 3 mocks and any DB data that isn't Kilima Mbogo.
    const finalData = [
      ...finalMock,
      ...(data ? data.filter((p: any) => !p.property_name?.toLowerCase().includes('mbogo')) : [])
    ];

    return NextResponse.json(finalData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
