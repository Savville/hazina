import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

async function seedProperty() {
  const propertyName = "6960 N Ozark Ave Bungalow (Mock)";
  
  // This JSON mimics the extensive data from Redfin
  const formData = {
    // Basic Details
    price: 575000,
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1170, // Total finished sq ft
    lotSqft: 6599, // 50'x150'
    yearBuilt: 1925,
    propertyType: "Single-family",
    
    // Description
    description: "Hands down, one of the best blocks in Edison Park. Situated on a coveted corner lot across from Park Ridge, this beautiful brick bungalow sits on an oversized 50' x 150' double lot, offering exceptional outdoor space, abundant natural light, and a location that's hard to match. This meticulously maintained 4-bedroom, 2-bath home seamlessly blends timeless character with thoughtful modern updates...",
    
    // Listing Info (Agency metadata)
    listedBy: "David Schatz",
    agency: "Compass",
    mlsId: "MRED #12683931",
    daysOnMarket: 2,
    
    // Financials
    estMonthlyPayment: 3707,
    propertyTaxes: 575,
    homeInsurance: 187,
    
    // Interior/Features
    features: {
      heating: "Steam heating",
      cooling: "Central air conditioning",
      flooring: "Hardwood floors throughout main living areas",
      kitchen: "Stainless steel appliances, Granite countertops, Farmhouse sink",
      basement: "Partially finished full basement",
      parking: "2 garage spaces"
    },
    
    // Hazina Ground Intelligence additions
    terrain: "Flat, Corner Lot, Elevated",
    roadFrontage: "Tarmac / Paved",
    currentUse: "Residential",
    utilities: "Piped Water, Mains Electricity, Sewer connected"
  };

  const areaData = {
    // Hazina Economic Context
    priceUnga: "250",
    bodaFare: "50",
    
    // Hazina Area Infrastructure
    supermarkets: 4,
    schools: 5,
    hospitals: 2,
    waterReliability: "reliable",
    powerReliability: "reliable",
    publicTransport: "accessible",
    
    // Demographics/Context
    neighborhood: "Edison Park",
    walkability: "8.3/10 (Very Walkable)",
    noiseLevel: "9.4/10 (Silent Zone)",
    neighborhoodDesc: "Edison Park, located between Norwood Park and Park Ridge, is a residential and commuter-friendly neighborhood with a Metra stop and a pub-lined main street."
  };

  // Fake path points representing a 50x150ft plot boundary roughly
  const pathPoints = [
    { lat: 42.0076, lng: -87.8223 },
    { lat: 42.0076, lng: -87.8225 },
    { lat: 42.0072, lng: -87.8225 },
    { lat: 42.0072, lng: -87.8223 },
    { lat: 42.0076, lng: -87.8223 } // close loop
  ];

  // Placeholder images (we'll just use Unsplash standard house photos for the mockup)
  const photoUrls = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=800&auto=format&fit=crop"
  ];

  console.log('Inserting mock property into Supabase...');

  const { data, error } = await supabase
    .from('scout_assessments')
    .insert([
      {
        property_name: propertyName,
        category: 'A_RESIDENTIAL',
        status: 'verified',
        distance_meters: 150, // rough perimeter
        path_points: pathPoints,
        form_data: formData,
        area_data: areaData,
        photo_urls: photoUrls // Note: the schema says TEXT[], we are putting absolute URLs. Our UI will need to handle absolute vs relative paths.
      }
    ])
    .select();

  if (error) {
    console.error('Error inserting property:', error);
  } else {
    console.log('Successfully inserted property!');
    console.log(`NEW PROPERTY ID: ${data[0].id}`);
  }
}

seedProperty();
