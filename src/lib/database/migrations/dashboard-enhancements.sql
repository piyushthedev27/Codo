-- Dashboard Enhancement Database Schema Updates
-- This migration adds tables for enhanced dashboard functionality
-- Requirements: 23.1, 23.2, 23.3, 23.4, 23.5

-- ============================================================================
-- 1. User Learning Stats Table (Requirement 23.1)
-- ============================================================================
-- Stores enhanced learning analytics and metrics
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Learning Progress Metrics
  learning_progress_percentage INTEGER DEFAULT 0 CHECK (learning_progress_percentage >= 0 AND learning_progress_percentage <= 100),
  lessons_completed_count INTEGER DEFAULT 0,
  weekly_lessons_completed INTEGER DEFAULT 0,
  previous_week_lessons INTEGER DEFAULT 0,
  progress_trend TEXT DEFAULT 'stable' CHECK (progress_trend IN ('up', 'down', 'stable')),
  
  -- Streak Analytics
  current_streak_days INTEGER DEFAULT 0,
  best_streak_days INTEGER DEFAULT 0,
  streak_milestone_message TEXT,
  last_activity_date DATE,
  
  -- Skills Mastery
  skills_mastered_count INTEGER DEFAULT 0,
  recent_skills_mastered TEXT[] DEFAULT '{}',
  monthly_skills_acquired INTEGER DEFAULT 0,
  previous_month_skills INTEGER DEFAULT 0,
  skills_trend TEXT DEFAULT 'stable' CHECK (skills_trend IN ('up', 'down', 'stable')),
  
  -- Coding Time Tracking
  coding_time_this_week_minutes INTEGER DEFAULT 0,
  daily_average_minutes INTEGER DEFAULT 0,
  previous_week_minutes INTEGER DEFAULT 0,
  coding_time_trend TEXT DEFAULT 'stable' CHECK (coding_time_trend IN ('up', 'down', 'stable')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one stats record per user
  UNIQUE(user_id)
);

-- Index for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_user_id ON user_learning_stats(user_id);

