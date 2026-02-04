import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get('memberId');

        const challenges = await db.community.getChallenges();

        let memberProgress: any[] = [];
        if (memberId) {
            memberProgress = await db.community.getMemberChallenges(memberId);
        }

        const formatted = challenges.map((c: any) => {
            const progress = memberProgress.find(p => p.challenge_id === c.id);
            const daysLeft = Math.ceil((new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

            return {
                id: c.id,
                title: c.title,
                goal: `${c.goal_target} ${c.goal_type}`,
                total: c.goal_target,
                daysLeft: daysLeft > 0 ? daysLeft : 0,
                joined: !!progress,
                progress: progress?.progress || 0
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }
}
