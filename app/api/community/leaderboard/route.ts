import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('id, name, points, level')
            .order('points', { ascending: false })
            .limit(10);

        if (error) throw error;

        const leaderboard = data.map((m: any, index: number) => ({
            id: m.id,
            rank: index + 1,
            name: m.name,
            points: m.points || 0,
            avatar: (m.name?.[0] || 'U').toUpperCase()
        }));

        return NextResponse.json(leaderboard);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