-- ============================================================================
-- 2. User AI Peers Relationship Table (Requirement 23.2)
-- ============================================================================
-- Manages relationship between users and their AI peers with status
CREATE TABLE IF NOT EXISTS user_ai_peers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES ai_peer_profiles(id) ON DELETE CASCADE,
  
  -- Peer Status Management
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'coding', 'away', 'studying', 'offline')),
  specialty_area TEXT,
  skill_level_stars INTEGER DEFAULT 3 CHECK (skill_level_stars >= 1 AND skill_level_stars <= 5),
  
  -- Activity Tracking
  last_interaction_at TIMESTAMP,
  total_interactions INTEGER DEFAULT 0,
  current_activity TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique peer-user relationship
  UNIQUE(user_id, peer_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_ai_peers_user_id ON user_ai_peers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_peers_peer_id ON user_ai_peers(peer_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_peers_status ON user_ai_peers(status);

-- ============================================================================
-- 3. Peer Messages Table (Requirement 23.2)
-- ============================================================================
-- Stores recent messages from AI peers
CREATE TABLE IF NOT EXISTS peer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES ai_peer_profiles(id) ON DELETE CASCADE,
  
  -- Message Content
  message_type TEXT DEFAULT 'question' CHECK (message_type IN ('question', 'encouragement', 'tip', 'comment', 'suggestion')),
  content TEXT NOT NULL,
  context TEXT, -- What the message is about
  
  -- Message Metadata
  is_read BOOLEAN DEFAULT FALSE,
  requires_response BOOLEAN DEFAULT FALSE,
  conversation_thread_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_peer_messages_user_id ON peer_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_messages_peer_id ON peer_messages(peer_id);
CREATE INDEX IF NOT EXISTS idx_peer_messages_created_at ON peer_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_messages_is_read ON peer_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_peer_messages_thread ON peer_messages(conversation_thread_id);

-- ============================================================================
-- 4. Learning Tracks Table (Requirement 23.3)
-- ============================================================================
-- Defines learning paths and tracks
CREATE TABLE IF NOT EXISTS learning_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Track Information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Track Metadata
  total_lessons INTEGER DEFAULT 0,
  estimated_duration_hours INTEGER DEFAULT 0,
  prerequisites TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Track Status
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_learning_tracks_category ON learning_tracks(category);
CREATE INDEX IF NOT EXISTS idx_learning_tracks_difficulty ON learning_tracks(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_tracks_active ON learning_tracks(is_active);

-- ============================================================================
-- 5. User Track Progress Table (Requirement 23.3)
-- ============================================================================
-- Tracks user progress through learning tracks
CREATE TABLE IF NOT EXISTS user_track_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES learning_tracks(id) ON DELETE CASCADE,
  
  -- Progress Tracking
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  lessons_completed INTEGER DEFAULT 0,
  current_lesson_id UUID,
  
  -- Milestone Tracking
  next_milestone_id UUID,
  milestones_completed INTEGER DEFAULT 0,
  
  -- Time Tracking
  time_spent_minutes INTEGER DEFAULT 0,
  estimated_completion_date DATE,
  
  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique track per user
  UNIQUE(user_id, track_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_track_progress_user_id ON user_track_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_track_id ON user_track_progress(track_id);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_status ON user_track_progress(status);

-- ============================================================================
-- 6. Track Milestones Table (Requirement 23.3)
-- ============================================================================
-- Defines milestones within learning tracks
CREATE TABLE IF NOT EXISTS track_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES learning_tracks(id) ON DELETE CASCADE,
  
  -- Milestone Information
  title TEXT NOT NULL,
  description TEXT,
  milestone_order INTEGER NOT NULL,
  
  -- Completion Requirements
  required_lessons INTEGER DEFAULT 0,
  required_xp INTEGER DEFAULT 0,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  unlocked_content TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_track_milestones_track_id ON track_milestones(track_id);
CREATE INDEX IF NOT EXISTS idx_track_milestones_order ON track_milestones(milestone_order);

-- ============================================================================
-- 7. Lesson Recommendations Table (Requirement 23.4)
-- ============================================================================
-- Stores AI-generated lesson recommendations
CREATE TABLE IF NOT EXISTS lesson_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Lesson Information
  lesson_id UUID, -- Can be null for external content
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Recommendation Metadata
  recommended_by_peer_id UUID REFERENCES ai_peer_profiles(id),
  recommendation_reason TEXT,
  relevance_score DECIMAL(3,2) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  
  -- Content Metadata
  thumbnail_url TEXT,
  topic_tags TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  
  -- Recommendation Status
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  
  -- Timestamps
  recommended_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_lesson_recommendations_user_id ON lesson_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_recommendations_peer_id ON lesson_recommendations(recommended_by_peer_id);
CREATE INDEX IF NOT EXISTS idx_lesson_recommendations_active ON lesson_recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_recommendations_score ON lesson_recommendations(relevance_score DESC);

-- ============================================================================
-- 8. Enhanced Activities Table (Requirement 23.5)
-- ============================================================================
-- Enhanced version of learning_activities with additional fields
CREATE TABLE IF NOT EXISTS enhanced_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Activity Information
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'lesson_completed', 'achievement', 'collaboration', 'practice', 
    'challenge_completed', 'peer_interaction', 'voice_coaching', 'milestone_reached'
  )),
  title TEXT NOT NULL,
  description TEXT,
  
  -- XP and Rewards
  xp_earned INTEGER DEFAULT 0,
  bonus_xp INTEGER DEFAULT 0,
  xp_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Peer Involvement
  peer_involved_id UUID REFERENCES ai_peer_profiles(id),
  peer_contribution_type TEXT CHECK (peer_contribution_type IN ('teaching', 'collaboration', 'encouragement', 'challenge')),
  
  -- Activity Metadata
  category TEXT,
  background_color TEXT,
  icon_name TEXT,
  priority_level INTEGER DEFAULT 0,
  
  -- Performance Metrics
  duration_minutes INTEGER DEFAULT 0,
  completion_quality DECIMAL(3,2) CHECK (completion_quality >= 0 AND completion_quality <= 1),
  mistakes_made INTEGER DEFAULT 0,
  
  -- Achievement Data
  achievement_badge TEXT,
  achievement_tier TEXT CHECK (achievement_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  celebration_shown BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  activity_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_enhanced_activities_user_id ON enhanced_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_activities_type ON enhanced_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_activities_timestamp ON enhanced_activities(activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_activities_peer ON enhanced_activities(peer_involved_id);

-- ============================================================================
-- 9. Activity Achievements Table (Requirement 23.5)
-- ============================================================================
-- Defines available achievements
CREATE TABLE IF NOT EXISTS activity_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Achievement Information
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Unlock Criteria
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('streak', 'xp_total', 'lessons_completed', 'challenges_completed', 'peer_interactions', 'custom')),
  criteria_value INTEGER NOT NULL,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_icon TEXT,
  unlocked_content TEXT[] DEFAULT '{}',
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_secret BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_achievements_category ON activity_achievements(category);
CREATE INDEX IF NOT EXISTS idx_activity_achievements_active ON activity_achievements(is_active);

-- ============================================================================
-- 10. User Achievements Table (Requirement 23.5)
-- ============================================================================
-- Tracks user achievement unlocks
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES activity_achievements(id) ON DELETE CASCADE,
  
  -- Achievement Status
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 100 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Display Status
  is_new BOOLEAN DEFAULT TRUE,
  celebration_shown BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique achievement per user
  UNIQUE(user_id, achievement_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE user_learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_peers ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_track_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User Learning Stats Policies
CREATE POLICY "Users can view their own learning stats"
  ON user_learning_stats FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

CREATE POLICY "Users can update their own learning stats"
  ON user_learning_stats FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- User AI Peers Policies
CREATE POLICY "Users can view their own AI peer relationships"
  ON user_ai_peers FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- Peer Messages Policies
CREATE POLICY "Users can view their own peer messages"
  ON peer_messages FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

CREATE POLICY "Users can update their own peer messages"
  ON peer_messages FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- Learning Tracks Policies (public read)
CREATE POLICY "Anyone can view active learning tracks"
  ON learning_tracks FOR SELECT
  USING (is_active = true);

-- User Track Progress Policies
CREATE POLICY "Users can view their own track progress"
  ON user_track_progress FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

CREATE POLICY "Users can update their own track progress"
  ON user_track_progress FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- Track Milestones Policies (public read)
CREATE POLICY "Anyone can view track milestones"
  ON track_milestones FOR SELECT
  USING (true);

-- Lesson Recommendations Policies
CREATE POLICY "Users can view their own recommendations"
  ON lesson_recommendations FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- Enhanced Activities Policies
CREATE POLICY "Users can view their own activities"
  ON enhanced_activities FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- Activity Achievements Policies (public read)
CREATE POLICY "Anyone can view active achievements"
  ON activity_achievements FOR SELECT
  USING (is_active = true);

-- User Achievements Policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM user_profiles WHERE id = user_id));

-- ============================================================================
-- Triggers for automatic timestamp updates
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_user_learning_stats_updated_at BEFORE UPDATE ON user_learning_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ai_peers_updated_at BEFORE UPDATE ON user_ai_peers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_messages_updated_at BEFORE UPDATE ON peer_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_tracks_updated_at BEFORE UPDATE ON learning_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_track_progress_updated_at BEFORE UPDATE ON user_track_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_milestones_updated_at BEFORE UPDATE ON track_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_recommendations_updated_at BEFORE UPDATE ON lesson_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_activities_updated_at BEFORE UPDATE ON enhanced_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_achievements_updated_at BEFORE UPDATE ON activity_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
