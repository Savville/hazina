import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('scout_assessments').select('*').eq('category', 'E_KMZ_TRACK');
  if (error) console.error("Error:", error);
  else {
    console.log("Count:", data.length);
    if (data.length > 0) {
      const d = data[0]; // Most recent or first
      console.log("Path points length:", d.path_points?.length);
      console.log("Vision tags length:", d.vision_tags?.length);
      if (d.path_points?.length > 0) console.log("First path point:", d.path_points[0]);
    }
  }
}

check();
