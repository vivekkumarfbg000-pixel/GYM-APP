import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { startOfMonth, subMonths, format, parseISO, differenceInDays } from 'date-fns';

async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d'; // 30d, 90d, 1y
    const gymOwnerId = req.headers.get('x-gym-owner-id') || 'public'; // In real app, get from session

    logger.info(`Fetching advanced analytics`, { period });

    try {
        // 1. Fetch relevant data
        // Members for retention and growth
        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('id, join_date, status, membership_type, total_revenue')
            .order('join_date', { ascending: true });

        if (membersError) throw membersError;

        // Mock check-ins for now since table might not be populated
        // In production: const { data: checkIns } = await supabase.from('check_ins')...

        // 2. Calculate Retention Rate
        // Formula: (Members at End - New Members) / Members at Start * 100
        const now = new Date();
        const thirtyDaysAgo = subMonths(now, 1);

        const activeMembers = members.filter(m => m.status === 'Active');
        const joinedLast30Days = members.filter(m => new Date(m.join_date) > thirtyDaysAgo);
        const membersAtStart = members.length - joinedLast30Days.length;

        const retentionRate = membersAtStart > 0
            ? ((activeMembers.length - joinedLast30Days.length) / membersAtStart) * 100
            : 100;

        // 3. Peak Attendance (Heatmap Data)
        // Mock data structure for heatmap: { day: 'Mon', hour: 18, count: 45 }
        const peakHours = generateMockPeakHours();

        // 4. Revenue Projections (Linear Regression or Simple average growth)
        const revenueData = calculateRevenueGrowth(members);

        // 5. Class/Membership Popularity
        const membershipDistribution = members.reduce((acc: any, curr) => {
            acc[curr.membership_type] = (acc[curr.membership_type] || 0) + 1;
            return acc;
        }, {});

        const popularityData = Object.entries(membershipDistribution).map(([name, value]) => ({
            name,
            value
        }));

        return NextResponse.json({
            success: true,
            data: {
                retention: {
                    rate: Math.round(retentionRate),
                    trend: '+2.5%', // Mock trend
                    label: 'Retention Rate'
                },
                peakHours,
                revenueProjection: revenueData,
                popularity: popularityData,
                summary: {
                    totalMembers: members.length,
                    activeMembers: activeMembers.length,
                    totalRevenue: members.reduce((sum, m) => sum + (m.total_revenue || 0), 0)
                }
            }
        });

    } catch (error: any) {
        logger.error('Analytics Fetch Error', error);
        throw ApiErrors.internal('Failed to fetch analytics');
    }
}

// Helpers
function generateMockPeakHours() {
    // Generate data for 7 days x 24 hours
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];

    for (const day of days) {
        for (let hour = 6; hour < 22; hour++) {
            // Peak at 7-9am and 5-8pm
            let base = 10;
            if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
                base = 40;
            }
            const count = Math.floor(Math.random() * 20) + base;
            data.push({ day, hour, count });
        }
    }
    return data;
}

function calculateRevenueGrowth(members: any[]) {
    // Group by month
    const monthlyRevenue = members.reduce((acc: any, member) => {
        const month = format(parseISO(member.join_date), 'MMM yyyy');
        // Estimate revenue based on membership type if actual not available
        const revenue = member.total_revenue || (member.membership_type === 'Annual' ? 5000 : 500);
        acc[month] = (acc[month] || 0) + revenue;
        return acc;
    }, {});

    // Convert to array and sort
    return Object.entries(monthlyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-6); // Last 6 months
}

export const GET = withErrorHandler(handler);
