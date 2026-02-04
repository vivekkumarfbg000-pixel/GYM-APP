-- Migration: Gamification V2 (Streaks)

-- 1. Add Streak Columns to Members Table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_longest INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. Function to Update Streak
-- This logic handles the daily streak calculation
CREATE OR REPLACE FUNCTION update_member_streak(p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
    v_result JSONB;
BEGIN
    -- Get current state
    SELECT last_activity_date, streak_current, streak_longest
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM members
    WHERE id = p_member_id;

    -- If no record found
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Member not found');
    END IF;

    -- Initial state handling
    IF v_current_streak IS NULL THEN v_current_streak := 0; END IF;
    IF v_longest_streak IS NULL THEN v_longest_streak := 0; END IF;

    -- Logic
    IF v_last_date = v_today THEN
        -- Already active today, do nothing
        v_result := jsonb_build_object(
            'status', 'maintained',
            'streak', v_current_streak,
            'message', 'Already active today!'
        );
    ELSIF v_last_date = v_yesterday THEN
        -- Active yesterday, increment streak
        v_current_streak := v_current_streak + 1;
        
        -- Update longest if needed
        IF v_current_streak > v_longest_streak THEN
            v_longest_streak := v_current_streak;
        END IF;

        UPDATE members 
        SET streak_current = v_current_streak,
            streak_longest = v_longest_streak,
            last_activity_date = v_today
        WHERE id = p_member_id;

        v_result := jsonb_build_object(
            'status', 'increased',
            'streak', v_current_streak,
            'message', 'Streak increased!'
        );
    ELSE
        -- Missed a day or more (or first time), reset to 1
        v_current_streak := 1;
        -- If first time ever
        IF v_longest_streak = 0 THEN v_longest_streak := 1; END IF;

        UPDATE members 
        SET streak_current = v_current_streak,
            streak_longest = v_longest_streak, -- Don't reset longest
            last_activity_date = v_today
        WHERE id = p_member_id;

        v_result := jsonb_build_object(
            'status', 'reset',
            'streak', v_current_streak,
            'message', 'Streak started!'
        );
    END IF;

    RETURN v_result;
END;
$$;
