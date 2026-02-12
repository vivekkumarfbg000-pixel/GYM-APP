import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Save a new workout
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            memberId,
            workoutType,
            title, // For Gym
            exercises, // For Gym
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

        let data;
        let error;

        // Route to appropriate table based on type
        if (workoutType === 'Gym') {
            // Save to ai_workouts (repurposed for manual gym logs)
            const result = await supabase
                .from('ai_workouts')
                .insert([
                    {
                        member_id: memberId,
                        goal: title || 'Gym Session', // Use title as goal
                        duration: Math.round(duration ? duration / 60 : 60), // Store in minutes
                        plan_data: exercises, // Store exercises JSON
                        ai_notes: 'Manual Log',
                        status: 'completed',
                        risk_level: 'low',
                        created_at: startTime || new Date().toISOString(),
                        updated_at: endTime || new Date().toISOString()
                    }
                ])
                .select()
                .single();

            data = result.data;
            error = result.error;

        } else {
            // Outdoor / GPS Workouts
            const result = await supabase
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

            data = result.data;
            error = result.error;
        }

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error saving workout:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET: Fetch workout history for a member (Aggregated)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');

        if (!memberId) {
            return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
        }

        // Parallel Fetch: Outdoor & AI Workouts
        const [outdoorRes, aiRes] = await Promise.all([
            // 1. Outdoor (GPS) Workouts
            supabase
                .from('outdoor_workouts')
                .select('*')
                .eq('member_id', memberId)
                .order('start_time', { ascending: false })
                .limit(20),

            // 2. AI Workouts (Gym Sessions)
            supabase
                .from('ai_workouts')
                .select('*')
                .eq('member_id', memberId)
                .eq('status', 'completed') // Only completed ones for history
                .order('created_at', { ascending: false })
                .limit(20)
        ]);

        if (outdoorRes.error) throw outdoorRes.error;
        if (aiRes.error) throw aiRes.error;

        // Normalize & Combine Data
        const outdoor = (outdoorRes.data || []).map(w => ({
            id: w.id,
            type: 'Outdoor',
            name: w.workout_type,
            date: w.start_time,
            duration: Math.round(w.duration_seconds / 60), // Convert to mins
            calories: w.calories_burned,
            distance: w.distance_meters,
            details: `${(w.distance_meters / 1000).toFixed(2)}km Run`
        }));

        const ai = (aiRes.data || []).map(w => ({
            id: w.id,
            type: 'Gym',
            name: w.goal || 'AI Workout',
            date: w.updated_at || w.created_at, // Completed time
            duration: w.duration,
            calories: Math.round(w.duration * 6), // Est. 6 cal/min for lifting
            distance: 0,
            details: `Gym Session`
        }));

        // Merge & Sort by Date (Desc)
        const combined = [...outdoor, ...ai].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({ success: true, data: combined });

    } catch (error: any) {
        console.error('Error fetching workouts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
