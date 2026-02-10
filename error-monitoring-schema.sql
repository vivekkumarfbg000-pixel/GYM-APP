-- Error Logging and Monitoring Schema

-- Table for application logs
CREATE TABLE IF NOT EXISTS app_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID REFERENCES members(id) ON DELETE SET NULL,
    error_stack TEXT,
    url TEXT,
    method VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_logs_url ON app_logs(url) WHERE url IS NOT NULL;

-- Add retention policy comment (implement cleanup separately)
COMMENT ON TABLE app_logs IS 'Application logs with 30-day retention policy';

-- Table for performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    duration_ms INTEGER NOT NULL,
    status_code INTEGER,
    user_id UUID REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_perf_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_duration ON performance_metrics(duration_ms DESC);

-- View for error summary
CREATE OR REPLACE VIEW error_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    level,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users
FROM app_logs
WHERE level IN ('error', 'warn')
    AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour, level
ORDER BY hour DESC;

-- View for slow endpoints
CREATE OR REPLACE VIEW slow_endpoints AS
SELECT 
    endpoint,
    method,
    AVG(duration_ms) as avg_duration,
    MAX(duration_ms) as max_duration,
    COUNT(*) as request_count
FROM performance_metrics
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint, method
HAVING AVG(duration_ms) > 1000  -- Slower than 1 second
ORDER BY avg_duration DESC;

-- Function to clean old logs (run via cron job)
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM app_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM performance_metrics 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT ON app_logs TO anon, authenticated;
GRANT SELECT, INSERT ON performance_metrics TO anon, authenticated;
GRANT SELECT ON error_summary TO authenticated;
GRANT SELECT ON slow_endpoints TO authenticated;
