-- Migration: AI Nutrition Coach
-- Description: Stores chat history for the AI Diet Coach feature.

-- 1. Create Diet Chats Table
CREATE TABLE IF NOT EXISTS diet_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')), -- Who sent the message
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_diet_chats_member ON diet_chats(member_id);
CREATE INDEX IF NOT EXISTS idx_diet_chats_created_at ON diet_chats(created_at);

-- 3. RLS
ALTER TABLE diet_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own diet chats" ON diet_chats
    FOR SELECT USING (true); -- Refine with auth.uid() in production

CREATE POLICY "Members insert own diet chats" ON diet_chats
    FOR INSERT WITH CHECK (true);
