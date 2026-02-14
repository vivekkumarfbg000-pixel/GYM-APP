import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateGroqResponse } from '@/lib/groq';

// Fallback workout if AI fails
function getFallbackWorkout(goal: string = 'general') {
    return {
        title: "Full Body Power",
        duration: 45,
        calories: 320,
        focus: "Strength & Conditioning",
        exercises: [
            { name: "Push Ups", sets: 3, reps: "12-15", rest: "60s" },
            { name: "Dumbbell Squats", sets: 4, reps: "10-12", rest: "90s" },
            { name: "Plank Hold", sets: 3, reps: "45s", rest: "60s" },
            { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "60s" },
            { name: "Lunges", sets: 3, reps: "10/leg", rest: "60s" }
        ]
    };
}

export async function POST(request: Request) {
    try {
        const { memberId, goal } = await request.json();

        // 1. Fetch member stats from Supabase
        let memberStats = {
            level: 1,
            workouts_completed: 0,
            goal: goal || 'general fitness'
        };

        if (memberId) {
            try {
                const { data } = await supabase
                    .from('members')
                    .select('level, points')
                    .eq('id', memberId)
                    .single();

                if (data) {
                    memberStats.level = data.level || 1;
                    memberStats.workouts_completed = Math.floor((data.points || 0) / 50); // Estimate
                }
            } catch (err) {
                console.log('Could not fetch member stats, using defaults');
            }
        }

        // 2. Check for Groq API Key
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            // Return fallback workout
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI delay
            return NextResponse.json({
                success: true,
                workout: getFallbackWorkout(goal),
                mode: 'fallback_no_key'
            });
        }

        // 3. Call Groq AI
        try {
            // Ensure backticks are present for template literal
            const prompt = `Generate a personalized workout plan for a gym member.
Member Stats:
- Level: ${memberStats.level}
- Goal: ${memberStats.goal}
- Workouts Completed: ${memberStats.workouts_completed}

Return ONLY valid JSON in this exact format(no markdown, no code blocks):
{
    "title": "Workout Name",
    "duration": 45,
    "calories": 300,
    "focus": "Strength Building",
    "exercises": [
        { "name": "Exercise Name", "sets": 3, "reps": "12-15", "rest": "60s" }
    ]
}

Requirements:
- Include 5 exercises
- Make it challenging but suitable for level ${memberStats.level}
- Focus on: ${memberStats.goal}
- Use common gym exercises(no equipment needed or basic dumbbells)`;

            const text = await generateGroqResponse(prompt, true); // true for JSON mode

            // Remove markdown code blocks if present
            const cleanJson = text.replace(/```json\n ? /g, '').replace(/```\n?/g, '').trim();

            try {
                const workout = JSON.parse(cleanJson);
                return NextResponse.json({
                    success: true,
                    workout,
                    mode: 'groq'
                });
            } catch (e) {
                // If JSON parse fails, try fallback
                console.error("Failed to parse Groq response:", text);
                return NextResponse.json({
                    success: true,
                    workout: getFallbackWorkout(goal),
                    mode: 'fallback_parse_error'
                });
            }

        } catch (apiError) {
            console.error('Groq API Error:', apiError);
            // Fallback to hardcoded workout if AI fails
            return NextResponse.json({
                success: true,
                workout: getFallbackWorkout(goal),
                mode: 'fallback_error'
            });
        }

    } catch (error: any) {
        console.error('Workout generation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
