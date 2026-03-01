-- ============================================================================
-- SAMPLE DATA FOR CODO APPLICATION
-- This file contains sample data to populate your database
-- Run this after setting up your schema
-- ============================================================================

-- Note: Replace 'user_xxx' with actual Clerk user IDs from your application
-- You can get these from Clerk dashboard or after users sign up

-- ============================================================================
-- 1. USER PROFILES
-- ============================================================================

-- Sample User 1
INSERT INTO user_profiles (
  clerk_user_id,
  email,
  first_name,
  last_name,
  skill_level,
  learning_goal,
  primary_domain,
  current_xp,
  current_level,
  learning_streak,
  voice_coaching_enabled,
  preferred_learning_style,
  timezone
) VALUES (
  'user_2abc123def456',  -- Replace with real Clerk user ID
  'john.doe@example.com',
  'John',
  'Doe',
  'intermediate',
  'placement',
  'web-development',
  2500,
  3,
  15,
  true,
  'visual',
  'America/New_York'
) ON CONFLICT (clerk_user_id) DO NOTHING;

-- Sample User 2
INSERT INTO user_profiles (
  clerk_user_id,
  email,
  first_name,
  last_name,
  skill_level,
  learning_goal,
  primary_domain,
  current_xp,
  current_level,
  learning_streak,
  voice_coaching_enabled,
  preferred_learning_style,
  timezone
) VALUES (
  'user_3xyz789ghi012',  -- Replace with real Clerk user ID
  'jane.smith@example.com',
  'Jane',
  'Smith',
  'beginner',
  'learning',
  'data-science',
  850,
  1,
  7,
  true,
  'mixed',
  'America/Los_Angeles'
) ON CONFLICT (clerk_user_id) DO NOTHING;

-- ============================================================================
-- 2. AI PEERS (3 peers for each user)
-- ============================================================================

