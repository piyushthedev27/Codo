-- Fix Service Role Access for Database Connection Testing
-- Run this in Supabase SQL Editor to allow service role to test connections

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access to challenges" ON challenges;

-- Create policies for service role
-- For user_profiles table
CREATE POLICY "Service role full access to user_profiles" 
ON user_profiles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- For challenges table
CREATE POLICY "Service role full access to challenges" 
ON challenges
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled but service role can bypass
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'challenges', 'ai_peer_profiles');

-- Check existing policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'challenges');
