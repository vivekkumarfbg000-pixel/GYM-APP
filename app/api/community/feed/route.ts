import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
    try {
        const feed = await db.community.getFeed();

        // Transform for UI
        const formatted = feed.map((post: any) => ({
            id: post.id,
            user: post.members?.name || 'Unknown User',
            avatar: post.members?.name?.substring(0, 2).toUpperCase() || 'GU',
            time: new Date(post.created_at).toLocaleDateString(),
            content: post.content,
            likes: post.likes || 0,
            comments: 0
        }));

        return NextResponse.json(formatted);
    } catch (error) {
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
