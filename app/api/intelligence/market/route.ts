import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || '';

    if (!location) {
      return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 });
    }

    // Prepare Market Intelligence Object
    let marketData = {
      population: 'Pending Data',
      gdp: 'Pending Data',
      maizePrice: 'Pending Data',
      tomatoPrice: 'Pending Data',
      rawMaterial: 'Pending Data'
    };

    // 1. Scrape Wikipedia for Demographics (Population & GDP)
    try {
      // Clean location string (e.g., "Thika, Kiambu County" -> "Thika")
      const townName = location.split(',')[0].trim();
      const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(townName)}`;
      
      const wikiRes = await fetch(wikiUrl, {
        headers: { 'User-Agent': 'HazinaPlatform/1.0 (https://hazina.com)' }
      });

      if (wikiRes.ok) {
        const html = await wikiRes.text();
        const $ = cheerio.load(html);

        // Try to find Population in the Infobox
        const infobox = $('.infobox');
        if (infobox.length > 0) {
          infobox.find('tr').each((i, el) => {
            const headerText = $(el).find('th').text().toLowerCase();
            const dataText = $(el).find('td').text().trim();
            
            if (headerText.includes('population') && dataText) {
              // Extract the first clean number we find
              const match = dataText.match(/[\d,]+/);
              if (match && marketData.population === 'Pending Data') {
                marketData.population = match[0];
              }
            }
            if (headerText.includes('gdp') || headerText.includes('economy')) {
              if (dataText) {
                marketData.gdp = dataText.substring(0, 30) + '...';
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('Wiki Scrape Failed:', e);
    }

    // 2. Agricultural & Commodity Scraping Fallback
    // Since wholesale prices are highly localized and hard to scrape for every village,
    // we use a contextual estimation based on standard Kenyan wholesale bounds.
    // In a full production build, this would scrape a site like Selina Wamucii or SokoDirectory.
    try {
      const townLower = location.toLowerCase();
      
      // Contextualize based on agricultural zones
      const isAgriHub = townLower.includes('thika') || townLower.includes('nakuru') || townLower.includes('eldoret') || townLower.includes('kitale');
      const isNairobi = townLower.includes('nairobi') || townLower.includes('kiambu');

      if (isAgriHub) {
        marketData.maizePrice = 'Ksh 3,200 / 90kg';
        marketData.tomatoPrice = 'Ksh 4,500 / Crate';
        marketData.rawMaterial = 'High (Agri/Timber)';
      } else if (isNairobi) {
        marketData.maizePrice = 'Ksh 4,000 / 90kg';
        marketData.tomatoPrice = 'Ksh 6,500 / Crate';
        marketData.rawMaterial = 'Low (Import Reliant)';
      } else {
        // Generic Rural / Other
        marketData.maizePrice = 'Ksh 3,500 / 90kg';
        marketData.tomatoPrice = 'Ksh 5,000 / Crate';
        marketData.rawMaterial = 'Moderate';
      }

      // We could add actual cheerio scraping for a commodities website here in the future
      
    } catch (e) {
      console.error('Agri Scrape Failed:', e);
    }

    return NextResponse.json(marketData);

  } catch (error) {
    console.error('Market Intelligence Error:', error);
    return NextResponse.json({ error: 'Failed to process market intelligence' }, { status: 500 });
  }
}
