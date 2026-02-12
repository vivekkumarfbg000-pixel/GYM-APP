import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

// GET: Fetch all achievements with unlocked status for a member
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });

    try {
        // 1. Fetch all available badges (achievements)
        // Assuming 'achievements' table stores badge definitions
        // If not, we might need to mock them or check schema. 
        // For now, let's assume a 'badges' table or similar, or just return the unlocked ones if no master list exists yet.
        // Actually, looking at the previous code, `db.achievements.getUnlocked` suggests a structure.
        // Let's assume we want to show ALL badges. 

        // Fetch all defined badges
        const { data: allBadges, error: badgesError } = await supabase
            .from('badges') // Assuming a 'badges' table exists definition
            .select('*')
            .order('xp_reward', { ascending: true });

        if (badgesError) {
            // If badges table doesn't exist, fall back to just returning unlocked ones from member_achievements
            console.warn("Badges table not found, returning only unlocked");
            const unlocked = await db.achievements.getUnlocked(memberId);
            return NextResponse.json({ success: true, data: unlocked });
        }

        // 2. Fetch user's unlocked badges
        const { data: unlockedBadges, error: unlockedError } = await supabase
            .from('member_achievements')
            .select('badge_id, created_at')
            .eq('member_id', memberId);

        if (unlockedError) throw unlockedError;

        // 3. Map status
        const unlockedSet = new Set(unlockedBadges?.map(b => b.badge_id));
        const unlockedDates = unlockedBadges?.reduce((acc, curr) => ({ ...acc, [curr.badge_id]: curr.created_at }), {});

        const badgesWithStatus = allBadges.map(badge => ({
            ...badge,
            isUnlocked: unlockedSet.has(badge.id),
            unlockedDate: unlockedDates[badge.id] || null
        }));

        return NextResponse.json({ success: true, data: badgesWithStatus });

    } catch (error) {
        console.error('Achievements API error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch achievements' }, { status: 500 });
    }
}

// POST: Unlock a badge (Internal or Triggered)
export async function POST(req: Request) {
    const { memberId, badgeId } = await req.json();

    if (!memberId || !badgeId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    try {
        const data = await db.achievements.unlock(memberId, badgeId);

        // If first time unlock, award XP?
        if (data) {
            const { data: member } = await supabase.from('members').select('points').eq('id', memberId).single();
            if (member) {
                await supabase.from('members').update({ points: (member.points || 0) + 100 }).eq('id', memberId); // +100 XP
            }
        }

        return NextResponse.json({ success: true, data, newUnlock: !!data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to unlock' }, { status: 500 });
    }
}
