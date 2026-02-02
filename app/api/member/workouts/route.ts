import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Save a new workout
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            memberId,
            workoutType,
            startTime,
            endTime,
            duration,
            distance,
            calories,
            routeData
        } = body;

        // Basic validation
        if (!memberId || !workoutType) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('outdoor_workouts')
            .insert([
                {
                    member_id: memberId,
                    workout_type: workoutType,
                    start_time: startTime,
                    end_time: endTime,
                    duration_seconds: duration,
                    distance_meters: distance,
                    calories_burned: calories,
                    route_data: routeData, // JSON array of coordinates
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error saving workout:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET: Fetch workout history for a member
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');

        if (!memberId) {
            return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('outdoor_workouts')
            .select('*')
            .eq('member_id', memberId)
            .order('start_time', { ascending: false })
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching workouts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
