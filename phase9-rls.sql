-- Phase 9: Multi-Gym RLS Policies

-- 1. Enable RLS on all relevant tables (if not already enabled)
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;

-- 2. Create Helper Function to get current user's gym_id
-- This assumes we store the gym_id in the gym_owners table linked to auth.uid()
-- OR we might rely on a claim. For now, we'll do a lookup.

CREATE OR REPLACE FUNCTION get_my_gym_id()
RETURNS UUID AS $$
DECLARE
  v_gym_id UUID;
BEGIN
  -- Check if user is a gym owner and get their gym (via gyms table owner_id)
  SELECT id INTO v_gym_id
  FROM gyms
  WHERE owner_id = auth.uid()
  LIMIT 1;
  
  RETURN v_gym_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policies for Gym Owners (Full Access to their own gym data)

-- GYMS
CREATE POLICY "Owners can view their own gym"
ON gyms
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own gym"
ON gyms
FOR UPDATE
USING (auth.uid() = owner_id);

-- MEMBERS
CREATE POLICY "Owners can view their gym members"
ON members
FOR ALL
USING (gym_id = get_my_gym_id());

-- TRAINERS
CREATE POLICY "Owners can manage their trainers"
ON trainers
FOR ALL
USING (gym_id = get_my_gym_id());

-- ATTENDANCE
CREATE POLICY "Owners can view their gym attendance"
ON attendance
FOR ALL
USING (gym_id = get_my_gym_id());

-- CLASSES
CREATE POLICY "Owners can manage their classes"
ON classes
FOR ALL
USING (gym_id = get_my_gym_id());

-- LEADS
CREATE POLICY "Owners can manage their leads"
ON leads
FOR ALL
USING (gym_id = get_my_gym_id());

-- PRODUCTS
CREATE POLICY "Owners can manage their products"
ON products
FOR ALL
USING (gym_id = get_my_gym_id());

-- CAMPAIGNS
CREATE POLICY "Owners can manage their campaigns"
ON campaigns
FOR ALL
USING (gym_id = get_my_gym_id());

-- PT SESSIONS
CREATE POLICY "Owners can manage PT sessions"
ON pt_sessions
FOR ALL
USING (gym_id = get_my_gym_id());

-- PT PACKAGES
CREATE POLICY "Owners can manage PT packages"
ON pt_packages
FOR ALL
USING (gym_id = get_my_gym_id());


-- 4. Policies for Members/Public (Restricted Access)
-- Members should only see their own data or public gym data

-- Allow members to view the gym they belong to
CREATE POLICY "Members can view their gym details"
ON gyms
FOR SELECT
USING (
  id IN (
    SELECT gym_id FROM members WHERE email = auth.jwt() ->> 'email'
  )
);

-- Note: We are using a simple lookup here. In production, we might use claims.
