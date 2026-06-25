import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('scout_assessments')
    .select('id, property_name, vision_tags, created_at')
    .eq('category', 'E_KMZ_TRACK')
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  else {
    data.forEach(row => {
        console.log(`[${row.created_at}] ${row.property_name}`);
        row.vision_tags.forEach((tag, idx) => {
            console.log(`  POI ${idx}: ${tag.name} - photoUrl: ${tag.photoUrl}`);
        });
    });
  }
}
check();
