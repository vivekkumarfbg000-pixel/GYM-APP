import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { startOfDay, subDays, format, getHours, getDay } from 'date-fns';

export async function GET() {
    try {
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30).toISOString();

        // Fetch attendance for last 30 days
        const { data: attendance, error } = await supabase
            .from('attendance')
            .select('check_in, member_id')
            .gte('check_in', thirtyDaysAgo);

        if (error) throw error;

        // 1. Peak Hours (Aggregate by hour of day)
        const hoursMap = new Array(24).fill(0);
        attendance.forEach((record: any) => {
            const hour = getHours(new Date(record.check_in));
            hoursMap[hour]++;
        });

        // Format for Chart: "6 AM", "7 AM", etc.
        const peakHoursData = hoursMap.map((count, hour) => {
            const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
            return { hour: label, count };
        }).filter((_, i) => i >= 5 && i <= 22); // Filter reasonable gym hours (5 AM - 10 PM)

        // 2. Weekly Trend (Last 7 days)
        const last7DaysMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'EEE'); // "Mon", "Tue"
            last7DaysMap.set(dateStr, 0);
        }

        attendance.forEach((record: any) => {
            const date = new Date(record.check_in);
            // Check if within last 7 days
            if (date >= subDays(today, 7)) {
                const dayStr = format(date, 'EEE');
                if (last7DaysMap.has(dayStr)) {
                    last7DaysMap.set(dayStr, last7DaysMap.get(dayStr) + 1);
                }
            }
        });

        const weeklyTrendData = Array.from(last7DaysMap.entries()).map(([day, visits]) => ({ day, visits }));

        // 3. Visit Frequency (Member segmentation based on visits in last 30 days)
        const memberVisits: Record<string, number> = {};
        attendance.forEach((record: any) => {
            memberVisits[record.member_id] = (memberVisits[record.member_id] || 0) + 1;
        });

        let daily = 0, regular = 0, occasional = 0, rare = 0;

        Object.values(memberVisits).forEach(count => {
            if (count >= 20) daily++;
            else if (count >= 12) regular++;
            else if (count >= 4) occasional++;
            else rare++;
        });

        const visitFrequencyData = [
            { name: 'Daily (20+)', count: daily, color: '#10b981' }, // Green
            { name: 'Regular (12-19)', count: regular, color: '#3b82f6' }, // Blue
            { name: 'Occasional (4-11)', count: occasional, color: '#f59e0b' }, // Yellow
            { name: 'Rare (1-3)', count: rare, color: '#ef4444' }, // Red
        ];

        return NextResponse.json({
            success: true,
            data: {
                peakHours: peakHoursData,
                weeklyTrend: weeklyTrendData,
                visitFrequency: visitFrequencyData
            }
        });

    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
