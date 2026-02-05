import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log("Fetching dashboard stats...");

        // 1. Total Members
        const { count: totalMembers, error: membersError } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true });

        if (membersError) throw membersError;

        // 2. Active Members
        const { count: activeMembers, error: activeError } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active');

        if (activeError) throw activeError;

        // 3. Total Revenue (Sum of all completed payments)
        // Note: supabase .sum() is not directly available in JS client easily without rpc, 
        // so we fetch payments. For scale, use an RPC function.
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed');

        if (paymentsError) throw paymentsError;

        const monthlyRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        // 4. Daily Visits (Attendance count for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: visitTraffic, error: attendanceError } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .gte('check_in', today.toISOString());

        if (attendanceError) throw attendanceError;

        // 5. Avg Churn Risk
        const { data: churnData, error: churnError } = await supabase
            .from('members')
            .select('churn_risk');

        if (churnError) throw churnError;

        const totalChurn = churnData?.reduce((sum, m) => sum + (m.churn_risk || 0), 0) || 0;
        const avgChurn = churnData?.length ? (totalChurn / churnData.length) : 0;

        // Mock trends for now (could comparisons to last month later)
        const trends = {
            members: 0,
            revenue: 0,
            retention: 0,
            churn: 0
        };

        return NextResponse.json({
            success: true,
            data: {
                totalMembers: totalMembers || 0,
                activeMembers: activeMembers || 0,
                monthlyRevenue: monthlyRevenue,
                retentionRate: 98 - (avgChurn / 5), // Rough estimate formula
                churnRate: parseFloat(avgChurn.toFixed(1)),
                visitTraffic: visitTraffic || 0,
                trends
            }
        });

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
