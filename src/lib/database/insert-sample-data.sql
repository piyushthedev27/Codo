-- ============================================================================
-- STEP 1: REPLACE THIS WITH YOUR CLERK USER ID
-- ============================================================================
-- Go to: https://dashboard.clerk.com > Users > Copy your user ID
-- Then replace the line below:

\set clerk_id 'user_38guQSbezZv9dUfjROQ5WiOt1UP'

-- ⚠️ IMPORTANT: Replace 'user_2pqUXEz8K9vN3mL7wR4tY6sH1' above with YOUR actual Clerk user ID!

-- ============================================================================
-- STEP 2: RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR
-- ============================================================================

-- Insert or update user profile
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
  :'clerk_id',
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
  learning_streak = EXCLUDED.learning_streak,
  updated_at = NOW();

-- Get the user ID
DO $$
DECLARE
  v_user_id UUID;
  v_clerk_id TEXT := 'user_2pqUXEz8K9vN3mL7wR4tY6sH1'; -- ⚠️ CHANGE THIS TOO!
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM user_profiles WHERE clerk_user_id = v_clerk_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found! Did you replace the Clerk user ID?';
  END IF;
  
  RAISE NOTICE 'Found user ID: %', v_user_id;
  
  -- Delete existing data to avoid duplicates
  DELETE FROM ai_peer_profiles WHERE user_id = v_user_id;
  DELETE FROM knowledge_graph_nodes WHERE user_id = v_user_id;
  
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
  
  RAISE NOTICE 'Created 3 AI peers';
  
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
  
  RAISE NOTICE 'Created 10 knowledge graph nodes';
  RAISE NOTICE '✅ Sample data inserted successfully!';
  
END $$;

-- Verification queries
SELECT '=== USER PROFILE ===' as section;
SELECT first_name, last_name, skill_level, learning_goal, current_xp, current_level, learning_streak
FROM user_profiles 
WHERE clerk_user_id = 'user_2pqUXEz8K9vN3mL7wR4tY6sH1'; -- ⚠️ CHANGE THIS TOO!

SELECT '=== AI PEERS ===' as section;
SELECT name, personality, skill_level 
FROM ai_peer_profiles 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_2pqUXEz8K9vN3mL7wR4tY6sH1'); -- ⚠️ CHANGE THIS TOO!

SELECT '=== KNOWLEDGE GRAPH ===' as section;
SELECT concept, status, mastery_percentage, difficulty_level
FROM knowledge_graph_nodes 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_2pqUXEz8K9vN3mL7wR4tY6sH1') -- ⚠️ CHANGE THIS TOO!
ORDER BY difficulty_level, concept;
