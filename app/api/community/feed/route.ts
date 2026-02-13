import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get('memberId');

        // Fetch posts
        const posts = await db.community.getFeed();

        // Enhance with dynamic data (likes check, comment counts)
        // Note: In a production app, this should be a single joined query or view for performance
        const enhancedPosts = await Promise.all(posts.map(async (post: any) => {
            // Get comment count
            const { count: commentCount } = await supabase
                .from('post_comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);

            // Check if liked by current user and get reaction type
            let isLiked = false;
            let userReaction = null;
            if (memberId) {
                const { data: reaction } = await supabase
                    .from('post_reactions')
                    .select('reaction_type')
                    .eq('post_id', post.id)
                    .eq('member_id', memberId)
                    .single();

                if (reaction) {
                    isLiked = true;
                    userReaction = reaction.reaction_type;
                }
            }

            // Get actual like count (if not using the column)
            // For now relying on post.likes column, but could fetch count here too if needed

            return {
                id: post.id,
                user: post.members?.name || 'Unknown User',
                avatar: post.members?.name?.substring(0, 2).toUpperCase() || 'GU', // Fallback avatar
                time: new Date(post.created_at).toLocaleDateString(),
                content: post.content,
                image: post.image_url,
                likes: post.likes || 0,
                isLiked,
                userReaction,
                comments: commentCount || 0,
                type: post.type || 'regular',
                ai_analysis: post.ai_analysis
            };
        }));

        return NextResponse.json(enhancedPosts);
    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { memberId, content } = await req.json();
        const post = await db.community.createPost({
            member_id: memberId,
            content,
            likes: 0
        });
        return NextResponse.json({ success: true, post });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
