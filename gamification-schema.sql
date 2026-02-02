-- Gamification & Community Tables

-- 1. Posts (Community Feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'distance', 'workouts', 'calories'
  goal_target INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INT DEFAULT 0,
  image_url TEXT
);

-- 3. Challenge Participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
  member_id UUID REFERENCES public.members(id) NOT NULL,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (challenge_id, member_id)
);

-- 4. Update Members for Gamification
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

-- Seed some challenges (Use Insert if not exists roughly)
INSERT INTO public.challenges (title, description, goal_type, goal_target, start_date, end_date)
VALUES 
('30-Day Runner', 'Run 50km in 30 days to unlock the Gold Runner Badge!', 'distance', 50000, NOW(), NOW() + INTERVAL '30 days'),
('Iron Lifter', 'Complete 20 strength workouts this month.', 'workouts', 20, NOW(), NOW() + INTERVAL '30 days');
