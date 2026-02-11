import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';

// GET: Fetch leaderboard for a specific challenge
async function handler(req: NextRequest, { params }: { params: { id: string } }) {
    const challengeId = params.id;

    if (!challengeId) {
        throw ApiErrors.badRequest('Challenge ID is required');
    }

    try {
        const { data: participants, error } = await supabase
            .from('challenge_participants')
            .select('*, members(name, email)')
            .eq('challenge_id', challengeId)
            .order('current_progress', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Add rank
        const rankedParticipants = participants?.map((p, index) => ({
            ...p,
            rank: index + 1
        }));

        return NextResponse.json({
            success: true,
            data: rankedParticipants
        });
    } catch (error: any) {
        console.error('Failed to fetch leaderboard:', error);
        throw ApiErrors.internal('Failed to fetch leaderboard');
    }
}

// POST: Join a challenge
async function postHandler(req: NextRequest, { params }: { params: { id: string } }) {
    const challengeId = params.id;
    const body = await req.json();
    const { memberId } = body;

    if (!challengeId || !memberId) {
        throw ApiErrors.badRequest('Missing required fields');
    }

    try {
        // Check if already joined
        const { data: existing } = await supabase
            .from('challenge_participants')
            .select('id')
            .eq('challenge_id', challengeId)
            .eq('member_id', memberId)
            .single();

        if (existing) {
            return NextResponse.json({
                success: false,
                error: 'Already joined this challenge'
            }, { status: 400 });
        }

        // Join challenge
        const { data: participant, error } = await supabase
            .from('challenge_participants')
            .insert([{
                challenge_id: challengeId,
                member_id: memberId,
                current_progress: 0
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: participant,
            message: 'Successfully joined the challenge!'
        });
    } catch (error: any) {
        console.error('Failed to join challenge:', error);
        throw ApiErrors.internal('Failed to join challenge');
    }
}

// PUT: Update progress for a participant
async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
    const challengeId = params.id;
    const body = await req.json();
    const { memberId, progress } = body;

    if (!challengeId || !memberId || progress === undefined) {
        throw ApiErrors.badRequest('Missing required fields');
    }

    try {
        const { data: participant, error } = await supabase
            .from('challenge_participants')
            .update({ current_progress: progress })
            .eq('challenge_id', challengeId)
            .eq('member_id', memberId)
            .select()
            .single();

        if (error) throw error;

        // Check if target reached
        const { data: challenge } = await supabase
            .from('challenges')
            .select('target_value')
            .eq('id', challengeId)
            .single();

        if (challenge && progress >= challenge.target_value) {
            // Mark as completed
            await supabase
                .from('challenge_participants')
                .update({ completed_at: new Date().toISOString() })
                .eq('id', participant.id);
        }

        return NextResponse.json({
            success: true,
            data: participant
        });
    } catch (error: any) {
        console.error('Failed to update progress:', error);
        throw ApiErrors.internal('Failed to update progress');
    }
}

export const GET = withErrorHandler(handler);
export const POST = withErrorHandler(postHandler);
export const PUT = withErrorHandler(putHandler);
