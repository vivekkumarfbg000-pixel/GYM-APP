-- Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'Walk-in',
    stage TEXT DEFAULT 'New Lead', -- 'New Lead', 'Contacted', 'Qualified', 'Trial', 'Negotiation', 'Won'
    score INTEGER DEFAULT 0,
    value NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public leads access" ON leads FOR ALL USING (true);


-- Create Gym Settings Table (Single Row expected)
CREATE TABLE IF NOT EXISTS gym_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_name TEXT DEFAULT 'My Gym',
    manager_name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    opening_time TEXT DEFAULT '05:00',
    closing_time TEXT DEFAULT '22:00',
    capacity INTEGER DEFAULT 100,
    
    -- Notification Preferences
    notif_churn_alerts BOOLEAN DEFAULT true,
    notif_new_signups BOOLEAN DEFAULT true,
    notif_payments BOOLEAN DEFAULT true,
    notif_low_stock BOOLEAN DEFAULT false,
    
    -- Integrations
    whatsapp_api_key TEXT,
    whatsapp_phone TEXT,
    razorpay_key_id TEXT,
    razorpay_secret TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for settings
ALTER TABLE gym_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings access" ON gym_settings FOR ALL USING (true);

-- Insert default settings if empty
INSERT INTO gym_settings (gym_name)
SELECT 'My Gym'
WHERE NOT EXISTS (SELECT 1 FROM gym_settings);
