'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { mockChurnAlerts, mockRevenueMetrics, mockMembers } from '@/lib/mock-data';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RenewalsAlert } from '@/components/dashboard/renewals-alert';
import { UtilizationHeatmap } from '@/components/dashboard/utilization-heatmap';

export default function DashboardPage() {
    const highRiskAlerts = mockChurnAlerts.filter(a => a.riskScore > 75);
    const mediumRiskAlerts = mockChurnAlerts.filter(a => a.riskScore >= 60 && a.riskScore <= 75);

    return (
        <div className="space-y-8">
            {/* Critical Alerts Banner */}
            {highRiskAlerts.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-red-900">
                                    {highRiskAlerts.length} members at critical churn risk
                                </p>
                                <p className="text-sm text-red-700">
                                    Potential revenue loss: ₹{Math.round(highRiskAlerts.reduce((sum, a) => sum + a.potentialRevenueLoss, 0) / 1000)}K
                                </p>
                            </div>
                        </div>
                        <Button variant="destructive" size="sm">
                            Take Action
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Revenue Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Monthly Recurring Revenue"
                    value={`₹${(mockRevenueMetrics.mrr / 1000).toFixed(0)}K`}
                    change="+12.5%"
                    positive
                    icon="💰"
                />
                <MetricCard
                    title="Churn Rate"
                    value={`${mockRevenueMetrics.churnRate}%`}
                    change="-2.3%"
                    positive
                    icon="📉"
                />
                <MetricCard
                    title="Active Members"
                    value={mockRevenueMetrics.activeMembers.toString()}
                    change={`+${mockRevenueMetrics.newMembersThisMonth} this month`}
                    positive
                    icon="👥"
                />
                <MetricCard
                    title="Avg Lifetime Value"
                    value={`₹${(mockRevenueMetrics.avgLTV / 1000).toFixed(0)}K`}
                    change="+8.7%"
                    positive
                    icon="💎"
                />
            </div>

            {/* AI Features Quick Access */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <CardTitle>AI-Powered Features</CardTitle>
                            <CardDescription>Quick access to intelligent automation tools</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <AIFeatureButton
                            icon="🤖"
                            title="AI Trainer"
                            href="/dashboard/ai-trainer"
                            gradient="from-purple-500 to-pink-500"
                        />
                        <AIFeatureButton
                            icon="💎"
                            title="Upsell AI"
                            href="/dashboard/upsell"
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <AIFeatureButton
                            icon="📢"
                            title="Campaigns"
                            href="/dashboard/campaigns"
                            gradient="from-orange-500 to-red-500"
                        />
                        <AIFeatureButton
                            icon="🎯"
                            title="Leads"
                            href="/dashboard/leads"
                            gradient="from-green-500 to-emerald-500"
                        />
                        <AIFeatureButton
                            icon="📈"
                            title="Analytics"
                            href="/dashboard/analytics"
                            gradient="from-indigo-500 to-purple-500"
                        />
                        <AIFeatureButton
                            icon="💰"
                            title="ROI Calc"
                            href="/dashboard/roi-calculator"
                            gradient="from-yellow-500 to-orange-500"
                        />
                    </div>
                </CardContent>
            </Card>


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Churn Risk Alerts - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>AI Churn Risk Alerts</CardTitle>
                                    <CardDescription>Members requiring immediate attention</CardDescription>
                                </div>
                                <Badge variant="destructive" className="text-lg px-3 py-1">
                                    {mockChurnAlerts.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockChurnAlerts.slice(0, 4).map((alert) => (
                                <ChurnAlertCard key={alert.memberId} alert={alert} />
                            ))}
                            {mockChurnAlerts.length > 4 && (
                                <Button variant="outline" className="w-full">
                                    View All {mockChurnAlerts.length} Alerts
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* AI Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                        <CardDescription>Automated recommendations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InsightCard
                            icon="🎯"
                            title="Target Elite Members"
                            description="12 elite members ready for PT upsell"
                            action="Create Campaign"
                            color="blue"
                        />
                        <InsightCard
                            icon="⏰"
                            title="Morning Rush Opportunity"
                            description="6 AM slot 40% underutilized"
                            action="Optimize Schedule"
                            color="purple"
                        />
                        <InsightCard
                            icon="💪"
                            title="Trainer Utilization"
                            description="Raj available 15 hours/week"
                            action="Book Sessions"
                            color="green"
                        />
                        <InsightCard
                            icon="📧"
                            title="Re-engagement Campaign"
                            description="Send to 23 inactive members"
                            action="Launch Now"
                            color="orange"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Member Segment Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Member Segmentation</CardTitle>
                    <CardDescription>AI-powered member categories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SegmentCard segment="Elite" count={mockMembers.filter(m => m.segment === 'Elite').length * 25} color="purple" />
                        <SegmentCard segment="At-Risk" count={mockMembers.filter(m => m.segment === 'At-Risk').length * 25} color="red" />
                        <SegmentCard segment="Social" count={mockMembers.filter(m => m.segment === 'Social').length * 25} color="blue" />
                        <SegmentCard segment="Early Bird" count={mockMembers.filter(m => m.segment === 'Early Bird').length * 25} color="yellow" />
                        <SegmentCard segment="PT Ready" count={mockMembers.filter(m => m.segment === 'PT Ready').length * 25} color="green" />
                        <SegmentCard segment="Regular" count={mockMembers.filter(m => m.segment === 'Regular').length * 25} color="gray" />
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Trend Chart */}
            <RevenueChart />

            {/* Three Column Grid - Quick Actions, Activity Feed, Renewals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuickActions />
                <ActivityFeed />
                <RenewalsAlert />
            </div>

            {/* Utilization Heatmap - Full Width */}
            <UtilizationHeatmap />
        </div>
    );
}

function MetricCard({
    title,
    value,
    change,
    positive,
    icon
}: {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    icon: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        <p className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
                            {change}
                        </p>
                    </div>
                    <div className="text-4xl">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChurnAlertCard({ alert }: { alert: typeof mockChurnAlerts[0] }) {
    const getRiskColor = (score: number) => {
        if (score > 75) return 'destructive';
        if (score > 60) return 'default';
        return 'secondary';
    };

    return (
        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-gray-900">{alert.memberName}</h4>
                    <p className="text-sm text-gray-500">Risk Score: {alert.riskScore}/100</p>
                </div>
                <Badge variant={getRiskColor(alert.riskScore)}>
                    {alert.riskScore > 75 ? 'Critical' : 'High'} Risk
                </Badge>
            </div>

            <div className="space-y-2 mb-3">
                {alert.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span>•</span>
                        <span>{factor}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">AI Suggestion:</span>
                <span className="font-medium text-blue-600">{alert.suggestedAction}</span>
            </div>

            <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="default" className="flex-1">
                    <span className="mr-1">💬</span> WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                    <span className="mr-1">📞</span> Call
                </Button>
            </div>
        </div>
    );
}

function AIFeatureButton({
    icon,
    title,
    href,
    gradient
}: {
    icon: string;
    title: string;
    href: string;
    gradient: string;
}) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
            >
                <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg hover:shadow-xl transition-all`}>
                    <div className="text-center">
                        <div className="text-3xl mb-2">{icon}</div>
                        <p className="text-sm font-semibold">{title}</p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}


function InsightCard({
    icon,
    title,
    description,
    action,
    color
}: {
    icon: string;
    title: string;
    description: string;
    action: string;
    color: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 space-y-2">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm opacity-90">{description}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs">
                        {action}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SegmentCard({ segment, count, color }: { segment: string; count: number; color: string }) {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-700',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        green: 'bg-green-100 text-green-700',
        gray: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className={`p-4 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <p className="text-sm font-medium opacity-80">{segment}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
    );
}
