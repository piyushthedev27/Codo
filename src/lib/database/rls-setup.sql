-- Row Level Security Setup for Codo Database
-- Run this AFTER creating the basic schema and setting up authentication

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_peer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Enable RLS on challenges table (security requirement)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (you can make these more complex later)
-- For now, we'll allow authenticated users to access their own data

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- AI peer profiles policies
CREATE POLICY "Users can manage own AI peers" ON ai_peer_profiles
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Knowledge graph policies
CREATE POLICY "Users can manage own knowledge graph" ON knowledge_graph_nodes
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Mistake patterns policies
CREATE POLICY "Users can manage own mistake patterns" ON mistake_patterns
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Learning insights policies
CREATE POLICY "Users can manage own insights" ON learning_insights
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Challenge attempts policies
CREATE POLICY "Users can manage own challenge attempts" ON challenge_attempts
  FOR ALL USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- CHALLENGES TABLE POLICIES (Security Fix)
-- Challenges are public content that all authenticated users can read
-- But only admins/system can modify them

-- Allow all authenticated users to read challenges
CREATE POLICY "Authenticated users can read challenges" ON challenges
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Allow anonymous users to read active challenges (for demo/preview)
CREATE POLICY "Anonymous users can read active challenges" ON challenges
  FOR SELECT TO anon
  USING (is_active = true);

-- Only service role can modify challenges (admin operations)
-- This prevents regular users from creating/modifying challenges
CREATE POLICY "Only service role can modify challenges" ON challenges
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index on is_active for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);