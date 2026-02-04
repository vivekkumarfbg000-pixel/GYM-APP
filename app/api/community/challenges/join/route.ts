import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { memberId, challengeId } = await req.json();

        if (!memberId || !challengeId) {
            return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
        }

        await db.community.joinChallenge(memberId, challengeId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }
}
