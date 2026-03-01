-- ============================================================================
-- SIMPLE SAMPLE DATA FOR CODO APPLICATION
-- This is a simplified version that works with your existing schema
-- ============================================================================

-- IMPORTANT: Replace 'user_YOUR_CLERK_ID_HERE' with your actual Clerk user ID
-- Get it from: Clerk Dashboard > Users > Copy your user ID

-- ============================================================================
-- 1. USER PROFILE
-- ============================================================================

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
  'user_YOUR_CLERK_ID_HERE',  -- ⚠️ REPLACE THIS WITH YOUR REAL CLERK USER ID
  'your.email@example.com',
  'Your',
  'Name',
  'intermediate',
  'placement',
  'web-development',
  2500,
  3,
  15,
  true,
  'visual',
  'America/New_York'
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  current_xp = EXCLUDED.current_xp,
  current_level = EXCLUDED.current_level,
  learning_streak = EXCLUDED.learning_streak;

-- ============================================================================
-- 2. AI PEER PROFILES (3 peers)
-- ============================================================================

-- Get the user ID we just created
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM user_profiles WHERE clerk_user_id = 'user_YOUR_CLERK_ID_HERE';
  
  -- Delete existing peers for this user (to avoid duplicates)
  DELETE FROM ai_peer_profiles WHERE user_id = v_user_id;
  
  -- Insert AI Peers
  INSERT INTO ai_peer_profiles (user_id, name, personality, skill_level, avatar_url, common_mistakes, interaction_style, backstory, is_active)
  VALUES
    (v_user_id, 'Sarah', 'curious', 'beginner', '/images/avatars/sarah-3d.png',
     '["Array method confusion", "Variable scope issues", "Async/await timing"]'::jsonb,
     'Asks thoughtful questions and seeks clarification on complex topics',
     'A curious learner who loves understanding the "why" behind code.',
     true),
    (v_user_id, 'Alex', 'analytical', 'intermediate', '/images/avatars/alex-3d.png',
     '["Performance optimization", "Memory management", "Algorithm complexity"]'::jsonb,
     'Methodical and detail-oriented, likes to compare different approaches',
     'An analytical thinker who enjoys breaking down complex problems.',
     true),
    (v_user_id, 'Jordan', 'supportive', 'advanced', '/images/avatars/jordan-3d.png',
     '["Architecture decisions", "Code organization", "Design patterns"]'::jsonb,
     'Encouraging and helpful, provides guidance and mentorship',
     'A supportive mentor who helps others learn from mistakes.',
     true);
END $$;


-- ============================================================================
-- 3. KNOWLEDGE GRAPH NODES (Learning Path)
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM user_profiles WHERE clerk_user_id = 'user_YOUR_CLERK_ID_HERE';
  
  -- Delete existing nodes for this user
  DELETE FROM knowledge_graph_nodes WHERE user_id = v_user_id;
  
  -- Insert Knowledge Graph Nodes
  INSERT INTO knowledge_graph_nodes (user_id, concept, category, prerequisites, status, position, connections, mastery_percentage, estimated_duration_minutes, difficulty_level)
  VALUES
    (v_user_id, 'HTML Basics', 'Web Development', '[]'::jsonb, 'mastered', '{"x": 100, "y": 100}'::jsonb, '["CSS Fundamentals"]'::jsonb, 100, 30, 1),
    (v_user_id, 'CSS Fundamentals', 'Web Development', '["HTML Basics"]'::jsonb, 'mastered', '{"x": 200, "y": 100}'::jsonb, '["JavaScript Basics"]'::jsonb, 100, 45, 1),
    (v_user_id, 'JavaScript Basics', 'Web Development', '["CSS Fundamentals"]'::jsonb, 'mastered', '{"x": 300, "y": 100}'::jsonb, '["React Fundamentals"]'::jsonb, 95, 60, 2),
    (v_user_id, 'React Fundamentals', 'Web Development', '["JavaScript Basics"]'::jsonb, 'in_progress', '{"x": 400, "y": 100}'::jsonb, '["React Hooks", "State Management"]'::jsonb, 65, 90, 3),
    (v_user_id, 'React Hooks', 'Web Development', '["React Fundamentals"]'::jsonb, 'in_progress', '{"x": 500, "y": 50}'::jsonb, '["Advanced React Patterns"]'::jsonb, 45, 75, 3),
    (v_user_id, 'State Management', 'Web Development', '["React Fundamentals"]'::jsonb, 'locked', '{"x": 500, "y": 150}'::jsonb, '["Advanced React Patterns"]'::jsonb, 0, 90, 3),
    (v_user_id, 'Advanced React Patterns', 'Web Development', '["React Hooks", "State Management"]'::jsonb, 'locked', '{"x": 600, "y": 100}'::jsonb, '["Performance Optimization"]'::jsonb, 0, 120, 4),
    (v_user_id, 'Performance Optimization', 'Web Development', '["Advanced React Patterns"]'::jsonb, 'locked', '{"x": 700, "y": 100}'::jsonb, '[]'::jsonb, 0, 90, 4),
    (v_user_id, 'TypeScript Basics', 'Programming', '["JavaScript Basics"]'::jsonb, 'in_progress', '{"x": 300, "y": 200}'::jsonb, '["Advanced TypeScript"]'::jsonb, 55, 75, 3),
    (v_user_id, 'Advanced TypeScript', 'Programming', '["TypeScript Basics"]'::jsonb, 'locked', '{"x": 400, "y": 200}'::jsonb, '[]'::jsonb, 0, 90, 4);
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check what was created
SELECT 'User Profile:' as info, first_name, last_name, skill_level, learning_goal, current_xp, current_level 
FROM user_profiles 
WHERE clerk_user_id = 'user_YOUR_CLERK_ID_HERE';

SELECT 'AI Peers:' as info, name, personality, skill_level 
FROM ai_peer_profiles 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_YOUR_CLERK_ID_HERE');

SELECT 'Knowledge Graph:' as info, concept, status, mastery_percentage 
FROM knowledge_graph_nodes 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_YOUR_CLERK_ID_HERE')
ORDER BY difficulty_level, concept;
