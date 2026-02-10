'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/dashboard/analytics/advanced?period=${timeRange}`);
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            } else {
                toast.error('Failed to load analytics');
            }
        } catch (error) {
            console.error("Error loading analytics:", error);
            toast.error('Network error loading analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Advanced Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Deep insights into retention, revenue, and attendance</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 3 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <MetricCard
                    title="Retention Rate"
                    value={`${data.retention?.rate}%`}
                    change={data.retention?.trend}
                    trend="up"
                    subtitle="vs last month"
                    color="green"
                />
                <MetricCard
                    title="Active Members"
                    value={data.summary?.activeMembers?.toString() || '0'}
                    change={`${((data.summary?.activeMembers / data.summary?.totalMembers) * 100).toFixed(1)}%`}
                    trend="up"
                    subtitle="of total members"
                    color="blue"
                />
                <MetricCard
                    title="Projected Revenue"
                    value={`₹${(data.summary?.totalRevenue || 0).toLocaleString()}`}
                    change="+12%" // Mock for now
                    trend="up"
                    subtitle="based on active plans"
                    color="purple"
                />
                <MetricCard
                    title="Churn Risk"
                    value="12%"
                    change="-2%"
                    trend="down" // Good thing
                    subtitle="predicted this month"
                    color="orange"
                />
            </motion.div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue Projection */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Revenue Growth</CardTitle>
                        <CardDescription>Historical revenue vs projections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.revenueProjection}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip formatter={(val: any) => typeof val === 'number' ? `₹${val.toLocaleString()}` : val} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Membership Popularity */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Membership Distribution</CardTitle>
                        <CardDescription>Popularity by plan type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.popularity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.popularity?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Peak Hours Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Peak Attendance Hours</CardTitle>
                    <CardDescription>Heatmap of gym traffic by day and hour</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full overflow-x-auto">
                        <PeakHoursHeatmap data={data.peakHours} />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function MetricCard({ title, value, change, trend, subtitle, color = 'blue' }: any) {
    const colors: any = {
        green: 'text-green-600 bg-green-50 border-green-200',
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        purple: 'text-purple-600 bg-purple-50 border-purple-200',
        orange: 'text-orange-600 bg-orange-50 border-orange-200',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-gray-900">{value}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className={`${colors[color]}`}>
                        {trend === 'up' ? '↗' : '↘'} {change}
                    </Badge>
                    <span className="text-xs text-gray-500">{subtitle}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function PeakHoursHeatmap({ data }: { data: any[] }) {
    // Determine max value for opacity scaling
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

    const getIntensity = (count: number) => {
        const intensity = count / maxCount;
        if (intensity < 0.2) return 'bg-blue-50';
        if (intensity < 0.4) return 'bg-blue-100';
        if (intensity < 0.6) return 'bg-blue-300';
        if (intensity < 0.8) return 'bg-blue-500';
        return 'bg-blue-700';
    };

    return (
        <div className="min-w-[600px]">
            <div className="grid grid-cols-[50px_repeat(16,1fr)] gap-1">
                {/* Header Row (Hours) */}
                <div className="text-xs font-semibold text-gray-400"></div>
                {hours.map(h => (
                    <div key={h} className="text-xs text-center text-gray-500 font-medium">
                        {h}:00
                    </div>
                ))}

                {/* Rows for Days */}
                {days.map(day => (
                    <>
                        <div key={`label-${day}`} className="text-xs font-semibold text-gray-600 flex items-center">
                            {day}
                        </div>
                        {hours.map(hour => {
                            const point = data.find(d => d.day === day && d.hour === hour);
                            const count = point ? point.count : 0;
                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    className={`h-8 rounded-sm transition-all hover:ring-2 ring-blue-400 cursor-pointer ${getIntensity(count)}`}
                                    title={`${day} ${hour}:00 - ${count} members`}
                                />
                            );
                        })}
                    </>
                ))}
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500">
                <span>Low Traffic</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-blue-50 rounded"></div>
                    <div className="w-4 h-4 bg-blue-300 rounded"></div>
                    <div className="w-4 h-4 bg-blue-700 rounded"></div>
                </div>
                <span>High Peak</span>
            </div>
        </div>
    );
}
