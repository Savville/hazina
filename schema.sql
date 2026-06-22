-- ==============================================================================
-- HAZINA APP: SCOUT DATA SCHEMA & STORAGE CONFIGURATION
-- Copy and paste this script into your Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable PostGIS Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the main Scout Assessments table
CREATE TABLE IF NOT EXISTS public.scout_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    scout_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
    
    -- Basic Identifiers
    property_name TEXT NOT NULL,
    lr_number TEXT,
    category TEXT NOT NULL,
    
    -- Spatial & Tracking Data
    distance_meters NUMERIC,
    path_points JSONB NOT NULL, -- The raw GPS path array
    
    -- PostGIS Geometry (Optional: Automatically populated later via trigger if needed)
    -- boundary_geom GEOMETRY(Polygon, 4326),
    
    -- Structured JSON Payloads from the Forms
    form_data JSONB NOT NULL,
    area_data JSONB,
    vision_tags JSONB,
    
    -- Array of image URLs from Supabase Storage
    photo_urls TEXT[] DEFAULT '{}'::TEXT[]
);

-- 3. Row Level Security (RLS) for Assessments Table
ALTER TABLE public.scout_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Scouts can only INSERT their own reports
CREATE POLICY "Scouts can insert their own assessments" 
ON public.scout_assessments
FOR INSERT 
WITH CHECK (auth.uid() = scout_id);

-- Policy: Scouts can only VIEW their own reports
CREATE POLICY "Scouts can view their own assessments" 
ON public.scout_assessments
FOR SELECT 
USING (auth.uid() = scout_id);

-- (Note: Admins will need a separate policy to view all reports, typically handled via a custom role or service role key)


-- ==============================================================================
-- STORAGE CONFIGURATION
-- ==============================================================================

-- 4. Create the scout_photos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scout_photos', 'scout_photos', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Row Level Security (RLS) for Storage
-- Note: Supabase storage policies run on the `storage.objects` table.

-- Policy: Authenticated scouts can upload photos
CREATE POLICY "Scouts can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scout_photos');

-- Policy: Authenticated scouts can view their own photos
-- (In a production app, you might want to restrict this further, but this is a solid baseline)
CREATE POLICY "Scouts can view photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'scout_photos');
