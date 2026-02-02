import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                likes,
                created_at,
                members (
                    name,
                    email
                )
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Transform data for frontend
        const posts = data.map((post: any) => ({
            id: post.id,
            user: post.members?.name || 'Unknown',
            avatar: (post.members?.name?.[0] || 'U').toUpperCase(),
            content: post.content,
            likes: post.likes,
            comments: 0, // Not implemented yet
            time: new Date(post.created_at).toLocaleDateString()
        }));

        return NextResponse.json(posts);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
