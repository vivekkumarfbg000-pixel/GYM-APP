import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { workoutId, memberId } = await req.json();

        if (!workoutId || !memberId) {
            return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
        }

        // 1. Update Workout Status
        const { error: updateError } = await supabase
            .from('ai_workouts')
            .update({
                status: 'approved',
                reviewed_by: 'Online Trainer'
            })
            .eq('id', workoutId);

        if (updateError) throw updateError;

        // 2. GAMIFICATION: Award points
        // Fetch current points
        const { data: member } = await supabase
            .from('members')
            .select('points')
            .eq('id', memberId)
            .single();

        if (member) {
            const newPoints = (member.points || 0) + 50;
            await supabase
                .from('members')
                .update({ points: newPoints })
                .eq('id', memberId);
        }

        // 3. (Optional) Trigger N8N Notification
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nUrl) {
            fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workoutId, memberId, status: 'approved' }),
            }).catch(err => console.error("N8N Trigger Failed", err));
        }

        return NextResponse.json({ success: true, message: "Workout approved & points awarded" });

    } catch (error) {
        console.error('Approval failed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to approve workout' },
            { status: 500 }
        );
    }
}
