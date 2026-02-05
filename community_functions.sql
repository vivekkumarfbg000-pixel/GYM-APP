-- Community Helper Functions

-- 1. TOGGLE LIKE (for Posts)
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_member_id UUID)
RETURNS VOID AS $$
DECLARE
    exists_check BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM post_likes WHERE post_id = p_post_id AND member_id = p_member_id) INTO exists_check;
    
    IF exists_check THEN
        DELETE FROM post_likes WHERE post_id = p_post_id AND member_id = p_member_id;
        -- Decrement like count (optional if valid triggers exist, but safety net)
        UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = p_post_id;
    ELSE
        INSERT INTO post_likes (post_id, member_id) VALUES (p_post_id, p_member_id);
        -- Increment like count
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
