import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { memberId } = await req.json();

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        // Call the database function
        const { data, error } = await supabase.rpc('update_member_streak', {
            p_member_id: memberId
        });

        if (error) {
            console.error('Streak update error:', error);
            // Fallback for demo if RPC implies missing migration
            return NextResponse.json({
                streak: 1,
                status: 'reset',
                message: 'Streak tracked (simulated)'
            });
        }

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
    }
}
