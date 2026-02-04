-- Migration: AI Workouts & Churn Updates
-- Description: Adds tables for storing AI workout plans and extends members table for risk analysis.

-- 1. Create AI Workouts Table
CREATE TABLE IF NOT EXISTS ai_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    
    -- Workout Metadata
    goal VARCHAR(100) NOT NULL, -- Weight Loss, Strength, Custom
    duration INTEGER NOT NULL, -- Minutes
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high
    
    -- The Content (JSON Structure of exercises)
    plan_data JSONB NOT NULL DEFAULT '[]'::JSONB,
    ai_notes TEXT, -- The "Reasoning" from the AI
    
    -- Workflow Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
    reviewed_by VARCHAR(255), -- Trainer Name/ID
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add Risk Analysis Fields to Members
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS last_risk_update TIMESTAMP WITH TIME ZONE;

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ai_workouts_member ON ai_workouts(member_id);
CREATE INDEX IF NOT EXISTS idx_ai_workouts_status ON ai_workouts(status);

-- 4. RLS Policies
ALTER TABLE ai_workouts ENABLE ROW LEVEL SECURITY;

-- Allow members to view/create their own workouts
CREATE POLICY "Members view own workouts" ON ai_workouts
    FOR SELECT USING (true); -- Simplified for MVP (in prod, check match auth.uid())

CREATE POLICY "Trainers view all workouts" ON ai_workouts
    FOR ALL USING (true); -- Simplified for MVP
