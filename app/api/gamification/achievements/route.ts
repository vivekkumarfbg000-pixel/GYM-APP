import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

// GET: Fetch unlocked achievements for a member
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });

    try {
        const data = await db.achievements.getUnlocked(memberId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch achievements' }, { status: 500 });
    }
}

// POST: Unlock a badge (Internal or Triggered)
export async function POST(req: Request) {
    const { memberId, badgeId } = await req.json();

    if (!memberId || !badgeId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    try {
        const data = await db.achievements.unlock(memberId, badgeId);

        // If first time unlock, award XP?
        if (data) {
            const { data: member } = await supabase.from('members').select('points').eq('id', memberId).single();
            if (member) {
                await supabase.from('members').update({ points: (member.points || 0) + 100 }).eq('id', memberId); // +100 XP
            }
        }

        return NextResponse.json({ success: true, data, newUnlock: !!data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to unlock' }, { status: 500 });
    }
}
