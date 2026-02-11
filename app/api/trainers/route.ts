import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET: Fetch all trainers (optionally filter by gym_id)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get('gymId');

    try {
        const trainers = await db.trainers.getAll(gymId || undefined);
        return NextResponse.json({ success: true, data: trainers });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a new trainer
export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Validation could go here

        const trainer = await db.trainers.create({
            ...body,
            // Default stats for new trainer
            rating: 5.0,
            sessions_conducted: 0
        });

        return NextResponse.json({ success: true, data: trainer });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
