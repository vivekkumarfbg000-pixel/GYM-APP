-- Community Helper Functions

-- 1. TOGGLE LIKE (for Posts)
-- 1. TOGGLE REACTION
CREATE OR REPLACE FUNCTION toggle_reaction(p_post_id UUID, p_member_id UUID, p_type TEXT)
RETURNS VOID AS $$
DECLARE
    existing_type TEXT;
BEGIN
    SELECT reaction_type INTO existing_type FROM post_reactions WHERE post_id = p_post_id AND member_id = p_member_id;
    
    IF existing_type IS NOT NULL THEN
        IF existing_type = p_type THEN
            -- Remove if same reaction clicked
            DELETE FROM post_reactions WHERE post_id = p_post_id AND member_id = p_member_id;
            -- Decrement like count (Post table 'likes' col now represents total reactions for backward compatibility)
            UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = p_post_id;
        ELSE
            -- Change reaction type
            UPDATE post_reactions SET reaction_type = p_type WHERE post_id = p_post_id AND member_id = p_member_id;
        END IF;
    ELSE
        -- Add new reaction
        INSERT INTO post_reactions (post_id, member_id, reaction_type) VALUES (p_post_id, p_member_id, p_type);
        -- Increment count
        UPDATE posts SET likes = likes + 1 WHERE id = p_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. ADD COLUMN IF NOT EXISTS (Safety helper)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'segment') THEN
        ALTER TABLE members ADD COLUMN segment TEXT DEFAULT 'Member';
    END IF;
END $$;
