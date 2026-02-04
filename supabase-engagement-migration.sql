-- Migration: Engagement Features (Feed, Likes, Comments)

-- 1. Enhance Posts Table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'regular', -- 'regular', 'owner', 'ai'
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, member_id)
);

-- 3. Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Public read access comments" ON post_comments FOR SELECT USING (true);

-- 5. Helper function to toggle like
create or replace function toggle_like(p_post_id uuid, p_member_id uuid)
returns void
language plpgsql
as $$
begin
  if exists (select 1 from post_likes where post_id = p_post_id and member_id = p_member_id) then
    delete from post_likes where post_id = p_post_id and member_id = p_member_id;
  else
    insert into post_likes (post_id, member_id) values (p_post_id, p_member_id);
  end if;
end;
$$;
