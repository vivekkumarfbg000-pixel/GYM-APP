-- Phase 9: Multi-Gym & Trainer Command Center Schema

-- 1. Create Gyms Table
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    owner_id UUID REFERENCES auth.users(id), -- Link to the user who owns this gym
    branding_color VARCHAR(50) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Insert Default Gym (Migration Step)
-- We insert a default gym so existing data can be linked to it.
INSERT INTO gyms (id, name, address)
VALUES ('00000000-0000-0000-0000-000000000000', 'Main Branch', 'Default Location')
ON CONFLICT (id) DO NOTHING;

-- 3. Add gym_id to Core Tables
DO $$
BEGIN
    -- Members
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'gym_id') THEN
        ALTER TABLE members ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Trainers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'gym_id') THEN
        ALTER TABLE trainers ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Attendance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'gym_id') THEN
        ALTER TABLE attendance ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Classes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'gym_id') THEN
        ALTER TABLE classes ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Leads
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'gym_id') THEN
        ALTER TABLE leads ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gym_id') THEN
        ALTER TABLE products ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Campaigns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'gym_id') THEN
        ALTER TABLE campaigns ADD COLUMN gym_id UUID REFERENCES gyms(id) DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- 4. Update Trainers Table (Enriched Profile)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'hourly_rate') THEN
        ALTER TABLE trainers ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'commission_rate') THEN
        ALTER TABLE trainers ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'bio') THEN
        ALTER TABLE trainers ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'availability') THEN
        ALTER TABLE trainers ADD COLUMN availability JSONB DEFAULT '[]'; -- e.g. ["Mon 9-5", "Tue 9-5"]
    END IF;
    
    -- Handle image upgrade if not present
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'avatar_url') THEN
        ALTER TABLE trainers ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 5. Create PT Packages Table
CREATE TABLE IF NOT EXISTS pt_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    session_count INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER DEFAULT 30,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create PT Sessions Table
CREATE TABLE IF NOT EXISTS pt_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) NOT NULL,
    trainer_id UUID REFERENCES trainers(id) NOT NULL,
    member_id UUID REFERENCES members(id) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no-show
    price_at_booking DECIMAL(10,2), -- Snapshot of price/rate
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Add RLS Policies for New Tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;

-- Simple policies for now (Allow all authenticated for MVP, refine later)
CREATE POLICY "Allow all authenticated to view gyms" ON gyms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all authenticated to view packages" ON pt_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated to view sessions" ON pt_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pt_sessions_trainer ON pt_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_pt_sessions_member ON pt_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_pt_sessions_start_time ON pt_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
