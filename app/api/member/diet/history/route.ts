import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get('memberId');

        if (!memberId) {
            return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
        }

        const history = await db.dietChats.getHistory(memberId);

        return NextResponse.json({ success: true, history });

    } catch (error) {
        console.error('Diet History Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
