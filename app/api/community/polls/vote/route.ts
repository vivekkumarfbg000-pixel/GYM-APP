import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Check if user has voted (GET)
// Check if user has voted (GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pollId = searchParams.get('pollId');
    const memberId = searchParams.get('memberId');

    if (!memberId) {
        return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    try {
        if (pollId) {
            // Single poll check
            const { data } = await supabase
                .from('poll_votes')
                .select('option_id')
                .eq('poll_id', pollId)
                .eq('member_id', memberId)
                .single();

            if (data) {
                return NextResponse.json({ voted: true, optionId: data.option_id });
            } else {
                return NextResponse.json({ voted: false });
            }
        } else {
            // Bulk fetch for all polls (Performance Fix)
            const { data } = await supabase
                .from('poll_votes')
                .select('poll_id, option_id')
                .eq('member_id', memberId);

            // Transform to map: { pollId: optionId }
            const voteMap: Record<string, string> = {};
            if (data) {
                data.forEach((vote: any) => {
                    voteMap[vote.poll_id] = vote.option_id;
                });
            }

            return NextResponse.json({ votes: voteMap });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }
}

// Vote (POST)
export async function POST(req: Request) {
    try {
        const { pollId, optionId, memberId } = await req.json();

        // 1. Check if already voted
        const { data: existing } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', pollId)
            .eq('member_id', memberId)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        // 2. Record vote
        const { error: voteError } = await supabase
            .from('poll_votes')
            .insert([{ poll_id: pollId, option_id: optionId, member_id: memberId }]);

        if (voteError) throw voteError;

        // 3. Increment counts (RPC or direct update)
        // Increment Option Votes
        await supabase.rpc('increment_counter', {
            row_id: optionId,
            table_name: 'poll_options',
            col_name: 'votes'
        });

        // Increment Poll Total Votes
        await supabase.rpc('increment_counter', {
            row_id: pollId,
            table_name: 'polls',
            col_name: 'total_votes'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
