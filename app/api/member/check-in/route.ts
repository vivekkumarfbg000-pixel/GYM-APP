import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addDays, format, parseISO, subDays } from 'date-fns';

export async function POST(request: Request) {
    try {
        const { memberId } = await request.json();

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        // Get current streak info
        const { data: member, error: fetchError } = await supabase
            .from('members')
            .select('daily_streak, last_streak_date')
            .eq('id', memberId)
            .single();

        if (fetchError) throw fetchError;

        const today = new Date().toISOString().split('T')[0];
        const lastDate = member.last_streak_date;

        // If already checked in today, return current
        if (lastDate === today) {
            return NextResponse.json({
                success: true,
                streak: member.daily_streak,
                checkedIn: true,
                message: 'Already checked in today'
            });
        }

        // Calculate new streak
        let newStreak = 1;

        if (lastDate) {
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            if (lastDate === yesterday) {
                newStreak = (member.daily_streak || 0) + 1;
            }
        }

        // Update member
        const { error: updateError } = await supabase
            .from('members')
            .update({
                daily_streak: newStreak,
                last_streak_date: today,
                points: (member.points || 0) + 10 // Bonus points for check-in
            })
            .eq('id', memberId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            streak: newStreak,
            pointsAdded: 10,
            firstCheckIn: true
        });

    } catch (error: any) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
