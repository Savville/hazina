import Link from 'next/link';

export default function PropertyGridCard({ prop }: { prop: any }) {
  // Determine image URL
  const imageUrl = prop.vision_tags?.[0]?.photoUrl 
    ? (prop.vision_tags[0].photoUrl.startsWith('http') ? prop.vision_tags[0].photoUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${prop.vision_tags[0].photoUrl}`)
    : (prop.photo_urls?.[0] ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scout_photos/${prop.photo_urls[0]}` : null);

  // Format category
  const categoryStr = prop.category?.replace(/^[A-E]_/, '').replace('_', ' ') || 'Property';

  return (
    <Link href={`/property/${prop.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
        
        {/* 3/4 Image Section */}
        <div className="relative w-full h-[220px] bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={prop.property_name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
              No Image Available
            </div>
          )}
          
          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase shadow-sm">
              FOR SALE
            </span>
            <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded tracking-wider shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              VERIFIED
            </span>
          </div>

          {/* Bottom Right Share/Heart (Visual only) */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:text-red-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            </div>
            <div className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:text-red-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="p-4 flex flex-col flex-grow bg-white">
          <div className="text-xl font-bold text-gray-900 mb-2">
            Price Upon Request
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium mb-1 truncate">
            <span>{categoryStr}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{prop.distance_meters ? `${parseFloat(prop.distance_meters).toFixed(0)}m perimeter` : 'Survey pending'}</span>
          </div>
          
          <div className="text-sm text-gray-500 truncate mt-auto">
            <span className="font-semibold text-gray-800">{prop.property_name}</span>
            {prop.location ? ` • ${prop.location}` : ''}
          </div>
        </div>

      </div>
    </Link>
  );
}
