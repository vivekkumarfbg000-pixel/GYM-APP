-- Migration: Gamification & Community
-- Description: Adds tables for social feed, challenges, and user gamification stats.

-- 1. Posts (Community Feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'distance', 'workouts', 'calories'
  goal_target INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (challenge_id, member_id)
);

-- 4. Update Members for Gamification
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- 5. RLS Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Public read access for community features
CREATE POLICY "Read all posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Read all challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Read all participants" ON challenge_participants FOR SELECT USING (true);

-- Insert access for members
CREATE POLICY "Members create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Members join challenges" ON challenge_participants FOR INSERT WITH CHECK (true);

-- 6. Seed Initial Data (Safe Insert)
INSERT INTO challenges (title, description, goal_type, goal_target, start_date, end_date)
SELECT '30-Day Runner', 'Run 50km in 30 days to unlock the Gold Runner Badge!', 'distance', 50000, NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = '30-Day Runner');

INSERT INTO challenges (title, description, goal_type, goal_target, start_date, end_date)
SELECT 'Iron Lifter', 'Complete 20 strength workouts this month.', 'workouts', 20, NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Iron Lifter');
