import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { emitToRoom } from '@/lib/socket';

async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gymOwnerId = searchParams.get('gymOwnerId');

    if (!gymOwnerId) {
        throw ApiErrors.badRequest('Gym Owner ID is required');
    }

    try {
        // Get currently checked-in members
        const { data: checkIns, error } = await supabase
            .from('check_ins')
            .select('*, members(name, email)')
            .eq('gym_owner_id', gymOwnerId)
            .is('check_out_time', null) // Still checked in
            .order('check_in_time', { ascending: false });

        if (error) throw error;

        const count = checkIns?.length || 0;

        return NextResponse.json({
            success: true,
            data: {
                count,
                members: checkIns
            }
        });
    } catch (error: any) {
        logger.error('Failed to fetch live check-ins', error);
        throw ApiErrors.internal('Failed to fetch check-in data');
    }
}

// POST: Record a new check-in or check-out
async function postHandler(req: NextRequest) {
    const body = await req.json();
    const { memberId, gymOwnerId, action } = body; // action: 'in' or 'out'

    if (!memberId || !gymOwnerId || !action) {
        throw ApiErrors.badRequest('Missing required fields');
    }

    try {
        if (action === 'in') {
            // Create check-in record
            const { data, error } = await supabase
                .from('check_ins')
                .insert([{
                    member_id: memberId,
                    gym_owner_id: gymOwnerId,
                    check_in_time: new Date().toISOString()
                }])
                .select('*, members(name)')
                .single();

            if (error) throw error;

            // Emit real-time event
            emitToRoom(`gym:${gymOwnerId}`, 'checkin:update', {
                action: 'in',
                memberName: data.members?.name || 'Member',
                timestamp: data.check_in_time
            });

            return NextResponse.json({ success: true, data });

        } else if (action === 'out') {
            // Update existing check-in with check-out time
            const { data, error } = await supabase
                .from('check_ins')
                .update({ check_out_time: new Date().toISOString() })
                .eq('member_id', memberId)
                .eq('gym_owner_id', gymOwnerId)
                .is('check_out_time', null)
                .select('*, members(name)')
                .single();

            if (error) throw error;

            // Emit real-time event
            emitToRoom(`gym:${gymOwnerId}`, 'checkout:update', {
                action: 'out',
                memberName: data.members?.name || 'Member',
                timestamp: data.check_out_time
            });

            return NextResponse.json({ success: true, data });
        }

        throw ApiErrors.badRequest('Invalid action');

    } catch (error: any) {
        logger.error('Check-in/out failed', error);
        throw ApiErrors.internal('Failed to process check-in');
    }
}

export const GET = withErrorHandler(handler);
export const POST = withErrorHandler(postHandler);
