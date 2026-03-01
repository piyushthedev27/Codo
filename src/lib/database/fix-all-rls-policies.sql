-- Fix All RLS Policies for Service Role Access
-- Run this in Supabase SQL Editor to fix all RLS policy violations

-- Drop existing service role policies if they exist
DROP POLICY IF EXISTS "Service role full access to user_learning_stats" ON user_learning_stats;
DROP POLICY IF EXISTS "Service role full access to user_ai_peers" ON user_ai_peers;
DROP POLICY IF EXISTS "Service role full access to lesson_recommendations" ON lesson_recommendations;
DROP POLICY IF EXISTS "Service role full access to enhanced_activities" ON enhanced_activities;
DROP POLICY IF EXISTS "Service role full access to user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Service role full access to activity_achievements" ON activity_achievements;
DROP POLICY IF EXISTS "Service role full access to learning_tracks" ON learning_tracks;
DROP POLICY IF EXISTS "Service role full access to user_track_progress" ON user_track_progress;
DROP POLICY IF EXISTS "Service role full access to track_milestones" ON track_milestones;
DROP POLICY IF EXISTS "Service role full access to peer_messages" ON peer_messages;

-- Create service role policies for all tables
-- user_learning_stats
CREATE POLICY "Service role full access to user_learning_stats" 
ON user_learning_stats
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- user_ai_peers
CREATE POLICY "Service role full access to user_ai_peers" 
ON user_ai_peers
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- lesson_recommendations
CREATE POLICY "Service role full access to lesson_recommendations" 
ON lesson_recommendations
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- enhanced_activities
CREATE POLICY "Service role full access to enhanced_activities" 
ON enhanced_activities
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- user_achievements
CREATE POLICY "Service role full access to user_achievements" 
ON user_achievements
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- activity_achievements
CREATE POLICY "Service role full access to activity_achievements" 
ON activity_achievements
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- learning_tracks
CREATE POLICY "Service role full access to learning_tracks" 
ON learning_tracks
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- user_track_progress
CREATE POLICY "Service role full access to user_track_progress" 
ON user_track_progress
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- track_milestones
CREATE POLICY "Service role full access to track_milestones" 
ON track_milestones
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- peer_messages
CREATE POLICY "Service role full access to peer_messages" 
ON peer_messages
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Verify all policies were created
SELECT schemaname, tablename, policyname, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
AND 'service_role' = ANY(roles)
ORDER BY tablename, policyname;
