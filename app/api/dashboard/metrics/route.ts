import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        // 1. Fetch Total Revenue
        const { data: payments, error: payError } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed');

        if (payError) throw payError;

        const totalRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        // 2. Fetch Active Members Count
        const { count: activeMembers, error: memError } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('membership_status', 'active');

        if (memError) throw memError;

        // 3. Last Month Revenue (Mock logic for now, or filter by date)
        // For simplicity, we just return total

        return NextResponse.json({
            mrr: totalRevenue, // Assuming all monthly for now
            activeMembers: activeMembers || 0,
            churnRate: 2.1, // Hardcoded for now until we track historical churn
            avgLTV: (totalRevenue / (activeMembers || 1)).toFixed(0)
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
