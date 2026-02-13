-- Community & Gamification Migration
-- WARNING: This will drop existing community tables to ensure fresh schema.
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- 1. POSTS (Feed)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    type TEXT DEFAULT 'regular', -- 'regular', 'ai', 'owner'
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. POST LIKES
-- 2. POST REACTIONS (Replaced Likes)
CREATE TABLE IF NOT EXISTS post_reactions (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like', -- 'like', 'fire', 'muscle', 'trophy'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, member_id)
);

-- Add AI Analysis column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'ai_analysis') THEN
        ALTER TABLE posts ADD COLUMN ai_analysis TEXT;
    END IF;
END $$;

-- 3. POST COMMENTS
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. POLLS
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    created_by TEXT DEFAULT 'GymFlow',
    total_votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 5. POLL OPTIONS
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0
);

-- 6. POLL VOTES (To prevent double voting)
CREATE TABLE IF NOT EXISTS poll_votes (
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (poll_id, member_id)
);

-- 7. CHALLENGES (Groups & Duels)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT, -- 'calories', 'workouts', 'steps'
    goal_target INTEGER,
    start_date DATE,
    end_date DATE,
    participants_count INTEGER DEFAULT 0,
    image_url TEXT,
    is_duel BOOLEAN DEFAULT FALSE,
    creator_id UUID REFERENCES members(id) ON DELETE SET NULL,
    opponent_id UUID REFERENCES members(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES members(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'pending', 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CHALLENGE PARTICIPANTS
CREATE TABLE IF NOT EXISTS challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (challenge_id, member_id)
);

-- Helper function to increment likes/comments/votes
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, table_name TEXT, col_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, col_name, col_name) USING row_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Simplified for prototype)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts access" ON posts FOR ALL USING (true);
CREATE POLICY "Public likes access" ON post_likes FOR ALL USING (true);
CREATE POLICY "Public comments access" ON post_comments FOR ALL USING (true);
CREATE POLICY "Public polls access" ON polls FOR ALL USING (true);
CREATE POLICY "Public poll options access" ON poll_options FOR ALL USING (true);
CREATE POLICY "Public poll votes access" ON poll_votes FOR ALL USING (true);
CREATE POLICY "Public challenges access" ON challenges FOR ALL USING (true);
CREATE POLICY "Public challenge participants access" ON challenge_participants FOR ALL USING (true);

-- SEED SOME POLLS
INSERT INTO polls (question, created_by) VALUES 
('What is your favorite workout time?', 'Gym Team'),
('Which class should we add next?', 'Management');

DO $$
DECLARE
    p1_id UUID;
    p2_id UUID;
BEGIN
    SELECT id INTO p1_id FROM polls WHERE question = 'What is your favorite workout time?' LIMIT 1;
    SELECT id INTO p2_id FROM polls WHERE question = 'Which class should we add next?' LIMIT 1;

    INSERT INTO poll_options (poll_id, text) VALUES 
    (p1_id, 'Early Morning (5-8 AM)'),
    (p1_id, 'Lunch Break (12-2 PM)'),
    (p1_id, 'Evening (6-9 PM)'),
    (p2_id, 'Zumba'),
    (p2_id, 'Kickboxing'),
    (p2_id, 'Yoga');
END $$;
