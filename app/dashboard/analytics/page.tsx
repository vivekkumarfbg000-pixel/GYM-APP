'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('6m');
    const [loading, setLoading] = useState(true);

    // State for Charts
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [memberGrowth, setMemberGrowth] = useState<any[]>([]);
    const [revenueBySource, setRevenueBySource] = useState<any[]>([]);
    const [classPerformance, setClassPerformance] = useState<any[]>([]);
    const [retentionData, setRetentionData] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                const result = await res.json();

                if (result.success) {
                    setRevenueData(result.data.revenueData);
                    setMemberGrowth(result.data.memberGrowth);
                    setRevenueBySource(result.data.revenueBySource);
                    setClassPerformance(result.data.classPerformance);
                    setRetentionData(result.data.retentionData);
                }
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Advanced Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Deep insights into your gym's performance</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1m">Last Month</SelectItem>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value="₹9.63L"
                        change="+15.2%"
                        trend="up"
                        subtitle="Last 6 months"
                    />
                    <MetricCard
                        title="Avg Revenue/Member"
                        value="₹4,819"
                        change="+8.3%"
                        trend="up"
                        subtitle="Monthly average"
                    />
                    <MetricCard
                        title="Member Retention"
                        value="74%"
                        change="+2.1%"
                        trend="up"
                        subtitle="6-month cohort"
                    />
                    <MetricCard
                        title="Forecast (Feb)"
                        value="₹3.10L"
                        change="+6.8%"
                        trend="up"
                        subtitle="AI prediction"
                    />
                </div>
            </motion.div>

            {/* Revenue Forecast Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue & Forecast</CardTitle>
                    <CardDescription>Actual revenue vs AI-powered forecast</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value: any) => typeof value === 'number' ? `₹${value.toLocaleString()}` : '₹0'} />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRevenue)" name="Actual Revenue" />
                            <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorForecast)" name="Forecast" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Growth Trend</CardTitle>
                        <CardDescription>Active vs inactive members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={memberGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="week" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="active" fill="#10b981" name="Active" />
                                <Bar dataKey="newSignups" fill="#3b82f6" name="New Signups" />
                                <Bar dataKey="inactive" fill="#ef4444" name="Inactive" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue by Source */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Distribution</CardTitle>
                        <CardDescription>By revenue stream</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={revenueBySource}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${((entry.value / revenueBySource.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {revenueBySource.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `₹${(typeof value === 'number' ? value : 0).toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {revenueBySource.map((source) => (
                                <div key={source.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                                    <div>
                                        <p className="text-xs text-gray-600">{source.name}</p>
                                        <p className="font-semibold">₹{(source.value / 1000).toFixed(0)}K</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Class Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Performance Analytics</CardTitle>
                    <CardDescription>Attendance vs revenue by class type</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={classPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="class" stroke="#6b7280" />
                            <YAxis yAxisId="left" stroke="#6b7280" />
                            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="attendance" fill="#8b5cf6" name="Attendance %" />
                            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Retention Cohort Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Retention Cohort Analysis</CardTitle>
                    <CardDescription>Member retention by signup month</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={retentionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="cohort" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" domain={[0, 100]} />
                            <Tooltip formatter={(value: any) => `${value}%`} />
                            <Legend />
                            <Line type="monotone" dataKey="month1" stroke="#8b5cf6" strokeWidth={2} name="Month 1" />
                            <Line type="monotone" dataKey="month2" stroke="#ec4899" strokeWidth={2} name="Month 2" />
                            <Line type="monotone" dataKey="month3" stroke="#3b82f6" strokeWidth={2} name="Month 3" />
                            <Line type="monotone" dataKey="month4" stroke="#10b981" strokeWidth={2} name="Month 4" />
                            <Line type="monotone" dataKey="month5" stroke="#f59e0b" strokeWidth={2} name="Month 5" />
                            <Line type="monotone" dataKey="month6" stroke="#ef4444" strokeWidth={2} name="Month 6" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🤖 AI-Powered Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <InsightCard
                        icon="📈"
                        title="Revenue Growth Acceleration"
                        description="Your revenue is growing 15% faster than industry average. HIIT and CrossFit classes are major contributors."
                        action="View Details"
                        color="green"
                    />
                    <InsightCard
                        icon="⚠️"
                        title="Retention Opportunity"
                        description="Members from Jan cohort showing 28% drop after month 2. Recommend targeted engagement campaign."
                        action="Create Campaign"
                        color="orange"
                    />
                    <InsightCard
                        icon="💡"
                        title="Pricing Optimization"
                        description="PT sessions have 85%+ capacity during peak hours. Consider dynamic pricing for 12% revenue boost."
                        action="View Analysis"
                        color="blue"
                    />
                    <InsightCard
                        icon="🎯"
                        title="Class Schedule Optimization"
                        description="Pilates class at 45% capacity. Moving to 7 PM slot could increase attendance by 40%."
                        action="Optimize Schedule"
                        color="purple"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, change, trend, subtitle }: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    subtitle: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant={trend === 'up' ? 'default' : 'destructive'} className={trend === 'up' ? 'bg-green-100 text-green-700' : ''}>
                        {trend === 'up' ? '↑' : '↓'} {change}
                    </Badge>
                    <span className="text-xs text-gray-500">{subtitle}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function InsightCard({ icon, title, description, action, color }: {
    icon: string;
    title: string;
    description: string;
    action: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        green: 'border-green-200 bg-green-50',
        orange: 'border-orange-200 bg-orange-50',
        blue: 'border-blue-200 bg-blue-50',
        purple: 'border-purple-200 bg-purple-50',
    };

    return (
        <div className={`p-4 border rounded-lg ${colors[color]}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{description}</p>
                    <Button variant="outline" size="sm" className="mt-3 text-xs">
                        {action} →
                    </Button>
                </div>
            </div>
        </div>
    );
}
