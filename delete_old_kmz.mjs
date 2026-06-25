import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clean() {
  const { data, error } = await supabase
    .from('scout_assessments')
    .delete()
    .eq('category', 'E_KMZ_TRACK')
    .neq('id', 'eeb2304d-1ffe-4145-b7c8-dad2fd4411ec'); // Keep only the latest correct one

  if (error) console.error("Error deleting:", error);
  else console.log("Deleted old broken KMZ tracks successfully.");
}
clean();
