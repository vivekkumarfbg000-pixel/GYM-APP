import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';

// Generate report data for PDF generation
async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gymOwnerId = searchParams.get('gymOwnerId');
    const reportType = searchParams.get('type'); // 'attendance', 'revenue', 'members'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!gymOwnerId || !reportType) {
        throw ApiErrors.badRequest('Missing required parameters');
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    try {
        let reportData: any = {};

        switch (reportType) {
            case 'attendance':
                reportData = await generateAttendanceReport(gymOwnerId, start, end);
                break;
            case 'revenue':
                reportData = await generateRevenueReport(gymOwnerId, start, end);
                break;
            case 'members':
                reportData = await generateMembersReport(gymOwnerId, start, end);
                break;
            default:
                throw ApiErrors.badRequest('Invalid report type');
        }

        return NextResponse.json({
            success: true,
            data: reportData
        });
    } catch (error: any) {
        console.error('Report generation failed:', error);
        throw ApiErrors.internal('Failed to generate report');
    }
}

async function generateAttendanceReport(gymOwnerId: string, startDate: string, endDate: string) {
    // Get check-ins data
    const { data: checkIns, error } = await supabase
        .from('check_ins')
        .select('*, members(name, email)')
        .eq('gym_owner_id', gymOwnerId)
        .gte('check_in_time', startDate)
        .lte('check_in_time', endDate)
        .order('check_in_time', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const totalCheckIns = checkIns?.length || 0;
    const uniqueMembers = new Set(checkIns?.map(c => c.member_id)).size;
    const avgDuration = checkIns
        ?.filter(c => c.duration_minutes)
        .reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / (checkIns?.filter(c => c.duration_minutes).length || 1);

    // Group by day
    const byDay: { [key: string]: number } = {};
    checkIns?.forEach(c => {
        const day = new Date(c.check_in_time).toISOString().split('T')[0];
        byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
        title: 'Attendance Report',
        dateRange: { start: startDate, end: endDate },
        summary: {
            totalCheckIns,
            uniqueMembers,
            avgDuration: Math.round(avgDuration),
            peakDay: Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0]
        },
        details: checkIns?.slice(0, 100).map(c => ({
            memberName: c.members?.name,
            checkInTime: c.check_in_time,
            checkOutTime: c.check_out_time,
            duration: c.duration_minutes
        })),
        chartData: Object.entries(byDay).map(([date, count]) => ({ date, count }))
    };
}

async function generateRevenueReport(gymOwnerId: string, startDate: string, endDate: string) {
    // Get payments data
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*, members(name)')
        .eq('gym_owner_id', gymOwnerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

    // Group by payment method
    const byMethod: { [key: string]: number } = {};
    payments?.forEach(p => {
        byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + p.amount;
    });

    return {
        title: 'Revenue Report',
        dateRange: { start: startDate, end: endDate },
        summary: {
            totalRevenue,
            successfulPayments,
            pendingPayments,
            avgTransaction: Math.round(totalRevenue / (payments?.length || 1))
        },
        details: payments?.slice(0, 100).map(p => ({
            memberName: p.members?.name,
            amount: p.amount,
            method: p.payment_method,
            status: p.status,
            date: p.created_at
        })),
        chartData: Object.entries(byMethod).map(([method, total]) => ({ method, total }))
    };
}

async function generateMembersReport(gymOwnerId: string, startDate: string, endDate: string) {
    // Get members data
    const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .eq('gym_owner_id', gymOwnerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const totalMembers = members?.length || 0;
    const activeMembers = members?.filter(m => m.membership_status === 'active').length || 0;
    const inactiveMembers = members?.filter(m => m.membership_status !== 'active').length || 0;

    return {
        title: 'New Members Report',
        dateRange: { start: startDate, end: endDate },
        summary: {
            totalMembers,
            activeMembers,
            inactiveMembers,
            retentionRate: Math.round((activeMembers / totalMembers) * 100) || 0
        },
        details: members?.slice(0, 100).map(m => ({
            name: m.name,
            email: m.email,
            joinDate: m.created_at,
            status: m.membership_status
        }))
    };
}

export const GET = withErrorHandler(handler);
