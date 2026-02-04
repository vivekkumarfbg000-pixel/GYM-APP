-- Migration: AI Diet Plans

CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- Plan Metadata
    goal VARCHAR(50) NOT NULL, -- 'weight_loss', 'gain', 'maintain'
    diet_type VARCHAR(50) NOT NULL, -- 'veg', 'non_veg', 'vegan', 'keto'
    calories_target INTEGER,
    
    -- Structure: { "Monday": { "breakfast": "...", "lunch": "...", ... }, ... }
    plan_data JSONB NOT NULL,
    
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own diet plans" ON diet_plans
    USING (auth.uid() = member_id)
    WITH CHECK (auth.uid() = member_id);

-- Add helper to ensure one active plan per user (optional, can be done in app logic)
-- For now, app logic will handle archiving old plans when creating new one.
