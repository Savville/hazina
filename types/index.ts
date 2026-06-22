/**
 * Hazina — Base Type Definitions
 *
 * These are placeholder interfaces. Each will be fully defined
 * when the corresponding feature is implemented.
 *
 * Rules (from context/03-code-standards.md):
 * - Use strict TypeScript. Never use `any`.
 * - A ScoutReport, PublicProperty, and ScrapedListing must never
 *   share the same type without being explicitly mapped.
 */

// Filled in Feature 06: Dynamic Forms A/B/C/D
export interface ScoutReport {
  id: string;
  scout_id: string;
  latitude: number;
  longitude: number;
  land_use: 'agricultural' | 'commercial' | 'industrial' | 'residential';
  photo_urls: string[];
  form_data: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
}

// Filled in Feature 12: Property Detail Page
export interface PublicProperty {
  id: string;
  title: string;
  price: number;
  currency: 'KES' | 'USD';
  beds: number | null;
  baths: number | null;
  area_sqm: number | null;
  address: string;
  latitude: number;
  longitude: number;
  image_urls: string[];
  description: string;
  is_published: boolean;
  scout_report_id: string | null;
  created_at: string;
}

// Filled in Scraping Phase
export interface ScrapedListing {
  id: string;
  source_url: string;
  source_site: string;
  raw_price: string;
  normalized_price: number | null;
  currency: string | null;
  beds: number | null;
  baths: number | null;
  area_sqm: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  scraped_at: string;
  is_processed: boolean;
}
