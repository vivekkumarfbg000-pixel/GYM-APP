import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET: Fetch sessions for a specific trainer
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get('trainerId');
    const date = searchParams.get('date');

    if (!trainerId) {
        return NextResponse.json({ success: false, error: 'Trainer ID is required' }, { status: 400 });
    }

    try {
        const sessions = await db.trainers.getSessions(trainerId, date || undefined);
        return NextResponse.json({ success: true, data: sessions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Book a new session
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { trainerId, memberId, startTime, gymId, price } = body;

        if (!trainerId || !memberId || !startTime || !gymId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate end time (default 1 hour)
        const start = new Date(startTime);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const session = await db.pt.bookSession({
            trainer_id: trainerId,
            member_id: memberId,
            gym_id: gymId,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            status: 'scheduled',
            price_at_booking: price,
            notes: body.notes || ''
        });

        return NextResponse.json({ success: true, data: session });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
