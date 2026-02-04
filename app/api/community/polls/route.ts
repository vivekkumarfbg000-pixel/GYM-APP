import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all active polls with their options and vote counts
export async function GET() {
    try {
        // Fetch active polls
        const { data: polls, error: pollsError } = await supabase
            .from('polls')
            .select(`
                id,
                question,
                created_at,
                expires_at,
                created_by,
                members!polls_created_by_fkey (
                    name
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (pollsError) throw pollsError;

        // For each poll, fetch options
        const pollsWithOptions = await Promise.all(
            (polls || []).map(async (poll: any) => {
                const { data: options, error: optionsError } = await supabase
                    .from('poll_options')
                    .select('id, option_text, votes_count')
                    .eq('poll_id', poll.id)
                    .order('created_at', { ascending: true });

                if (optionsError) throw optionsError;

                // Calculate total votes
                const totalVotes = options?.reduce((sum, opt) => sum + (opt.votes_count || 0), 0) || 0;

                return {
                    id: poll.id,
                    question: poll.question,
                    createdBy: poll.members?.name || 'Admin',
                    createdAt: poll.created_at,
                    expiresAt: poll.expires_at,
                    totalVotes,
                    options: options?.map(opt => ({
                        id: opt.id,
                        text: opt.option_text,
                        votes: opt.votes_count || 0,
                        percentage: totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0
                    })) || []
                };
            })
        );

        return NextResponse.json(pollsWithOptions);
    } catch (error: any) {
        console.error('Fetch polls error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new poll
export async function POST(req: Request) {
    try {
        const { question, options, createdBy } = await req.json();

        if (!question || !options || options.length < 2) {
            return NextResponse.json({ error: 'Question and at least 2 options required' }, { status: 400 });
        }

        // Create poll
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .insert([{
                question,
                created_by: createdBy,
                is_active: true
            }])
            .select()
            .single();

        if (pollError) throw pollError;

        // Create options
        const optionsToInsert = options.map((text: string) => ({
            poll_id: poll.id,
            option_text: text,
            votes_count: 0
        }));

        const { error: optionsError } = await supabase
            .from('poll_options')
            .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        return NextResponse.json({ success: true, pollId: poll.id });
    } catch (error: any) {
        console.error('Create poll error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
