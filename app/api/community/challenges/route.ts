import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';

// GET: Fetch active challenges for  a gym
async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gymOwnerId = searchParams.get('gymOwnerId');

    if (!gymOwnerId) {
        throw ApiErrors.badRequest('Gym Owner ID is required');
    }

    try {
        const { data: challenges, error } = await supabase
            .from('challenges')
            .select('*, challenge_participants(count)')
            .eq('gym_owner_id', gymOwnerId)
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('start_date', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: challenges
        });
    } catch (error: any) {
        console.error('Failed to fetch challenges:', error);
        throw ApiErrors.internal('Failed to fetch challenges');
    }
}

// POST: Create a new challenge
async function postHandler(req: NextRequest) {
    const body = await req.json();
    const { gymOwnerId, name, description, type, targetValue, startDate, endDate, prizeDescription } = body;

    if (!gymOwnerId || !name || !type || !targetValue || !startDate || !endDate) {
        throw ApiErrors.badRequest('Missing required fields');
    }

    try {
        const { data: challenge, error } = await supabase
            .from('challenges')
            .insert([{
                gym_owner_id: gymOwnerId,
                name,
                description,
                type,
                target_value: targetValue,
                start_date: startDate,
                end_date: endDate,
                prize_description: prizeDescription,
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: challenge,
            message: 'Challenge created successfully!'
        });
    } catch (error: any) {
        console.error('Challenge creation failed:', error);
        throw ApiErrors.internal('Failed to create challenge');
    }
}

export const GET = withErrorHandler(handler);
export const POST = withErrorHandler(postHandler);
