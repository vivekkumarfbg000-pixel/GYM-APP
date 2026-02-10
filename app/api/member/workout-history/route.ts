import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

async function handler(req: NextRequest) {
    const memberId = req.nextUrl.searchParams.get('memberId');

    if (!memberId) {
        throw ApiErrors.badRequest('Member ID is required');
    }

    logger.info('Fetching workout history', {}, memberId);

    // Fetch all workouts for this member with completion data
    const { data: workouts, error } = await supabase
        .from('ai_workouts')
        .select(`
            id,
            goal,
            duration,
            risk_level,
            status,
            ai_notes,
            plan_data,
            created_at,
            completed_at,
            rating,
            completion_notes
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Failed to fetch workout history', error, { memberId });
        throw ApiErrors.internal('Failed to fetch workout history');
    }

    return NextResponse.json({
        success: true,
        data: workouts || []
    });
}

export const GET = withErrorHandler(handler);

// Mark workout as completed
async function completeHandler(req: NextRequest) {
    const { workoutId, memberId, rating, notes } = await req.json();

    if (!workoutId || !memberId) {
        throw ApiErrors.badRequest('Workout ID and Member ID are required');
    }

    logger.info('Completing workout', { workoutId, rating }, memberId);

    // Update workout as completed
    const { data, error } = await supabase
        .from('ai_workouts')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            rating: rating || null,
            completion_notes: notes || null
        })
        .eq('id', workoutId)
        .eq('member_id', memberId) // Security: ensure member owns this workout
        .select()
        .single();

    if (error) {
        logger.error('Failed to complete workout', error, { workoutId, memberId });
        throw ApiErrors.internal('Failed to complete workout');
    }

    if (!data) {
        throw ApiErrors.notFound('Workout not found');
    }

    logger.info('Workout completed successfully', { workoutId }, memberId);

    return NextResponse.json({
        success: true,
        data
    });
}

export const POST = withErrorHandler(completeHandler);
