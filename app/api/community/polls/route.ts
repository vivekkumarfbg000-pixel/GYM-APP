import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch polls
        const { data: polls, error: pollsError } = await supabase
            .from('polls')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (pollsError) throw pollsError;

        // Fetch options for these polls
        const pollsWithOptions = await Promise.all(polls.map(async (poll) => {
            const { data: options, error: optionsError } = await supabase
                .from('poll_options')
                .select('*')
                .eq('poll_id', poll.id);

            if (optionsError) throw optionsError;

            return {
                ...poll,
                options: options || [],
                totalVotes: poll.total_votes,
                createdBy: poll.created_by
            };
        }));

        return NextResponse.json(pollsWithOptions);
    } catch (error) {
        console.error('Polls error:', error);
        return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }
}
