-- Upgrade Schema for Auth & Approval System (FIXED v2)

-- 1. Add Auth Columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS password text, 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member', -- 'admin' or 'member'
ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false, -- Approval status
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending'; -- 'Active', 'Pending', 'Rejected'

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- 3. Insert specific Gym Owner Admin (if not exists)
-- Added 'membership_type' and 'segment' to satisfy NOT NULL constraints
INSERT INTO members (name, email, phone, status, role, approved, password, membership_type, segment)
VALUES 
('Gym Owner', 'admin@gymflow.com', '9999999999', 'Active', 'admin', true, 'admin123', 'Staff', 'Elite')
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', approved = true, password = 'admin123', status = 'Active', membership_type = 'Staff';

-- 4. Update existing members to be active members (so current demo data works)
UPDATE members 
SET role = 'member', approved = true, password = 'password123', status = 'Active' 
WHERE role IS NULL OR role != 'admin';
