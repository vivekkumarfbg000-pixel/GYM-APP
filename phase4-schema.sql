-- Check-ins table for real-time tracking
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    gym_owner_id UUID NOT NULL REFERENCES gym_owners(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMP,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN check_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 60
            ELSE NULL
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_check_ins_member ON check_ins(member_id);
CREATE INDEX idx_check_ins_gym_owner ON check_ins(gym_owner_id);
CREATE INDEX idx_check_ins_time ON check_ins(check_in_time);
CREATE INDEX idx_check_ins_active ON check_ins(gym_owner_id) WHERE check_out_time IS NULL;

-- Badges table for achievement system
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon name
    criteria JSONB NOT NULL, -- e.g., {"type": "workouts", "count": 10}
    tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
    created_at TIMESTAMP DEFAULT NOW()
);

-- Member badges (unlocked achievements)
CREATE TABLE IF NOT EXISTS member_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(member_id, badge_id)
);

CREATE INDEX idx_member_badges_member ON member_badges(member_id);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_owner_id UUID REFERENCES gym_owners(id) ON DELETE CASCADE,
    name VARCHAR(200),
    description TEXT,
    type VARCHAR(50), -- 'workouts', 'steps', 'streak'
    target_value INTEGER,
    start_date DATE,
    end_date DATE,
    prize_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Safely add columns if they don't exist (handling migration from gamification-schema.sql)
DO $$
BEGIN
    -- Add gym_owner_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'gym_owner_id') THEN
        ALTER TABLE challenges ADD COLUMN gym_owner_id UUID REFERENCES gym_owners(id) ON DELETE CASCADE;
    END IF;

    -- Add other Phase 4 specific columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'target_value') THEN
        ALTER TABLE challenges ADD COLUMN target_value INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'type') THEN
        ALTER TABLE challenges ADD COLUMN type VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'prize_description') THEN
        ALTER TABLE challenges ADD COLUMN prize_description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'is_active') THEN
        ALTER TABLE challenges ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Rename title to name if name doesn't exist but title does
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'title') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'name') THEN
        ALTER TABLE challenges RENAME COLUMN title TO name;
    END IF;

    -- Handle goal_target to target_value migration
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'goal_target') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'target_value') THEN
        ALTER TABLE challenges RENAME COLUMN goal_target TO target_value;
    END IF;

    -- Handle goal_type to type migration
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'goal_type') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'type') THEN
        ALTER TABLE challenges RENAME COLUMN goal_type TO type;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenges_gym ON challenges(gym_owner_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, end_date);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(challenge_id, member_id)
);

-- Handle participants table updates
DO $$
BEGIN
    -- Add current_progress if missing (it was 'progress' in old schema)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenge_participants' AND column_name = 'progress') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenge_participants' AND column_name = 'current_progress') THEN
        ALTER TABLE challenge_participants RENAME COLUMN progress TO current_progress;
    END IF;

    -- Add completed_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenge_participants' AND column_name = 'completed_at') THEN
        ALTER TABLE challenge_participants ADD COLUMN completed_at TIMESTAMP;
    END IF;

    -- Add ID primary key if it was composite
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenge_participants' AND column_name = 'id') THEN
        ALTER TABLE challenge_participants ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_member ON challenge_participants(member_id);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES members(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, rewarded
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- Staff table for multi-user access
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_owner_id UUID NOT NULL REFERENCES gym_owners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'receptionist', -- admin, trainer, receptionist
    permissions JSONB, -- {"can_view_analytics": true, "can_manage_members": false}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_gym ON staff(gym_owner_id);
CREATE INDEX idx_staff_email ON staff(email);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_owner_id UUID NOT NULL REFERENCES gym_owners(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- cardio, strength, etc.
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status VARCHAR(50) DEFAULT 'operational', -- operational, under_maintenance, out_of_order
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_equipment_gym ON equipment(gym_owner_id);
CREATE INDEX idx_equipment_maintenance ON equipment(next_maintenance_date) WHERE status = 'operational';

-- Seed initial badges
INSERT INTO badges (name, description, icon, criteria, tier) VALUES
('First Workout', 'Complete your first workout', '🎯', '{"type": "workouts", "count": 1}', 'bronze'),
('Week Warrior', '7-day workout streak', '🔥', '{"type": "streak", "count": 7}', 'silver'),
('Century Club', 'Complete 100 workouts', '💯', '{"type": "workouts", "count": 100}', 'gold'),
('Early Bird', 'Check-in before 6 AM', '🌅', '{"type": "early_checkin", "hour": 6}', 'bronze'),
('Night Owl', 'Workout after 9 PM', '🦉', '{"type": "late_workout", "hour": 21}', 'bronze'),
('Social Butterfly', 'Make 10 community posts', '🦋', '{"type": "posts", "count": 10}', 'silver')
ON CONFLICT DO NOTHING;
