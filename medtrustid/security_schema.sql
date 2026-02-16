-- Security Infrastructure Tables

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    message TEXT NOT NULL,
    source_ip VARCHAR(45),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'FalsePositive')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
    ip_address VARCHAR(45) PRIMARY KEY,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);

-- Enable RLS
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- Policies for security_alerts
-- Staff can view all alerts
CREATE POLICY "Staff can view all security alerts" ON security_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

-- System (service role) can insert alerts
-- Note: Service role bypasses RLS, but if we use a client with RLS, we need this.
-- For now, we assume the backend uses service role or we allow authenticated users to trigger alerts via API (less secure).
-- Better: Backend uses service role key.

-- Policies for blocked_ips
-- Staff can view blocked IPs
CREATE POLICY "Staff can view blocked IPs" ON blocked_ips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );
