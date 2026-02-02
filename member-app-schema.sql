-- Member App Schema Update

-- 1. Add Auth & Profile fields to existing members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS access_code TEXT, -- Simple login code for MVP
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS fitness_goal TEXT, -- weight_loss, muscle_gain, endurance
ADD COLUMN IF NOT EXISTS experience_level TEXT; -- beginner, intermediate, advanced

-- 2. Create Outdoor Workouts Table (for GPS logs)
CREATE TABLE IF NOT EXISTS outdoor_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL, -- running, cycling, walking
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    distance_meters DECIMAL DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    avg_speed_kmh DECIMAL DEFAULT 0,
    
    -- Store full route as JSONB array of points {lat, lng, timestamp, alt}
    route_data JSONB DEFAULT '[]'::JSONB,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_outdoor_workouts_member ON outdoor_workouts(member_id);
CREATE INDEX IF NOT EXISTS idx_outdoor_workouts_date ON outdoor_workouts(start_time);

-- 4. RLS Policies (Ensure members can only see their own workouts if auth used later)
ALTER TABLE outdoor_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for mvp" ON outdoor_workouts FOR ALL USING (true);
