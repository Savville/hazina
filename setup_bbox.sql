-- 1. Add dedicated spatial columns to scout_assessments
ALTER TABLE public.scout_assessments
ADD COLUMN IF NOT EXISTS center_lat NUMERIC,
ADD COLUMN IF NOT EXISTS center_lng NUMERIC;

-- 2. Create an index on these columns to make Bounding Box queries lightning fast
CREATE INDEX IF NOT EXISTS idx_scout_assessments_lat ON public.scout_assessments (center_lat);
CREATE INDEX IF NOT EXISTS idx_scout_assessments_lng ON public.scout_assessments (center_lng);

-- 3. Backfill existing records
-- Extracts the very first latitude and longitude from the path_points JSONB array
UPDATE public.scout_assessments
SET 
  center_lat = (path_points->0->>0)::NUMERIC,
  center_lng = (path_points->0->>1)::NUMERIC
WHERE 
  path_points IS NOT NULL 
  AND center_lat IS NULL
  AND (
    CASE WHEN jsonb_typeof(path_points) = 'array' 
         THEN jsonb_array_length(path_points) > 0 
         ELSE false 
    END
  );
