-- Additional Security Enhancements for Codo Database
-- Run this after the basic RLS setup for enhanced security

-- Create a helper function to check if user is admin (optional)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- For now, return false. Later you can implement admin role checking
  -- Example: SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = $1)
  SELECT false;
$$;

-- Revoke execute permission from public roles for security
REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM anon, authenticated;

-- More restrictive challenge policies (if needed)
-- Uncomment these if you want stricter control over challenges

-- Drop the existing policies if you want to replace them
-- DROP POLICY IF EXISTS "Authenticated users can read challenges" ON challenges;
-- DROP POLICY IF EXISTS "Anonymous users can read active challenges" ON challenges;

-- More restrictive: Only allow reading challenges that are both active AND published
-- CREATE POLICY "Users can read published challenges" ON challenges
--   FOR SELECT TO authenticated, anon
--   USING (is_active = true AND published = true);

-- Add audit logging for sensitive operations (optional)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read audit logs
CREATE POLICY "Only service role can access audit logs" ON audit_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log for important tables
  IF TG_TABLE_NAME IN ('user_profiles', 'challenges', 'challenge_attempts') THEN
    INSERT INTO audit_log (
      table_name,
      operation,
      user_id,
      old_data,
      new_data
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      COALESCE(auth.uid()::text, 'system'),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to important tables (uncomment if you want audit logging)
-- CREATE TRIGGER audit_user_profiles
--   AFTER INSERT OR UPDATE OR DELETE ON user_profiles
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- CREATE TRIGGER audit_challenges
--   AFTER INSERT OR UPDATE OR DELETE ON challenges
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Performance indexes for RLS policies
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id_active ON user_profiles(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_peer_profiles_user_id_active ON ai_peer_profiles(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_graph_nodes_user_status ON knowledge_graph_nodes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_status ON challenge_attempts(user_id, status);

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_peer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_graph_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mistake_patterns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON learning_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON challenge_attempts TO authenticated;

-- Grant limited permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON challenges TO anon;

-- Security best practices reminder comments:
-- 1. Regularly review and update RLS policies
-- 2. Test policies with different user roles
-- 3. Monitor audit logs for suspicious activity
-- 4. Keep indexes updated for policy performance
-- 5. Use SECURITY DEFINER functions for complex logic
-- 6. Always test in staging before production deployment