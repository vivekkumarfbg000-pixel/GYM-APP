-- Migration: Advanced Gamification (Duels & Badges)

-- 1. Achievements (Badges) Table
CREATE TABLE IF NOT EXISTS member_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL, -- e.g., 'first_step', 'on_fire'
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}', -- Store specific details (e.g., date of streak)
    
    UNIQUE(member_id, badge_id) -- Only unlock once per member
);

-- 2. Update Challenges Table for Duels (1v1)
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS is_duel BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT NULL, -- 'pending', 'active', 'completed'
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES members(id);

-- RLS
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their own achievements" ON member_achievements
    FOR SELECT USING (auth.uid() = member_id OR member_id IN (
        -- Allow viewing others' badges for social profile (future)
        SELECT id FROM members
    ));

-- Grant access to service role for internal updates
