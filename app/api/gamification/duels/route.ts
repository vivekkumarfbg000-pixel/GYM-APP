import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET: Fetch my duels
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });

    try {
        const data = await db.duels.getMyDuels(memberId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch duels' }, { status: 500 });
    }
}

// POST: Create a new Duel
export async function POST(req: Request) {
    try {
        const { creatorId, opponentId, title, goalType, goalTarget, endDate } = await req.json();

        if (!creatorId || !title) {
            return NextResponse.json({ success: false, error: 'Missing Required Fields' }, { status: 400 });
        }

        const duel = await db.duels.create({
            title, // e.g. "Step Battle vs John"
            description: `1v1 Battle for ${goalTarget} ${goalType}`,
            goal_type: goalType,
            goal_target: Number(goalTarget),
            start_date: new Date().toISOString(),
            end_date: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
            is_duel: true,
            creator_id: creatorId,
            opponent_id: opponentId || null, // Can be open duel? For now logic implies assigned opponent
            status: 'pending',
            participants_count: 2
        });

        return NextResponse.json({ success: true, data: duel });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create duel' }, { status: 500 });
    }
}
