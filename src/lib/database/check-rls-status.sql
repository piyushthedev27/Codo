-- Check RLS Status for All Tables
-- Run this to see which tables have RLS enabled and what policies exist

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
