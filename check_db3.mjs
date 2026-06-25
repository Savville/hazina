import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('scout_assessments')
    .select('id, property_name, vision_tags')
    .eq('category', 'E_KMZ_TRACK')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) console.error(error);
  else {
    console.log("Recent KMZ Import:");
    console.log(JSON.stringify(data, null, 2));
  }
}
check();
