import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });

    try {
        const plan = await db.dietPlans.getActive(memberId);
        return NextResponse.json({ success: true, plan });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch plan' }, { status: 500 });
    }
}
