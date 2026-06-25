import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // 1. Fetch Climate Data from Open-Meteo (Live current + daily forecast)
    let climateData = { temp: 'N/A', precip: 'N/A' };
    try {
      const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation&timezone=Africa%2FNairobi`);
      if (meteoRes.ok) {
        const meteoJson = await meteoRes.json();
        if (meteoJson.current) {
          climateData.temp = `${meteoJson.current.temperature_2m}°C`;
          climateData.precip = `${meteoJson.current.precipitation}mm`;
        }
      }
    } catch (e) {
      console.error('Open-Meteo fetch failed:', e);
    }

    // 2. Fetch Infrastructure Data from Overpass API (2km radius)
    let infraData = { 
      hospitals: { count: 0, points: [] as any[] }, 
      commercial: { count: 0, points: [] as any[] }, 
      highways: { count: 0 }, 
      schools: { count: 0, points: [] as any[] }, 
      power: { count: 0 }, 
      industrial: { count: 0 } 
    };
    try {
      const overpassQuery = `
        [out:json][timeout:10];
        (
          node["amenity"~"hospital|clinic"](around:2000,${lat},${lng});
          way["amenity"~"hospital|clinic"](around:2000,${lat},${lng});
          node["shop"](around:2000,${lat},${lng});
          way["shop"](around:2000,${lat},${lng});
          way["highway"~"primary|trunk"](around:2000,${lat},${lng});
          node["amenity"~"school|college|university"](around:2000,${lat},${lng});
          way["amenity"~"school|college|university"](around:2000,${lat},${lng});
          way["power"~"line|substation"](around:2000,${lat},${lng});
          node["power"~"substation"](around:2000,${lat},${lng});
          way["landuse"="industrial"](around:2000,${lat},${lng});
        );
        out tags center;
      `;

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HazinaPlatform/1.0 (https://hazina.com)',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (overpassRes.ok) {
        const overpassJson = await overpassRes.json();
        const elements = overpassJson.elements || [];

        elements.forEach((e: any) => {
          if (!e.tags) return;
          
          const pointLat = e.lat || (e.center && e.center.lat);
          const pointLng = e.lon || (e.center && e.center.lon);
          const name = e.tags.name || e.tags.amenity || e.tags.shop || 'Unnamed';
          const point = (pointLat && pointLng) ? { lat: pointLat, lng: pointLng, name } : null;

          if (e.tags.amenity) {
            if (e.tags.amenity.match(/hospital|clinic/)) {
              infraData.hospitals.count++;
              if (point && infraData.hospitals.points.length < 50) infraData.hospitals.points.push(point);
            }
            if (e.tags.amenity.match(/school|college|university/)) {
              infraData.schools.count++;
              if (point && infraData.schools.points.length < 50) infraData.schools.points.push(point);
            }
          }
          if (e.tags.shop) {
            infraData.commercial.count++;
            if (point && infraData.commercial.points.length < 50) infraData.commercial.points.push(point);
          }
          if (e.tags.highway && (e.tags.highway === 'primary' || e.tags.highway === 'trunk')) {
            infraData.highways.count++;
          }
          if (e.tags.power) {
            infraData.power.count++;
          }
          if (e.tags.landuse === 'industrial') {
            infraData.industrial.count++;
          }
        });
      }
    } catch (e) {
      console.error('Overpass fetch failed:', e);
    }

    // Generate Scores based on the sourced data
    let commercialScore = 'Low';
    if (infraData.commercial.count > 50) commercialScore = 'High';
    else if (infraData.commercial.count > 10) commercialScore = 'Medium';

    let infraScore = 'Low';
    if (infraData.highways.count > 0 && infraData.hospitals.count > 2) infraScore = 'High';
    else if (infraData.highways.count > 0 || infraData.hospitals.count > 0) infraScore = 'Medium';

    return NextResponse.json({
      climate: climateData,
      infrastructure: infraData,
      scores: {
        commercialViability: commercialScore,
        infrastructureQuality: infraScore
      }
    });

  } catch (error) {
    console.error('Intelligence API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