-- Get user IDs (you'll need to replace these with actual IDs from your database)
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'jane.smith@example.com';

  -- AI Peers for User 1
  INSERT INTO ai_peers (user_id, name, personality, skill_level, avatar_url, common_mistakes, interaction_style, backstory, is_active)
  VALUES
    (user1_id, 'Sarah', 'curious', 'beginner', '/images/avatars/sarah-3d.png', 
     ARRAY['Array method confusion', 'Variable scope issues', 'Async/await timing'],
     'Asks thoughtful questions and seeks clarification on complex topics',
     'A curious learner who loves understanding the "why" behind code. Sarah often asks probing questions that help deepen understanding.',
     true),
    (user1_id, 'Alex', 'analytical', 'intermediate', '/images/avatars/alex-3d.png',
     ARRAY['Performance optimization', 'Memory management', 'Algorithm complexity'],
     'Methodical and detail-oriented, likes to compare different approaches',
     'An analytical thinker who enjoys breaking down complex problems into smaller parts. Alex excels at finding edge cases.',
     true),
    (user1_id, 'Jordan', 'supportive', 'advanced', '/images/avatars/jordan-3d.png',
     ARRAY['Architecture decisions', 'Code organization', 'Design patterns'],
     'Encouraging and helpful, provides guidance and mentorship',
     'A supportive mentor who helps others learn from mistakes. Jordan has years of experience and loves sharing knowledge.',
     true);

  -- AI Peers for User 2
  INSERT INTO ai_peers (user_id, name, personality, skill_level, avatar_url, common_mistakes, interaction_style, backstory, is_active)
  VALUES
    (user2_id, 'Sarah', 'curious', 'beginner', '/images/avatars/sarah-3d.png',
     ARRAY['Array method confusion', 'Variable scope issues', 'Async/await timing'],
     'Asks thoughtful questions and seeks clarification on complex topics',
     'A curious learner who loves understanding the "why" behind code.',
     true),
    (user2_id, 'Alex', 'analytical', 'intermediate', '/images/avatars/alex-3d.png',
     ARRAY['Performance optimization', 'Memory management', 'Algorithm complexity'],
     'Methodical and detail-oriented, likes to compare different approaches',
     'An analytical thinker who enjoys breaking down complex problems.',
     true),
    (user2_id, 'Jordan', 'supportive', 'advanced', '/images/avatars/jordan-3d.png',
     ARRAY['Architecture decisions', 'Code organization', 'Design patterns'],
     'Encouraging and helpful, provides guidance and mentorship',
     'A supportive mentor who helps others learn from mistakes.',
     true);
END $$;

-- ============================================================================
-- 3. KNOWLEDGE GRAPH NODES
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'jane.smith@example.com';

  -- Knowledge Graph for User 1 (Web Development)
  INSERT INTO knowledge_graph_nodes (user_id, concept, category, prerequisites, status, position, connections, mastery_percentage, estimated_duration_minutes, difficulty_level)
  VALUES
    (user1_id, 'HTML Basics', 'Web Development', ARRAY[]::TEXT[], 'mastered', '{"x": 100, "y": 100}', ARRAY['CSS Fundamentals'], 100, 30, 1),
    (user1_id, 'CSS Fundamentals', 'Web Development', ARRAY['HTML Basics'], 'mastered', '{"x": 200, "y": 100}', ARRAY['JavaScript Basics'], 100, 45, 1),
    (user1_id, 'JavaScript Basics', 'Web Development', ARRAY['CSS Fundamentals'], 'mastered', '{"x": 300, "y": 100}', ARRAY['React Fundamentals'], 95, 60, 2),
    (user1_id, 'React Fundamentals', 'Web Development', ARRAY['JavaScript Basics'], 'in_progress', '{"x": 400, "y": 100}', ARRAY['React Hooks', 'State Management'], 65, 90, 3),
    (user1_id, 'React Hooks', 'Web Development', ARRAY['React Fundamentals'], 'in_progress', '{"x": 500, "y": 50}', ARRAY['Advanced React Patterns'], 45, 75, 3),
    (user1_id, 'State Management', 'Web Development', ARRAY['React Fundamentals'], 'locked', '{"x": 500, "y": 150}', ARRAY['Advanced React Patterns'], 0, 90, 3),
    (user1_id, 'Advanced React Patterns', 'Web Development', ARRAY['React Hooks', 'State Management'], 'locked', '{"x": 600, "y": 100}', ARRAY['Performance Optimization'], 0, 120, 4),
    (user1_id, 'Performance Optimization', 'Web Development', ARRAY['Advanced React Patterns'], 'locked', '{"x": 700, "y": 100}', ARRAY[]::TEXT[], 0, 90, 4),
    (user1_id, 'TypeScript Basics', 'Programming', ARRAY['JavaScript Basics'], 'in_progress', '{"x": 300, "y": 200}', ARRAY['Advanced TypeScript'], 55, 75, 3),
    (user1_id, 'Advanced TypeScript', 'Programming', ARRAY['TypeScript Basics'], 'locked', '{"x": 400, "y": 200}', ARRAY[]::TEXT[], 0, 90, 4);

  -- Knowledge Graph for User 2 (Data Science)
  INSERT INTO knowledge_graph_nodes (user_id, concept, category, prerequisites, status, position, connections, mastery_percentage, estimated_duration_minutes, difficulty_level)
  VALUES
    (user2_id, 'Python Basics', 'Programming', ARRAY[]::TEXT[], 'mastered', '{"x": 100, "y": 100}', ARRAY['Data Types & Structures'], 100, 45, 1),
    (user2_id, 'Data Types & Structures', 'Programming', ARRAY['Python Basics'], 'mastered', '{"x": 200, "y": 100}', ARRAY['NumPy Fundamentals'], 90, 60, 2),
    (user2_id, 'NumPy Fundamentals', 'Data Science', ARRAY['Data Types & Structures'], 'in_progress', '{"x": 300, "y": 100}', ARRAY['Pandas Basics'], 60, 75, 2),
    (user2_id, 'Pandas Basics', 'Data Science', ARRAY['NumPy Fundamentals'], 'in_progress', '{"x": 400, "y": 100}', ARRAY['Data Visualization'], 40, 90, 3),
    (user2_id, 'Data Visualization', 'Data Science', ARRAY['Pandas Basics'], 'locked', '{"x": 500, "y": 100}', ARRAY['Statistical Analysis'], 0, 75, 3),
    (user2_id, 'Statistical Analysis', 'Data Science', ARRAY['Data Visualization'], 'locked', '{"x": 600, "y": 100}', ARRAY['Machine Learning Intro'], 0, 120, 4),
    (user2_id, 'Machine Learning Intro', 'Data Science', ARRAY['Statistical Analysis'], 'locked', '{"x": 700, "y": 100}', ARRAY[]::TEXT[], 0, 150, 4);
END $$;

-- ============================================================================
-- 4. LEARNING TRACKS
-- ============================================================================

INSERT INTO learning_tracks (name, description, category, difficulty_level, estimated_duration_hours, prerequisites, learning_objectives, is_active)
VALUES
  ('Full Stack Web Development', 'Master modern web development from frontend to backend', 'Web Development', 'intermediate', 120,
   ARRAY['HTML Basics', 'CSS Fundamentals', 'JavaScript Basics'],
   ARRAY['Build responsive web applications', 'Master React and Node.js', 'Deploy production applications', 'Implement authentication and databases'],
   true),
  ('Data Science Fundamentals', 'Learn data analysis, visualization, and machine learning basics', 'Data Science', 'beginner', 80,
   ARRAY['Python Basics'],
   ARRAY['Analyze data with Pandas', 'Create visualizations', 'Build predictive models', 'Work with real datasets'],
   true),
  ('Advanced React Development', 'Deep dive into React patterns, performance, and architecture', 'Web Development', 'advanced', 60,
   ARRAY['React Fundamentals', 'JavaScript ES6+'],
   ARRAY['Master React Hooks', 'Implement state management', 'Optimize performance', 'Build scalable applications'],
   true);

-- ============================================================================
-- 5. USER TRACK PROGRESS
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  track1_id UUID;
  track2_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'jane.smith@example.com';
  SELECT id INTO track1_id FROM learning_tracks WHERE name = 'Full Stack Web Development';
  SELECT id INTO track2_id FROM learning_tracks WHERE name = 'Data Science Fundamentals';

  INSERT INTO user_track_progress (user_id, track_id, status, progress_percentage, started_at, current_milestone_id, next_milestone_id)
  VALUES
    (user1_id, track1_id, 'in_progress', 45, NOW() - INTERVAL '30 days', NULL, NULL),
    (user2_id, track2_id, 'in_progress', 35, NOW() - INTERVAL '15 days', NULL, NULL);
END $$;

-- ============================================================================
-- 6. LESSON RECOMMENDATIONS
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  sarah1_id UUID;
  alex1_id UUID;
  jordan1_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'jane.smith@example.com';
  
  SELECT id INTO sarah1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Sarah';
  SELECT id INTO alex1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Alex';
  SELECT id INTO jordan1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Jordan';

  -- Recommendations for User 1
  INSERT INTO lesson_recommendations (
    user_id, lesson_id, title, description, duration_minutes, difficulty_level,
    recommended_by_peer_id, recommendation_reason, relevance_score, thumbnail_url,
    topic_tags, learning_objectives, prerequisites, is_active
  ) VALUES
    (user1_id, NULL, 'Advanced React Hooks', 
     'Master custom hooks, useCallback, useMemo, and advanced patterns for building performant React applications',
     150, 'intermediate', sarah1_id,
     'Based on your progress with React Fundamentals, this will help you level up your component design',
     0.95, '/lessons/react-hooks.png',
     ARRAY['React', 'Hooks', 'Performance'],
     ARRAY['Create custom hooks', 'Optimize re-renders', 'Manage complex state'],
     ARRAY['React Fundamentals', 'JavaScript ES6'],
     true),
    (user1_id, NULL, 'TypeScript for React Developers',
     'Learn TypeScript fundamentals and how to use it effectively in React applications',
     180, 'intermediate', alex1_id,
     'TypeScript will help you catch bugs early and improve code quality',
     0.88, '/lessons/typescript-react.png',
     ARRAY['TypeScript', 'React', 'Type Safety'],
     ARRAY['Understand TypeScript basics', 'Type React components', 'Use generics effectively'],
     ARRAY['JavaScript Basics', 'React Fundamentals'],
     true),
    (user1_id, NULL, 'Building RESTful APIs with Node.js',
     'Create scalable backend APIs using Node.js, Express, and best practices',
     240, 'intermediate', jordan1_id,
     'Essential skill for full-stack development and connecting your React apps to databases',
     0.82, '/lessons/nodejs-api.png',
     ARRAY['Node.js', 'Express', 'API Design'],
     ARRAY['Build REST APIs', 'Handle authentication', 'Connect to databases'],
     ARRAY['JavaScript Basics'],
     true);
END $$;

-- ============================================================================
-- 7. ENHANCED ACTIVITIES
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  sarah1_id UUID;
  alex1_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO sarah1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Sarah';
  SELECT id INTO alex1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Alex';

  INSERT INTO enhanced_activities (
    user_id, activity_type, title, description, xp_earned, bonus_xp, xp_multiplier,
    peer_involved_id, peer_contribution_type, category, background_color, icon_name,
    priority_level, duration_minutes, completion_quality, mistakes_made,
    achievement_badge, achievement_tier, celebration_shown, activity_timestamp
  ) VALUES
    (user1_id, 'lesson_completed', 'Completed: "React Hooks Deep Dive"',
     'Mastered useState, useEffect, and custom hooks with Sarah',
     150, 25, 1.0, sarah1_id, 'teaching', 'lesson',
     'bg-blue-50 dark:bg-blue-900/20', 'BookOpen', 1, 45, 0.92, 2,
     NULL, NULL, false, NOW() - INTERVAL '2 hours'),
    
    (user1_id, 'achievement', 'Achieved: "15 Day Streak" Badge',
     'Maintained consistent learning for 15 days straight!',
     200, 50, 1.5, NULL, NULL, 'achievement',
     'bg-yellow-50 dark:bg-yellow-900/20', 'Trophy', 2, 0, 1.0, 0,
     '15-day-streak', 'gold', true, NOW() - INTERVAL '5 hours'),
    
    (user1_id, 'collaboration', 'Collaborated: "Build a Todo App"',
     'Built a full-stack application with Alex and Jordan',
     250, 30, 1.0, alex1_id, 'collaboration', 'collaboration',
     'bg-green-50 dark:bg-green-900/20', 'Users', 1, 90, 0.88, 5,
     NULL, NULL, false, NOW() - INTERVAL '1 day'),
    
    (user1_id, 'challenge_completed', 'Challenge: "Binary Search Algorithm"',
     'Solved with optimal O(log n) time complexity',
     120, 20, 1.0, NULL, NULL, 'challenge',
     'bg-purple-50 dark:bg-purple-900/20', 'Code', 1, 30, 0.95, 1,
     NULL, NULL, false, NOW() - INTERVAL '2 days'),
    
    (user1_id, 'voice_coaching', 'Voice Coaching: "Debugging Techniques"',
     'Practiced debugging with AI voice coach Jordan',
     75, 15, 1.0, NULL, 'teaching', 'voice',
     'bg-indigo-50 dark:bg-indigo-900/20', 'Mic', 1, 20, 0.85, 3,
     NULL, NULL, false, NOW() - INTERVAL '3 days');
END $$;

-- ============================================================================
-- 8. USER LEARNING STATS
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'jane.smith@example.com';

  INSERT INTO user_learning_stats (
    user_id, learning_progress_percentage, lessons_completed_count,
    weekly_lessons_completed, previous_week_lessons, progress_trend,
    current_streak_days, best_streak_days, streak_milestone_message,
    skills_mastered_count, recent_skills_mastered, monthly_skills_acquired, skills_trend,
    coding_time_this_week_minutes, daily_average_minutes, previous_week_minutes, coding_time_trend
  ) VALUES
    (user1_id, 65, 12, 4, 3, 'up',
     15, 20, 'Keep it up! You''re on fire! 🔥',
     8, ARRAY['React Hooks', 'TypeScript Basics', 'CSS Grid'],
     3, 'up',
     420, 60, 360, 'up'),
    
    (user2_id, 45, 7, 3, 2, 'up',
     7, 10, 'Great progress this week!',
     4, ARRAY['Python Basics', 'NumPy Arrays', 'Data Cleaning'],
     2, 'up',
     300, 43, 240, 'up');
END $$;

-- ============================================================================
-- 9. USER AI PEERS (Status and Relationships)
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  sarah1_id UUID;
  alex1_id UUID;
  jordan1_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john.doe@example.com';
  SELECT id INTO sarah1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Sarah';
  SELECT id INTO alex1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Alex';
  SELECT id INTO jordan1_id FROM ai_peers WHERE user_id = user1_id AND name = 'Jordan';

  INSERT INTO user_ai_peers (user_id, peer_id, status, last_interaction_at, total_interactions, specialty_area, skill_level_stars, relationship_strength)
  VALUES
    (user1_id, sarah1_id, 'online', NOW() - INTERVAL '30 minutes', 45,
     'React Hooks & State Management', 3, 0.85),
    (user1_id, alex1_id, 'online', NOW() - INTERVAL '2 hours', 38,
     'Algorithms & Data Structures', 4, 0.78),
    (user1_id, jordan1_id, 'away', NOW() - INTERVAL '5 hours', 52,
     'System Design & Architecture', 5, 0.92);
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify data was inserted correctly:

-- SELECT * FROM user_profiles;
-- SELECT * FROM ai_peers;
-- SELECT * FROM knowledge_graph_nodes;
-- SELECT * FROM learning_tracks;
-- SELECT * FROM lesson_recommendations;
-- SELECT * FROM enhanced_activities;
-- SELECT * FROM user_learning_stats;
