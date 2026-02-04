import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Vote on a poll
export async function POST(req: Request) {
    try {
        const { pollId, memberId, optionId } = await req.json();

        if (!pollId || !memberId || !optionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Call the database function
        const { data, error } = await supabase.rpc('vote_on_poll', {
            p_poll_id: pollId,
            p_member_id: memberId,
            p_option_id: optionId
        });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET - Check if user has voted on a poll
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pollId = searchParams.get('pollId');
        const memberId = searchParams.get('memberId');

        if (!pollId || !memberId) {
            return NextResponse.json({ voted: false });
        }

        const { data, error } = await supabase
            .from('poll_votes')
            .select('option_id')
            .eq('poll_id', pollId)
            .eq('member_id', memberId)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({
            voted: !!data,
            optionId: data?.option_id || null
        });
    } catch (error: any) {
        console.error('Check vote error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
