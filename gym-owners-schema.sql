-- GymFlow AI: Multi-Gym Architecture Migration
-- Run this in your Supabase SQL Editor to enable multiple gyms with password-based member connections

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create gym_owners table
CREATE TABLE IF NOT EXISTS gym_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    age INTEGER,
    gym_name VARCHAR(255),
    gym_password VARCHAR(50) UNIQUE NOT NULL,
    auth_user_id UUID, -- Link to Supabase Auth user if using Auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add gym_owner_id and age to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS gym_owner_id UUID REFERENCES gym_owners(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_owners_email ON gym_owners(email);
CREATE INDEX IF NOT EXISTS idx_gym_owners_gym_password ON gym_owners(gym_password);
CREATE INDEX IF NOT EXISTS idx_gym_owners_auth_user ON gym_owners(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_owner ON members(gym_owner_id);

-- 4. Create updated_at trigger for gym_owners
-- 4. Create updated_at trigger for gym_owners
-- Safely drop first to avoid "already exists" error
DROP TRIGGER IF EXISTS update_gym_owners_updated_at ON gym_owners;

CREATE TRIGGER update_gym_owners_updated_at 
BEFORE UPDATE ON gym_owners 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security on gym_owners
ALTER TABLE gym_owners ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for gym_owners (allow all for now, will refine later)
-- 6. Create RLS policies for gym_owners (allow all for now, will refine later)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all operations on gym_owners" ON gym_owners;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Allow all operations on gym_owners" ON gym_owners FOR ALL USING (true) WITH CHECK (true);

-- 7. Update policies for members table to support multi-gym
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all operations on members" ON members;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Drop new policies if they exist to allow recreation
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Gym owners can manage their members" ON members;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create gym-aware policies for members
-- Gym owners can see and manage their members
CREATE POLICY "Gym owners can manage their members" ON members
FOR ALL
USING (
    gym_owner_id IN (
        SELECT id FROM gym_owners WHERE auth_user_id = auth.uid()
    )
    OR
    -- Members can see themselves
    auth.uid() IN (SELECT auth_user_id FROM gym_owners WHERE id = members.gym_owner_id)
);

-- 8. Create a default gym owner for existing members (Migration Support)
-- This ensures existing data continues to work
INSERT INTO gym_owners (name, email, phone, gym_name, gym_password, age)
VALUES (
    'Demo Gym Owner',
    'admin@gymflow.com',
    '9999999999',
    'Demo Gym',
    'DEMO2024',
    35
)
ON CONFLICT (email) DO NOTHING;

-- 9. Link existing members to the default gym owner
UPDATE members
SET gym_owner_id = (SELECT id FROM gym_owners WHERE email = 'admin@gymflow.com')
WHERE gym_owner_id IS NULL;

-- 10. Comment on tables for documentation
COMMENT ON TABLE gym_owners IS 'Stores gym owner accounts with unique gym passwords for member registration';
COMMENT ON COLUMN gym_owners.gym_password IS 'Unique password that members use to join this gym during registration';
COMMENT ON COLUMN members.gym_owner_id IS 'Foreign key linking member to their gym owner for data isolation';

-- Migration complete! 
-- Next steps:
-- 1. Verify gym_owners table exists in Supabase dashboard
-- 2. Check that existing members are linked to default gym owner
-- 3. Update application code to use new schema
