-- Fix Connectivity & Security Migration
-- 1. Secure Row Level Security (RLS)
-- Drop existing insecure policies if they exist (handling potential naming conflicts)
DROP POLICY IF EXISTS "Public access for mvp" ON outdoor_workouts;
DROP POLICY IF EXISTS "Members view own workouts" ON ai_workouts;
DROP POLICY IF EXISTS "Trainers view all workouts" ON ai_workouts;
DROP POLICY IF EXISTS "Allow all operations on members" ON members;

-- Enable RLS (idempotent)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workouts ENABLE ROW LEVEL SECURITY;

-- Drop new policies if they exist (to ensure idempotency)
DROP POLICY IF EXISTS "Members view own profile" ON members;
DROP POLICY IF EXISTS "Members update own profile" ON members;
DROP POLICY IF EXISTS "Members view own outdoor workouts" ON outdoor_workouts;
DROP POLICY IF EXISTS "Members insert own outdoor workouts" ON outdoor_workouts;
DROP POLICY IF EXISTS "Members view own ai workouts" ON ai_workouts;
DROP POLICY IF EXISTS "Members update own ai workouts" ON ai_workouts;

-- Create Strict Policies
-- Members can only see their own profile
CREATE POLICY "Members view own profile" ON members
    FOR SELECT USING (auth.uid() = id);

-- Members can update their own profile
CREATE POLICY "Members update own profile" ON members
    FOR UPDATE USING (auth.uid() = id);

-- Members can view their own outdoor workouts
CREATE POLICY "Members view own outdoor workouts" ON outdoor_workouts
    FOR SELECT USING (auth.uid() = member_id);

-- Members can insert their own outdoor workouts
CREATE POLICY "Members insert own outdoor workouts" ON outdoor_workouts
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Members can view their own AI workouts
CREATE POLICY "Members view own ai workouts" ON ai_workouts
    FOR SELECT USING (auth.uid() = member_id);

-- Members can update their own AI workouts (e.g. marking as complete)
CREATE POLICY "Members update own ai workouts" ON ai_workouts
    FOR UPDATE USING (auth.uid() = member_id);

-- 2. Gamification Triggers (Auto-update Points & Stats)

-- Function to update stats
CREATE OR REPLACE FUNCTION update_member_stats_after_workout()
RETURNS TRIGGER AS $$
DECLARE
    points_to_add INTEGER;
BEGIN
    -- Determine points based on table
    IF TG_TABLE_NAME = 'outdoor_workouts' THEN
        points_to_add := 20; -- More points for cardio/outdoor
    ELSIF TG_TABLE_NAME = 'ai_workouts' THEN
        -- Only award points if status changed to completed
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
            points_to_add := 15;
        ELSE
            RETURN NEW; -- No points for non-completion updates
        END IF;
    ELSE
        points_to_add := 10;
    END IF;

    -- Update Member Stats
    UPDATE members
    SET 
        total_workouts = COALESCE(total_workouts, 0) + 1,
        points = COALESCE(points, 0) + points_to_add,
        last_check_in = NOW(),
        -- Simple Leveling Logic: Level up every 100 points
        level = 1 + FLOOR((COALESCE(points, 0) + points_to_add) / 100)
    WHERE id = NEW.member_id;

    -- Update Challenge Progress
    UPDATE challenge_participants cp
    SET progress = cp.progress + 
        CASE 
            WHEN c.goal_type = 'workouts' THEN 1
            WHEN c.goal_type = 'distance' AND TG_TABLE_NAME = 'outdoor_workouts' THEN COALESCE(NEW.distance_meters, 0)
            WHEN c.goal_type = 'calories' AND TG_TABLE_NAME = 'outdoor_workouts' THEN COALESCE(NEW.calories_burned, 0)
            WHEN c.goal_type = 'calories' AND TG_TABLE_NAME = 'ai_workouts' THEN (COALESCE(NEW.duration, 0) * 6) -- Est. 6 cal/min
            ELSE 0 
        END,
        -- Check if completed
        completed = (cp.progress + 
            CASE 
                WHEN c.goal_type = 'workouts' THEN 1
                WHEN c.goal_type = 'distance' AND TG_TABLE_NAME = 'outdoor_workouts' THEN COALESCE(NEW.distance_meters, 0)
                WHEN c.goal_type = 'calories' AND TG_TABLE_NAME = 'outdoor_workouts' THEN COALESCE(NEW.calories_burned, 0)
                WHEN c.goal_type = 'calories' AND TG_TABLE_NAME = 'ai_workouts' THEN (COALESCE(NEW.duration, 0) * 6)
                ELSE 0 
            END) >= c.goal_target
    FROM challenges c
    WHERE cp.challenge_id = c.id
    AND cp.member_id = NEW.member_id
    AND c.start_date <= NOW() 
    AND c.end_date >= NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Outdoor Workouts (Insert)
DROP TRIGGER IF EXISTS trigger_update_stats_outdoor ON outdoor_workouts;
CREATE TRIGGER trigger_update_stats_outdoor
AFTER INSERT ON outdoor_workouts
FOR EACH ROW
EXECUTE FUNCTION update_member_stats_after_workout();

-- Trigger for AI Workouts (Update - when marked completed)
DROP TRIGGER IF EXISTS trigger_update_stats_ai ON ai_workouts;
CREATE TRIGGER trigger_update_stats_ai
AFTER UPDATE ON ai_workouts
FOR EACH ROW
EXECUTE FUNCTION update_member_stats_after_workout();
