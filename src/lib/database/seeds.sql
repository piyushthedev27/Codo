-- Codo Database Seeding Script
-- This file contains initial data for the database, replacing previous code-based mock data.

-- 1. Seed coaching_responses
INSERT INTO coaching_responses (keyword, response, category)
VALUES 
('for loop', 'In modern JavaScript, methods like .map() or .filter() are often preferred over for loops for better readability.', 'code-style'),
('async await', 'Async/await makes your asynchronous code look synchronous while remaining non-blocking. It''s very powerful!', 'async'),
('useState', 'The useState hook is essential for managing component state. It triggers a re-render when the state changes.', 'react'),
('function', 'Functions are the core of logic. Arrow functions are great for simple tasks, while regular functions are useful for complex logic.', 'javascript'),
('debug', 'Debugging is part of the process! Try using console.log() or the browser debugger to trace your code flow.', 'tools'),
('error', 'Errors tell us where to look. Check the console for a line number to find the issue quickly.', 'tools'),
('help', 'I''m here to assist! Ask me to explain code, suggest improvements, or find potential bugs.', 'general'),
('optimize', 'Focus on readability first. Once it''s working well, we can look at ways to make it faster or more efficient.', 'general'),
('hint', 'Try breaking the problem into smaller, manageable pieces. It''s much easier to solve bit by bit.', 'general'),
('default', 'That''s an interesting question! Based on what you''re doing, I''d suggest focusing on the core logic first.', 'general')
ON CONFLICT (keyword) DO NOTHING;

-- 2. Seed AI Peer Profiles (Global Templates)
INSERT INTO ai_peer_profiles (id, name, personality, skill_level, avatar_url, interaction_style)
VALUES 
('c0a80101-0000-0000-0000-000000000001', 'Sarah', 'curious', 'intermediate', '/avatars/sarah.png', 'Enthusiastic and loves modern JS features.'),
('c0a80101-0000-0000-0000-000000000002', 'Alex', 'analytical', 'advanced', '/avatars/alex.png', 'Methodical and focuses on edge cases.'),
('c0a80101-0000-0000-0000-000000000003', 'Jordan', 'supportive', 'beginner', '/avatars/jordan.png', 'Encouraging and focuses on building confidence.')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Learning Tracks
INSERT INTO learning_tracks (id, name, description, category, difficulty_level, total_lessons, display_order)
VALUES 
('t0000001-0000-0000-0000-000000000001', 'React Mastery', 'Master modern React from hooks to architectural patterns.', 'frontend', 'intermediate', 12, 1),
('t0000001-0000-0000-0000-000000000002', 'Fullstack Fundamentals', 'Build complete applications with Next.js and Supabase.', 'fullstack', 'beginner', 8, 2),
('t0000001-0000-0000-0000-000000000003', 'Algorithms & DS', 'Strengthen your problem-solving skills with core algorithms.', 'theory', 'advanced', 15, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Track Milestones
INSERT INTO track_milestones (track_id, title, description, milestone_order, required_lessons, xp_reward)
VALUES 
('t0000001-0000-0000-0000-000000000001', 'Hook Hero', 'Complete the first 5 lessons on React Hooks.', 1, 5, 250),
('t0000001-0000-0000-0000-000000000001', 'React Architect', 'Finish the entire React Mastery track.', 2, 12, 1000)
ON CONFLICT DO NOTHING;

-- 5. Seed Initial Activity Achievements
INSERT INTO activity_achievements (name, description, category, tier, criteria_type, criteria_value, xp_reward)
VALUES 
('Early Bird', 'Completed your first lesson!', 'onboarding', 'bronze', 'lessons_completed', 1, 100),
('Streak Starter', 'Maintained a 3-day learning streak.', 'streak', 'bronze', 'streak', 3, 200),
('Code Master', 'Completed 10 challenges with 100% accuracy.', 'challenges', 'silver', 'challenges_completed', 10, 500)
ON CONFLICT (name) DO NOTHING;
