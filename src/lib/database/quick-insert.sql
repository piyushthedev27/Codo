-- ============================================================================
-- QUICK INSERT - EASIEST METHOD
-- ============================================================================
-- 1. Find YOUR_CLERK_USER_ID in this file (appears 7 times)
-- 2. Replace ALL 7 occurrences with your real Clerk user ID
-- 3. Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Insert user profile
INSERT INTO user_profiles (
  clerk_user_id, email, first_name, last_name, skill_level, learning_goal,
  primary_domain, current_xp, current_level, learning_streak,
  voice_coaching_enabled, preferred_learning_style, timezone
) VALUES (
  'user_38guQSbezZv9dUfjROQ5WiOt1UP',  -- ⚠️ REPLACE THIS (1/7)
  'your.email@example.com', 'Your', 'Name', 'intermediate', 'placement',
  'web-development', 2500, 3, 15, true, 'visual', 'America/New_York'
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  current_xp = 2500, current_level = 3, learning_streak = 15, updated_at = NOW();

-- Insert AI Peers
INSERT INTO ai_peer_profiles (user_id, name, personality, skill_level, avatar_url, common_mistakes, interaction_style, backstory, is_active)
SELECT 
  id,
  peer.name,
  peer.personality::personality_type,
  peer.skill_level::skill_level,
  peer.avatar_url,
  peer.common_mistakes::jsonb,
  peer.interaction_style,
  peer.backstory,
  true
FROM user_profiles,
LATERAL (VALUES
  ('Sarah', 'curious', 'beginner', '/images/avatars/sarah-3d.png', '["Array method confusion", "Variable scope issues"]', 'Asks thoughtful questions', 'A curious learner'),
  ('Alex', 'analytical', 'intermediate', '/images/avatars/alex-3d.png', '["Performance optimization", "Memory management"]', 'Methodical and detail-oriented', 'An analytical thinker'),
  ('Jordan', 'supportive', 'advanced', '/images/avatars/jordan-3d.png', '["Architecture decisions", "Code organization"]', 'Encouraging and helpful', 'A supportive mentor')
) AS peer(name, personality, skill_level, avatar_url, common_mistakes, interaction_style, backstory)
WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP'  -- ⚠️ REPLACE THIS (2/7)
ON CONFLICT DO NOTHING;

-- Insert Knowledge Graph
INSERT INTO knowledge_graph_nodes (user_id, concept, category, prerequisites, status, position, connections, mastery_percentage, estimated_duration_minutes, difficulty_level)
SELECT 
  up.id,
  node.concept,
  node.category,
  node.prerequisites::jsonb,
  node.status::node_status,
  node.position::jsonb,
  node.connections::jsonb,
  node.mastery_percentage::integer,
  node.duration::integer,
  node.difficulty::integer
FROM user_profiles up,
LATERAL (VALUES
  ('HTML Basics', 'Web Development', '[]', 'mastered', '{"x":100,"y":100}', '["CSS Fundamentals"]', 100, 30, 1),
  ('CSS Fundamentals', 'Web Development', '["HTML Basics"]', 'mastered', '{"x":200,"y":100}', '["JavaScript Basics"]', 100, 45, 1),
  ('JavaScript Basics', 'Web Development', '["CSS Fundamentals"]', 'mastered', '{"x":300,"y":100}', '["React Fundamentals"]', 95, 60, 2),
  ('React Fundamentals', 'Web Development', '["JavaScript Basics"]', 'in_progress', '{"x":400,"y":100}', '["React Hooks"]', 65, 90, 3),
  ('React Hooks', 'Web Development', '["React Fundamentals"]', 'in_progress', '{"x":500,"y":50}', '[]', 45, 75, 3),
  ('State Management', 'Web Development', '["React Fundamentals"]', 'locked', '{"x":500,"y":150}', '[]', 0, 90, 3),
  ('Advanced React', 'Web Development', '["React Hooks"]', 'locked', '{"x":600,"y":100}', '[]', 0, 120, 4),
  ('TypeScript Basics', 'Programming', '["JavaScript Basics"]', 'in_progress', '{"x":300,"y":200}', '[]', 55, 75, 3)
) AS node(concept, category, prerequisites, status, position, connections, mastery_percentage, duration, difficulty)
WHERE up.clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP'  -- ⚠️ REPLACE THIS (3/7)
ON CONFLICT (user_id, concept) DO UPDATE SET
  status = EXCLUDED.status,
  mastery_percentage = EXCLUDED.mastery_percentage;

-- Verify: User Profile
SELECT 'USER PROFILE:' as info, first_name, last_name, current_xp, current_level, learning_streak
FROM user_profiles WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP';  -- ⚠️ REPLACE THIS (4/7)

-- Verify: AI Peers
SELECT 'AI PEERS:' as info, name, personality, skill_level
FROM ai_peer_profiles 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UPD');  -- ⚠️ REPLACE THIS (5/7)

-- Verify: Knowledge Graph
SELECT 'KNOWLEDGE GRAPH:' as info, concept, status, mastery_percentage
FROM knowledge_graph_nodes 
WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP')  -- ⚠️ REPLACE THIS (6/7)
ORDER BY difficulty_level;

-- Count totals
SELECT 
  'TOTALS:' as info,
  (SELECT COUNT(*) FROM ai_peer_profiles WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP')) as peers,  -- ⚠️ REPLACE THIS (7/7)
  (SELECT COUNT(*) FROM knowledge_graph_nodes WHERE user_id = (SELECT id FROM user_profiles WHERE clerk_user_id = 'user_38guQSbezZv9dUfjROQ5WiOt1UP')) as nodes;
