import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { action, postId, memberId, content } = await req.json();

        if (action === 'like') {
            const { error } = await supabase.rpc('toggle_like', {
                p_post_id: postId,
                p_member_id: memberId
            });
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'comment') {
            const { data, error } = await supabase
                .from('post_comments')
                .insert([{ post_id: postId, member_id: memberId, content }])
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
