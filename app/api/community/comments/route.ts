import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                id,
                content,
                created_at,
                members (
                    id,
                    name
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true }); // Discuss first, then comments chronologically? Usually generic feeds are desc or asc. Asc makes sense for reading flow.

        if (error) throw error;

        // Transform
        const comments = data.map((c: any) => ({
            id: c.id,
            user: c.members?.name || 'Unknown',
            userId: c.members?.id,
            avatar: c.members?.name?.substring(0, 2).toUpperCase(),
            content: c.content,
            time: new Date(c.created_at).toLocaleDateString() + ' ' + new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return NextResponse.json(comments);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
