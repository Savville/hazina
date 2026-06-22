-- ==============================================================================
-- HAZINA APP: SCOUT PROFILES SCHEMA
-- Copy and paste this script into your Supabase SQL Editor.
-- ==============================================================================

-- 1. Create the Scout Profiles table
CREATE TABLE IF NOT EXISTS public.scout_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- KYC Data
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    
    -- Operational Area
    county TEXT NOT NULL,
    sub_county TEXT NOT NULL,
    
    -- Application Details
    motivation TEXT,
    
    -- Status (pending = applicant, active = approved scout, suspended = revoked)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    
    -- Performance Metrics (Can be updated via triggers later, defaulting to 0 for now)
    submissions_count INTEGER DEFAULT 0,
    approved_count INTEGER DEFAULT 0
);

-- 2. Row Level Security (RLS) Configuration
ALTER TABLE public.scout_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent 42710 errors
DROP POLICY IF EXISTS "Scouts can insert their own profile" ON public.scout_profiles;
DROP POLICY IF EXISTS "Scouts can view their own profile" ON public.scout_profiles;
DROP POLICY IF EXISTS "Scouts can update their own profile" ON public.scout_profiles;

-- Policy: A scout can INSERT their own profile during onboarding
CREATE POLICY "Scouts can insert their own profile" 
ON public.scout_profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: A scout can SELECT (view) their own profile
CREATE POLICY "Scouts can view their own profile" 
ON public.scout_profiles
FOR SELECT 
USING (auth.uid() = id);

-- Policy: A scout can UPDATE their own profile (e.g., change phone number)
CREATE POLICY "Scouts can update their own profile" 
ON public.scout_profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- NOTE: Admins will need a separate policy or the SERVICE_ROLE_KEY to view all profiles 
-- and update the 'status' from 'pending' to 'active'.

-- 3. Automatic Updated_at Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scout_profiles_modtime
BEFORE UPDATE ON public.scout_profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
