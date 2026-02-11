import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { workoutId, status, approvedBy } = body;

        if (!workoutId || !status) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Update the workout status in DB
        const updatedWorkout = await db.workouts.update(workoutId, {
            status: status,
            reviewed_by: approvedBy || 'Trainer',
            updated_at: new Date().toISOString()
        });

        // In a real app, you might trigger a notification to the member here

        return NextResponse.json({ success: true, data: updatedWorkout });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
