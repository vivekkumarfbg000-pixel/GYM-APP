import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { with ErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { emitToRoom } from '@/lib/socket';

// GET: Fetch member's badges
async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
        throw ApiErrors.badRequest('Member ID is required');
    }

    try {
        const { data: memberBadges, error } = await supabase
            .from('member_badges')
            .select('*, badges(*)')
            .eq('member_id', memberId)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: memberBadges
        });
    } catch (error: any) {
        console.error('Failed to fetch badges:', error);
        throw ApiErrors.internal('Failed to fetch badges');
    }
}

// POST: Check and unlock badges for a member
async function postHandler(req: NextRequest) {
    const body = await req.json();
    const { memberId, gymOwnerId } = body;

    if (!memberId || !gymOwnerId) {
        throw ApiErrors.badRequest('Missing required fields');
    }

    try {
        const newBadges: any[] = [];

        // Fetch member's stats
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();

        if (memberError) throw memberError;

        // Get member's workout count
        const { count: workoutCount } = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('member_id', memberId);

        // Get member's check-in count
        const { count: checkInCount } = await supabase
            .from('check_ins')
            .select('*', { count: 'exact', head: true })
            .eq('member_id', memberId);

        // Get member's posts count
        const { count: postsCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', memberId);

        // Get current streak
        const currentStreak = member.streak_current || 0;

        // Get already unlocked badges
        const { data: existingBadges } = await supabase
            .from('member_badges')
            .select('badge_id')
            .eq('member_id', memberId);

        const unlockedBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || []);

        // Fetch all available badges
        const { data: allBadges } = await supabase
            .from('badges')
            .select('*');

        // Check each badge criteria
        for (const badge of allBadges || []) {
            if (unlockedBadgeIds.has(badge.id)) continue; // Already unlocked

            const criteria = badge.criteria as any;
            let shouldUnlock = false;

            switch (criteria.type) {
                case 'workouts':
                    shouldUnlock = (workoutCount || 0) >= criteria.count;
                    break;
                case 'streak':
                    shouldUnlock = currentStreak >= criteria.count;
                    break;
                case 'posts':
                    shouldUnlock = (postsCount || 0) >= criteria.count;
                    break;
                case 'early_checkin':
                    // Check if any check-in was before the specified hour
                    const { data: earlyCheckIns } = await supabase
                        .from('check_ins')
                        .select('check_in_time')
                        .eq('member_id', memberId)
                        .limit(100);

                    shouldUnlock = earlyCheckIns?.some(c => {
                        const hour = new Date(c.check_in_time).getHours();
                        return hour < criteria.hour;
                    }) || false;
                    break;
                case 'late_workout':
                    const { data: lateWorkouts } = await supabase
                        .from('workouts')
                        .select('start_time')
                        .eq('member_id', memberId)
                        .limit(100);

                    shouldUnlock = lateWorkouts?.some(w => {
                        const hour = new Date(w.start_time).getHours();
                        return hour >= criteria.hour;
                    }) || false;
                    break;
            }

            if (shouldUnlock) {
                // Unlock badge
                const { data: newBadge, error: insertError } = await supabase
                    .from('member_badges')
                    .insert([{
                        member_id: memberId,
                        badge_id: badge.id
                    }])
                    .select('*, badges(*)')
                    .single();

                if (!insertError && newBadge) {
                    newBadges.push(newBadge);

                    // Emit real-time notification
                    emitToRoom(`gym:${gymOwnerId}`, 'badge:unlocked', {
                        memberId,
                        memberName: member.name,
                        badgeName: badge.name,
                        badgeIcon: badge.icon
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                newBadges,
                message: newBadges.length > 0 ? `Unlocked ${newBadges.length} new badge(s)!` : 'No new badges'
            }
        });
    } catch (error: any) {
        console.error('Badge check failed:', error);
        throw ApiErrors.internal('Failed to check badges');
    }
}

export const GET = withErrorHandler(handler);
export const POST = withErrorHandler(postHandler);
