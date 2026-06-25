-- 1. Add Private CRM Data tracking
ALTER TABLE public.scout_assessments
ADD COLUMN IF NOT EXISTS private_crm JSONB,
ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;

-- 2. Add Global Hazina Points Tracking to Scout Profiles
ALTER TABLE public.scout_profiles
ADD COLUMN IF NOT EXISTS hazina_points INTEGER DEFAULT 0;
