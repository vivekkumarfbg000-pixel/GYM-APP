import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
    try {
        const data = await db.community.getLeaderboard();

        const formatted = data.map((m: any, idx: number) => ({
            id: m.id,
            rank: idx + 1,
            name: m.name,
            points: m.points || 0,
            avatar: m.name.substring(0, 2).toUpperCase()
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
