-- Dashboard Analytics Tables
-- These tables store analytics data for monitoring dashboard usage and performance

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS dashboard_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'hover', 'view', 'interaction', 'navigation')),
  component TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON dashboard_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON dashboard_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON dashboard_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_component ON dashboard_analytics_events(component);

-- Analytics Sessions Table
CREATE TABLE IF NOT EXISTS dashboard_analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  time_spent INTEGER NOT NULL, -- milliseconds
  components_viewed TEXT[] DEFAULT '{}',
  interactions_count INTEGER DEFAULT 0,
  navigation_path TEXT[] DEFAULT '{}',
  feature_usage JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON dashboard_analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_timestamp ON dashboard_analytics_sessions(timestamp DESC);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS dashboard_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  component TEXT NOT NULL,
  load_time NUMERIC(10, 2) DEFAULT 0, -- milliseconds
  render_time NUMERIC(10, 2) DEFAULT 0, -- milliseconds
  api_response_time NUMERIC(10, 2), -- milliseconds
  error_count INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON dashboard_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component ON dashboard_performance_metrics(component);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON dashboard_performance_metrics(timestamp DESC);

-- Errors Table
CREATE TABLE IF NOT EXISTS dashboard_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  component TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_dashboard_errors_user_id ON dashboard_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_errors_component ON dashboard_errors(component);
CREATE INDEX IF NOT EXISTS idx_dashboard_errors_timestamp ON dashboard_errors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_errors_resolved ON dashboard_errors(resolved);

-- Row Level Security Policies
ALTER TABLE dashboard_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_errors ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own analytics data
CREATE POLICY "Users can insert their own analytics events"
  ON dashboard_analytics_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own session data"
  ON dashboard_analytics_sessions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own performance metrics"
  ON dashboard_performance_metrics FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own errors"
  ON dashboard_errors FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Admin users can view all analytics data
-- Note: You'll need to implement admin role checking in your application
CREATE POLICY "Admins can view all analytics events"
  ON dashboard_analytics_events FOR SELECT
  USING (true); -- Modify this to check for admin role

CREATE POLICY "Admins can view all session data"
  ON dashboard_analytics_sessions FOR SELECT
  USING (true); -- Modify this to check for admin role

CREATE POLICY "Admins can view all performance metrics"
  ON dashboard_performance_metrics FOR SELECT
  USING (true); -- Modify this to check for admin role

CREATE POLICY "Admins can view all errors"
  ON dashboard_errors FOR SELECT
  USING (true); -- Modify this to check for admin role

-- Create a view for aggregated analytics
CREATE OR REPLACE VIEW dashboard_analytics_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
  COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE event_type = 'interaction') as total_interactions
FROM dashboard_analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Create a view for performance summary
CREATE OR REPLACE VIEW dashboard_performance_summary AS
SELECT
  component,
  COUNT(*) as sample_size,
  AVG(load_time) as avg_load_time,
  AVG(render_time) as avg_render_time,
  AVG(api_response_time) as avg_api_time,
  MAX(load_time) as max_load_time,
  MAX(render_time) as max_render_time,
  SUM(error_count) as total_errors
FROM dashboard_performance_metrics
GROUP BY component
ORDER BY avg_load_time DESC;

-- Create a view for error summary
CREATE OR REPLACE VIEW dashboard_error_summary AS
SELECT
  component,
  error_message,
  COUNT(*) as occurrence_count,
  MAX(timestamp) as last_occurred,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_count
FROM dashboard_errors
GROUP BY component, error_message
ORDER BY occurrence_count DESC;

-- Comments for documentation
COMMENT ON TABLE dashboard_analytics_events IS 'Stores individual user interaction events on the dashboard';
COMMENT ON TABLE dashboard_analytics_sessions IS 'Stores aggregated session-level engagement metrics';
COMMENT ON TABLE dashboard_performance_metrics IS 'Stores component performance measurements';
COMMENT ON TABLE dashboard_errors IS 'Stores error occurrences for monitoring and debugging';
COMMENT ON VIEW dashboard_analytics_summary IS 'Daily aggregated analytics metrics';
COMMENT ON VIEW dashboard_performance_summary IS 'Component-level performance summary';
COMMENT ON VIEW dashboard_error_summary IS 'Error occurrence summary by component';
