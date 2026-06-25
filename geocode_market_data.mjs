import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocode(query) {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'HazinaScraper/1.0 (contact@hazina.co.ke)'
      }
    });

    if (!res.ok) {
      console.error(`Nominatim API error for "${query}": ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Geocoding failed for "${query}":`, error.message);
  }
  return null;
}

function extractLocationQuery(record) {
  let location = record.form_data?.location || '';
  
  if (!location && record.property_name) {
    let name = record.property_name;
    if (name.includes(' in ')) {
      location = name.split(' in ').pop();
    } else if (name.includes(' at ')) {
      location = name.split(' at ').pop();
    } else if (name.includes('–')) {
      location = name.split('–').pop();
    } else if (name.includes('-')) {
      location = name.split('-').pop();
    } else {
      location = name;
    }
  }

  location = location.replace(/Area/gi, '').replace(/Off/gi, '').trim();
  
  if (!location || location.toLowerCase().includes('unknown property')) return null;
  if (location.toLowerCase().includes('log in')) return null;

  if (!location.toLowerCase().includes('nairobi') && !location.toLowerCase().includes('kenya')) {
    location += ', Nairobi, Kenya'; // Most are in Nairobi, gives better Nominatim results
  } else if (!location.toLowerCase().includes('kenya')) {
    location += ', Kenya';
  }
  
  return location;
}

async function run() {
  console.log('Fetching MARKET_AGGREGATED properties without coordinates...');
  
  const { data: properties, error } = await supabase
    .from('scout_assessments')
    .select('id, property_name, form_data')
    .eq('category', 'MARKET_AGGREGATED')
    .is('center_lat', null);

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  console.log(`Found ${properties.length} properties to geocode.`);

  let successCount = 0;
  
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const query = extractLocationQuery(property);
    
    if (!query) {
      console.log(`[${i+1}/${properties.length}] No location query found for: ${property.property_name}`);
      continue;
    }

    console.log(`[${i+1}/${properties.length}] Geocoding: "${query}"...`);
    const coords = await geocode(query);

    if (coords) {
      const { error: updateError } = await supabase
        .from('scout_assessments')
        .update({
          center_lat: coords.lat,
          center_lng: coords.lng
        })
        .eq('id', property.id);

      if (updateError) {
        console.error(`Failed to update ${property.id}:`, updateError.message);
      } else {
        console.log(`  -> Success: ${coords.lat}, ${coords.lng}`);
        successCount++;
      }
    } else {
      console.log(`  -> Not found.`);
    }

    // Be nice to Nominatim (1 request per second)
    await sleep(1500);
  }

  console.log(`Geocoding complete. Successfully updated ${successCount} out of ${properties.length} properties.`);
}

run();
