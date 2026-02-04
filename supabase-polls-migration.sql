-- Migration: Interactive Polls for Community

-- 1. Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID REFERENCES members(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry
    is_active BOOLEAN DEFAULT true
);

-- 2. Poll Options
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Poll Votes (tracks who voted for what)
CREATE TABLE IF NOT EXISTS poll_votes (
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (poll_id, member_id) -- One vote per member per poll
);

-- 4. Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Allow all for MVP)
CREATE POLICY "Public read polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Public read poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Public read poll_votes" ON poll_votes FOR SELECT USING (true);

CREATE POLICY "Members can vote" ON poll_votes FOR INSERT WITH CHECK (true);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_member_id ON poll_votes(member_id);

-- 7. Function to vote on poll (handles vote count increment)
CREATE OR REPLACE FUNCTION vote_on_poll(
    p_poll_id UUID,
    p_member_id UUID,
    p_option_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_existing_vote UUID;
    v_result JSONB;
BEGIN
    -- Check if user already voted
    SELECT option_id INTO v_existing_vote
    FROM poll_votes
    WHERE poll_id = p_poll_id AND member_id = p_member_id;

    IF v_existing_vote IS NOT NULL THEN
        -- User already voted, update vote
        -- Decrement old option
        UPDATE poll_options
        SET votes_count = votes_count - 1
        WHERE id = v_existing_vote;

        -- Delete old vote
        DELETE FROM poll_votes
        WHERE poll_id = p_poll_id AND member_id = p_member_id;
    END IF;

    -- Insert new vote
    INSERT INTO poll_votes (poll_id, member_id, option_id)
    VALUES (p_poll_id, p_member_id, p_option_id);

    -- Increment new option
    UPDATE poll_options
    SET votes_count = votes_count + 1
    WHERE id = p_option_id;

    v_result := jsonb_build_object(
        'success', true,
        'message', 'Vote recorded'
    );

    RETURN v_result;
END;
$$;
