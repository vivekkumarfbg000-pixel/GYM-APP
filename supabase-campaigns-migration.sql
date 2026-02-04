-- Migration: Smart Campaigns
-- Description: Stores marketing campaigns and metrics.

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    segment TEXT NOT NULL,
    message_template TEXT NOT NULL,
    response_rate DECIMAL(5,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    sent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns" ON campaigns
    USING (true)
    WITH CHECK (true);
