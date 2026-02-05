'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { UtilizationHeatmap } from '@/components/dashboard/utilization-heatmap';
import { DashboardSkeleton } from '@/components/shared/skeleton-loaders';
import { format } from 'date-fns';
import { SmartCommandCenter } from '@/components/dashboard/smart-command-center';
import { GymPulseFeed } from '@/components/dashboard/gym-pulse-feed';
import { ChurnRiskList } from '@/components/dashboard/churn-risk-list';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        monthlyRevenue: 0,
        retentionRate: 0,
        churnRate: 0,
        visitTraffic: 0
    });

    const [trends, setTrends] = useState({
        members: 5.2,
        revenue: 8.1,
        retention: -1.2,
        churn: -0.5
    });

    const [today, setToday] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const result = await res.json();

                if (result.success) {
                    setStats(result.data);
                } else {
                    console.error("Failed to load dashboard stats:", result.error);
                }
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        setToday(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">{today}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-100">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        System Operational
                    </div>
                </div>
            </div>

            {/* Top-Level Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/payments">
                    <MetricCard
                        title="Total Revenue"
                        value={`$${stats.monthlyRevenue.toLocaleString()}`}
                        change={trends.revenue}
                        icon={DollarSign}
                        trend="up"
                    />
                </Link>
                <Link href="/dashboard/members">
                    <MetricCard
                        title="Active Members"
                        value={stats.activeMembers}
                        change={trends.members}
                        icon={Users}
                        trend="up"
                    />
                </Link>
                <Link href="/dashboard/analytics">
                    <MetricCard
                        title="Retention Rate"
                        value={`${stats.retentionRate}%`}
                        change={trends.churn}
                        icon={Activity}
                        trend="neutral"
                        inverseTrend // negative churn is good
                    />
                </Link>
                <Link href="/dashboard/attendance">
                    <MetricCard
                        title="Avg. Daily Visits"
                        value={stats.visitTraffic}
                        change={12.5}
                        icon={TrendingUp}
                        trend="up"
                    />
                </Link>
            </div>

            {/* Main Content Grid: Command Center & Pulse Feed */}
            {/* Main Content Grid: Command Center & Pulse Feed */}
            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">

                {/* Left Column: Command Center & Charts (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                    {/* Command Center */}
                    <div className="h-[340px]">
                        <SmartCommandCenter />
                    </div>

                    {/* Revenue Chart */}
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <RevenueChart />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Intelligence Feed & Heatmap (3 cols) */}
                <div className="md:col-span-3 space-y-6">

                    {/* Churn Risk Monitor (NEW) */}
                    <div className="h-[340px]">
                        <ChurnRiskList />
                    </div>

                    {/* Utilization Heatmap */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Peak Hours</CardTitle>
                            <CardDescription>Live gym traffic heatmap</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UtilizationHeatmap />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
