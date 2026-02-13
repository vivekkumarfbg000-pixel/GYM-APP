import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGroqResponse, GroqModels } from '@/lib/groq';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

// Initialize Supabase Admin Client (Service Role) to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function handler(request: NextRequest) {
    const body = await request.json();
    const { memberId, goal, duration = 45, focus = 'Full Body' } = body;

    // Validate required fields
    if (!memberId) {
        throw ApiErrors.badRequest('Member ID is required');
    }

    if (!goal) {
        throw ApiErrors.badRequest('Workout goal is required');
    }

    logger.info(`Generating workout for member ${memberId}`, { goal, duration, focus }, memberId);

    // 1. Fetch Member Profile for context (Using Admin Client to bypass RLS)
    const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

    if (memberError) {
        // Log the exact error from Supabase
        console.error('Supabase Member Fetch Error:', memberError);
        logger.error('Failed to fetch member profile', memberError, { memberId });

        if (memberError.code !== 'PGRST116') {
            throw ApiErrors.internal(`Failed to fetch member profile: ${memberError.message}`);
        }
    }

    const userContext = member ? `User is ${member.segment} fitness level.` : "User is intermediate.";

    // 2. Prompt Engineering for Groq
    const prompt = `
        Act as an elite personal trainer. Create a structured ${duration}-minute workout plan for a client with the goal: "${goal}" and a focus on "${focus}".
        Context: ${userContext}.
        
        Return the response ONLY as a valid JSON object with the following structure:
        {
            "ai_notes": "A brief, encouraging comment about the focus of this session (max 20 words).",
            "risk_level": "low" | "medium" | "high",
            "plan_data": [
                { "name": "Exercise Name", "sets": number, "reps": "string rep range", "rest": number_in_seconds, "met": number_estimate }
            ]
        }
        
        Include 5-8 exercises appropriate for the goal and duration.
        Do not include any markdown formatting. Return only valid JSON.
    `;

    // 3. Generate Content using Groq
    logger.info('Calling Groq API for workout generation', { model: GroqModels.LLAMA_3_3_70B });
    let response;
    try {
        response = await generateGroqResponse(prompt, true, GroqModels.LLAMA_3_3_70B);
    } catch (groqError: any) {
        console.error('Groq Generation Error:', groqError);
        throw ApiErrors.internal(`AI Generation failed: ${groqError.message}`);
    }

    // 4. Parse JSON
    let aiPlan;
    try {
        aiPlan = JSON.parse(response);
    } catch (e) {
        logger.error('Failed to parse AI response', e as Error, { response });
        throw ApiErrors.internal('AI generation failed - invalid response format');
    }

    // Validate the response structure
    if (!aiPlan.ai_notes || !aiPlan.risk_level || !aiPlan.plan_data) {
        logger.error('Invalid AI response structure', undefined, { aiPlan });
        throw ApiErrors.internal('AI generation failed - incomplete response');
    }

    // 5. Save to Database (Using Admin Client)
    const { data: newWorkout, error: saveError } = await supabaseAdmin
        .from('ai_workouts')
        .insert({
            member_id: memberId,
            goal: goal || 'General Fitness',
            duration: duration,
            risk_level: aiPlan.risk_level || 'low',
            status: 'pending',
            ai_notes: aiPlan.ai_notes,
            plan_data: aiPlan.plan_data
        })
        .select()
        .single();

    if (saveError) {
        console.error('Supabase Save Error:', saveError);
        logger.error('Failed to save workout to DB', saveError, { memberId });
        throw ApiErrors.internal(`Failed to save workout: ${saveError.message}`);
    }

    logger.info('Workout generated successfully', { workoutId: newWorkout.id }, memberId);

    return NextResponse.json({
        success: true,
        data: newWorkout
    });
}

export const POST = withErrorHandler(handler);
