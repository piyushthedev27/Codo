-- Codo Database Schema
-- This file contains the complete database schema for the Codo AI-powered learning platform

-- Create custom types
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE learning_goal AS ENUM ('learning', 'projects', 'placement', 'productivity');
CREATE TYPE personality_type AS ENUM ('curious', 'analytical', 'supportive', 'competitive', 'mentor', 'challenger', 'peer', 'specialist');
CREATE TYPE node_status AS ENUM ('locked', 'in_progress', 'mastered');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE insight_type AS ENUM ('pattern_detected', 'velocity_change', 'retention_risk', 'strength_identified');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE activity_type AS ENUM ('lesson', 'challenge', 'voice_coaching', 'collaborative_coding', 'mistake_analysis');
CREATE TYPE completion_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Enhanced user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  skill_level skill_level NOT NULL DEFAULT 'beginner',
  learning_goal learning_goal NOT NULL DEFAULT 'learning',
  primary_domain TEXT NOT NULL DEFAULT 'javascript',
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  learning_streak INTEGER DEFAULT 0,
  voice_coaching_enabled BOOLEAN DEFAULT true,
  preferred_learning_style TEXT DEFAULT 'mixed',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI peer profiles
CREATE TABLE ai_peer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality personality_type NOT NULL,
  skill_level skill_level NOT NULL,
  avatar_url TEXT,
  common_mistakes JSONB DEFAULT '[]',
  interaction_style TEXT,
  backstory TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge graph nodes
CREATE TABLE knowledge_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  prerequisites JSONB DEFAULT '[]',
  status node_status DEFAULT 'locked',
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  connections JSONB DEFAULT '[]',
  mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  estimated_duration_minutes INTEGER DEFAULT 30,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, concept)
);

-- Mistake patterns tracking
CREATE TABLE mistake_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  code_context TEXT,
  language TEXT DEFAULT 'javascript',
  frequency INTEGER DEFAULT 1,
  last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  micro_lesson_generated BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced lessons with peer interactions
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  content JSONB NOT NULL DEFAULT '{}',
  peer_interactions JSONB DEFAULT '[]',
  voice_coaching_points JSONB DEFAULT '[]',
  completion_status completion_status DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  mistakes_made INTEGER DEFAULT 0,
  peer_interactions_count INTEGER DEFAULT 0,
  voice_coaching_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Collaborative coding sessions
CREATE TABLE collaborative_coding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_name TEXT,
  participants JSONB NOT NULL DEFAULT '[]',
  code_state TEXT DEFAULT '',
  cursor_positions JSONB DEFAULT '[]',
  chat_messages JSONB DEFAULT '[]',
  session_status session_status DEFAULT 'active',
  language TEXT DEFAULT 'javascript',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live learning insights
CREATE TABLE learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  insight_type insight_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_recommended TEXT,
  priority priority_level DEFAULT 'medium',
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced learning activities
CREATE TABLE learning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  content_id UUID,
  title TEXT,
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  peer_interactions_count INTEGER DEFAULT 0,
  voice_coaching_used BOOLEAN DEFAULT FALSE,
  mistakes_made INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges and coding problems
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  category TEXT NOT NULL DEFAULT 'general',
  language TEXT DEFAULT 'javascript',
  starter_code TEXT DEFAULT '',
  solution_code TEXT,
  test_cases JSONB DEFAULT '[]',
  hints JSONB DEFAULT '[]',
  estimated_duration_minutes INTEGER DEFAULT 30,
  xp_reward INTEGER DEFAULT 100,
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge attempts
CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  code_submission TEXT NOT NULL,
  status completion_status DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  time_taken_minutes INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  peer_collaboration BOOLEAN DEFAULT FALSE,
  voice_coaching_used BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Voice coaching sessions
CREATE TABLE voice_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  session_duration_minutes INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  responses_given INTEGER DEFAULT 0,
  code_suggestions INTEGER DEFAULT 0,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
  transcript JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_ai_peer_profiles_user_id ON ai_peer_profiles(user_id);
CREATE INDEX idx_knowledge_graph_nodes_user_id ON knowledge_graph_nodes(user_id);
CREATE INDEX idx_knowledge_graph_nodes_status ON knowledge_graph_nodes(status);
CREATE INDEX idx_mistake_patterns_user_id ON mistake_patterns(user_id);
CREATE INDEX idx_mistake_patterns_error_type ON mistake_patterns(error_type);
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_lessons_completion_status ON lessons(completion_status);
CREATE INDEX idx_collaborative_coding_sessions_user_id ON collaborative_coding_sessions(user_id);
CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_learning_insights_dismissed ON learning_insights(dismissed);
CREATE INDEX idx_learning_activities_user_id ON learning_activities(user_id);
CREATE INDEX idx_learning_activities_activity_type ON learning_activities(activity_type);
CREATE INDEX idx_challenges_difficulty_level ON challenges(difficulty_level);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenge_attempts_user_id ON challenge_attempts(user_id);
CREATE INDEX idx_challenge_attempts_challenge_id ON challenge_attempts(challenge_id);
CREATE INDEX idx_voice_coaching_sessions_user_id ON voice_coaching_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_peer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id'));

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id'));

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id'));

