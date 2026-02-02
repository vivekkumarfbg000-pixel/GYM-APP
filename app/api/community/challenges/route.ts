import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');

        // 1. Fetch all challenges
        const { data: challenges, error: challengesError } = await supabase
            .from('challenges')
            .select('*');

        if (challengesError) throw challengesError;

        let myParticipations: any[] = [];

        // 2. Fetch participation if memberId matches
        if (memberId) {
            const { data, error: partError } = await supabase
                .from('challenge_participants')
                .select('challenge_id, progress, completed')
                .eq('member_id', memberId);

            if (!partError && data) {
                myParticipations = data;
            }
        }

        // 3. Merge data
        const result = challenges.map((c: any) => {
            const participation = myParticipations.find(p => p.challenge_id === c.id);
            return {
                id: c.id,
                title: c.title,
                goal: `${c.goal_target} ${c.goal_type}`,
                total: c.goal_target,
                joined: !!participation,
                progress: participation ? participation.progress : 0,
                daysLeft: Math.ceil((new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
