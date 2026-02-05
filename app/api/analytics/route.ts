import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log("Fetching analytics...");

        // 1. Fetch Revenue Data (Last 6 months)
        // Note: For a real production app with millions of rows, use a materialized view or RPC.
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, created_at, status')
            .eq('status', 'completed')
            .order('created_at', { ascending: true }); // Get all history for aggregation

        if (paymentsError) throw paymentsError;

        // Aggregate by month (JS side aggregation for simplicity in MVP)
        const revenueMap: Record<string, number> = {};
        payments?.forEach(p => {
            const date = new Date(p.created_at);
            const key = date.toLocaleString('default', { month: 'short' });
            revenueMap[key] = (revenueMap[key] || 0) + Number(p.amount);
        });

        // Format for Chart (Last 6 months mock windows if empty)
        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        const revenueData = months.map(m => ({
            month: m,
            revenue: revenueMap[m] || 0,
            forecast: (revenueMap[m] || 0) * 1.1 // Mock forecast 10% growth
        }));


        // 2. Fetch Members for Growth Logic
        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('created_at, status');

        if (membersError) throw membersError;

        const activeCount = members?.filter(m => m.status === 'Active').length || 0;
        const pendingCount = members?.filter(m => m.status === 'Pending').length || 0;

        // Mock weekly breakdown since we might not have timestamps for all seed data
        const memberGrowth = [
            { week: 'Week 1', active: Math.floor(activeCount * 0.2), inactive: 2, newSignups: 1 },
            { week: 'Week 2', active: Math.floor(activeCount * 0.4), inactive: 2, newSignups: 2 },
            { week: 'Week 3', active: Math.floor(activeCount * 0.7), inactive: 3, newSignups: 4 },
            { week: 'Week 4', active: activeCount, inactive: pendingCount, newSignups: 5 },
        ];


        // 3. Revenue by Source (Mock distribution based on totals)
        const totalRevenue = Object.values(revenueMap).reduce((a, b) => a + b, 0);
        const revenueBySource = [
            { name: 'Memberships', value: totalRevenue * 0.8, color: '#8b5cf6' },
            { name: 'PT Sessions', value: totalRevenue * 0.15, color: '#ec4899' },
            { name: 'Products', value: totalRevenue * 0.05, color: '#3b82f6' },
        ];

        return NextResponse.json({
            success: true,
            data: {
                revenueData,
                memberGrowth,
                revenueBySource,
                // Passing back existing mock data for things we don't have tables for yet (Classes)
                classPerformance: [
                    { class: 'HIIT', attendance: 92, capacity: 95, revenue: 48000 },
                    { class: 'Yoga', attendance: 78, capacity: 85, revenue: 35000 },
                    { class: 'Spin', attendance: 88, capacity: 90, revenue: 42000 },
                ],
                retentionData: [
                    { cohort: 'Jan 2025', month1: 100, month2: 88, month3: 82 },
                    { cohort: 'Feb 2025', month1: 100, month2: 90 },
                ]
            }
        });

    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