-- RLS Policies for ai_peer_profiles
CREATE POLICY "Users can view own AI peers" ON ai_peer_profiles
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own AI peers" ON ai_peer_profiles
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for knowledge_graph_nodes
CREATE POLICY "Users can view own knowledge graph" ON knowledge_graph_nodes
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own knowledge graph" ON knowledge_graph_nodes
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for mistake_patterns
CREATE POLICY "Users can view own mistake patterns" ON mistake_patterns
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own mistake patterns" ON mistake_patterns
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for lessons
CREATE POLICY "Users can view own lessons" ON lessons
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own lessons" ON lessons
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for collaborative_coding_sessions
CREATE POLICY "Users can view own coding sessions" ON collaborative_coding_sessions
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own coding sessions" ON collaborative_coding_sessions
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for learning_insights
CREATE POLICY "Users can view own insights" ON learning_insights
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own insights" ON learning_insights
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for learning_activities
CREATE POLICY "Users can view own activities" ON learning_activities
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own activities" ON learning_activities
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for challenge_attempts
CREATE POLICY "Users can view own challenge attempts" ON challenge_attempts
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own challenge attempts" ON challenge_attempts
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- RLS Policies for voice_coaching_sessions
CREATE POLICY "Users can view own voice sessions" ON voice_coaching_sessions
  FOR SELECT USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

CREATE POLICY "Users can manage own voice sessions" ON voice_coaching_sessions
  FOR ALL USING (user_id IN (
    SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id = (auth.jwt() ->> 'https://clerk.dev/user_id')
  ));

-- Public read access for challenges (no RLS needed)
-- Challenges are public content that all users can read

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_peer_profiles_updated_at BEFORE UPDATE ON ai_peer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_graph_nodes_updated_at BEFORE UPDATE ON knowledge_graph_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mistake_patterns_updated_at BEFORE UPDATE ON mistake_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborative_coding_sessions_updated_at BEFORE UPDATE ON collaborative_coding_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_insights_updated_at BEFORE UPDATE ON learning_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_activities_updated_at BEFORE UPDATE ON learning_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_attempts_updated_at BEFORE UPDATE ON challenge_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_coaching_sessions_updated_at BEFORE UPDATE ON voice_coaching_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample challenges
INSERT INTO challenges (title, description, difficulty_level, category, language, starter_code, solution_code, test_cases, hints, estimated_duration_minutes, xp_reward, tags) VALUES
(
  'Array Sum',
  'Write a function that takes an array of numbers and returns their sum.',
  1,
  'arrays',
  'javascript',
  'function arraySum(numbers) {\n  // Your code here\n}',
  'function arraySum(numbers) {\n  return numbers.reduce((sum, num) => sum + num, 0);\n}',
  '[{"input": "[1, 2, 3, 4, 5]", "expected": "15"}, {"input": "[]", "expected": "0"}, {"input": "[10, -5, 3]", "expected": "8"}]',
  '["Try using a loop to iterate through the array", "Consider using the reduce method", "Don''t forget to handle empty arrays"]',
  15,
  50,
  '["beginner", "arrays", "loops"]'
),
(
  'Fibonacci Sequence',
  'Write a function that returns the nth number in the Fibonacci sequence.',
  2,
  'algorithms',
  'javascript',
  'function fibonacci(n) {\n  // Your code here\n}',
  'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
  '[{"input": "0", "expected": "0"}, {"input": "1", "expected": "1"}, {"input": "5", "expected": "5"}, {"input": "10", "expected": "55"}]',
  '["Consider the base cases: F(0) = 0, F(1) = 1", "Use recursion or iteration", "Think about memoization for optimization"]',
  25,
  100,
  '["intermediate", "recursion", "algorithms"]'
),
(
  'Async Data Fetching',
  'Create an async function that fetches user data and handles errors gracefully.',
  3,
  'async',
  'javascript',
  'async function fetchUserData(userId) {\n  // Your code here\n}',
  'async function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    if (!response.ok) throw new Error("User not found");\n    return await response.json();\n  } catch (error) {\n    console.error("Error fetching user:", error);\n    return null;\n  }\n}',
  '[{"input": "123", "expected": "User object or null"}, {"input": "invalid", "expected": "null"}]',
  '["Use try-catch for error handling", "Check response.ok before parsing JSON", "Return null or appropriate default on error"]',
  30,
  150,
  '["advanced", "async", "error-handling"]'
);