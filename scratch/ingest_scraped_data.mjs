import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Setup Supabase Client
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Define the path to your scraped data folder
// Note: Adjusting path to match the user's webcrawling directory
const SCRAPED_DATA_DIR = 'C:\\Users\\User\\Documents\\IMPORTANT\\AUTOMATIONS\\Webcrawling\\scraped_data';

async function ingestData() {
  console.log(`Scanning for scraped data in: ${SCRAPED_DATA_DIR}`);
  
  if (!fs.existsSync(SCRAPED_DATA_DIR)) {
    console.error(`Directory not found: ${SCRAPED_DATA_DIR}`);
    return;
  }

  const agencies = fs.readdirSync(SCRAPED_DATA_DIR);
  let totalInserted = 0;

  for (const agency of agencies) {
    const agencyDir = path.join(SCRAPED_DATA_DIR, agency);
    const jsonPath = path.join(agencyDir, 'listings.json');

    if (fs.existsSync(jsonPath)) {
      console.log(`\nFound listings for agency: ${agency.toUpperCase()}`);
      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      
      try {
        const listings = JSON.parse(fileContent);
        console.log(`- Parsing ${listings.length} properties...`);

        const formattedRecords = listings.map((listing) => {
          // Clean up the price string into a number if possible, or null
          let numericPrice = null;
          if (listing.price && listing.price.toLowerCase() !== 'price not listed') {
            const numbersOnly = listing.price.replace(/[^0-9]/g, '');
            if (numbersOnly.length > 0) numericPrice = parseInt(numbersOnly);
          }

          return {
            // We use 'verified' so it shows up on the map, but we use a distinct category to render it as a grey pin
            status: 'verified',
            category: 'MARKET_AGGREGATED', 
            property_name: listing.title || 'Unknown Property',
            distance_meters: 0, // Not verified
            path_points: [], // No GPS boundary yet
            
            // We store the rich scraped data inside form_data
            form_data: {
              source_url: listing.url,
              agency: listing.source,
              price_string: listing.price,
              price: numericPrice,
              description: listing.description,
              features: listing.features || {},
              is_scraped: true,
              verification_tier: 'grey_pin' // Hazina's Unverified Tier
            },
            
            // Store the absolute image URLs
            photo_urls: listing.images || []
          };
        });

        // Bulk insert into Supabase
        const { data, error } = await supabase
          .from('scout_assessments')
          .insert(formattedRecords)
          .select('id');

        if (error) {
          console.error(`❌ Error inserting ${agency} data:`, error.message);
        } else {
          console.log(`✅ Successfully inserted ${data.length} listings from ${agency}`);
          totalInserted += data.length;
        }

      } catch (e) {
        console.error(`❌ Failed to parse JSON for ${agency}:`, e.message);
      }
    }
  }

  console.log(`\n===========================================`);
  console.log(`🎉 PIPELINE COMPLETE! Total Properties Inserted: ${totalInserted}`);
  console.log(`===========================================`);
}

ingestData();
