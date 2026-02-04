import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, content, imageUrl, type } = body; // enhanced

        if (!memberId || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                member_id: memberId,
                content,
                image_url: imageUrl,
                type: type || 'regular'
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    try {
        // Fetch posts with author info, like counts, and comment counts
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                members (id, name, segment),
                post_likes (count),
                post_comments (count)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Enhance data with "isLiked" if memberId is provided
        // Note: For MVP, doing a separate query or in-memory check is easiest if RLS allows.
        // A robust way:
        const enhancedData = await Promise.all(data.map(async (post) => {
            let isLiked = false;
            if (memberId) {
                const { count } = await supabase
                    .from('post_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id)
                    .eq('member_id', memberId);
                isLiked = !!count;
            }

            return {
                id: post.id,
                user: post.members?.name || 'Unknown',
                userSegment: post.members?.segment,
                title: post.members?.segment === 'Elite' ? 'Elite Member' : 'Member',
                time: new Date(post.created_at).toLocaleDateString(),
                avatar: post.members?.name?.[0] || 'U',
                content: post.content,
                image: post.image_url,
                type: post.type,
                likes: post.post_likes?.[0]?.count || 0,
                comments: post.post_comments?.[0]?.count || 0,
                isLiked
            };
        }));

        return NextResponse.json(enhancedData);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
