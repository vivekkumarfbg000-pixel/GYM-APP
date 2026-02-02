'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { upsellOpportunities, upsellMetrics, type UpsellOpportunity } from '@/lib/mock-data';

export default function UpsellPage() {
    const [selectedOpp, setSelectedOpp] = useState<UpsellOpportunity | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

    const filtered = upsellOpportunities.filter(opp =>
        filter === 'all' || opp.status === filter
    );

    const pendingOpps = upsellOpportunities.filter(o => o.status === 'pending');

    return (
        <div className="space-y-6">
            {/* Header Metrics */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Projected Annual Revenue"
                        value={`₹${(upsellMetrics.projectedAnnualRevenue / 100000).toFixed(1)}L`}
                        subtitle="From 4 opportunities"
                        icon="💰"
                        color="green"
                    />
                    <MetricCard
                        title="Pending Value"
                        value={`₹${(upsellMetrics.pendingValue / 100000).toFixed(1)}L`}
                        subtitle={`${pendingOpps.length} pending offers`}
                        icon="⏳"
                        color="orange"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${upsellMetrics.conversionRate}%`}
                        subtitle="Historical success"
                        icon="📈"
                        color="purple"
                    />
                    <MetricCard
                        title="Avg Increase/Member"
                        value={`₹${(upsellMetrics.avgIncreasePerMember / 1000).toFixed(0)}K`}
                        subtitle="Per year"
                        icon="💎"
                        color="blue"
                    />
                </div>
            </motion.div>

            {/* AI Recommendation Banner */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🤖</span>
                                <div>
                                    <p className="font-bold text-blue-900 text-lg">
                                        {pendingOpps.length} High-Confidence Upsell Opportunities Detected
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        AI identified members ready for upgrade based on engagement patterns • Estimated ₹{(upsellMetrics.pendingValue / 100000).toFixed(1)}L annual revenue
                                    </p>
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                Launch All Offers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All ({upsellOpportunities.length})
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                        >
                            Pending ({upsellOpportunities.filter(o => o.status === 'pending').length})
                        </Button>
                        <Button
                            variant={filter === 'sent' ? 'default' : 'outline'}
                            onClick={() => setFilter('sent')}
                        >
                            Sent ({upsellOpportunities.filter(o => o.status === 'sent').length})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Upsell Opportunities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((opp) => (
                    <UpsellCard
                        key={opp.id}
                        opportunity={opp}
                        onView={() => setSelectedOpp(opp)}
                    />
                ))}
            </div>

            {/* Detail Modal */}
            {selectedOpp && (
                <UpsellDetailModal
                    opportunity={selectedOpp}
                    onClose={() => setSelectedOpp(null)}
                />
            )}
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-red-500',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function UpsellCard({ opportunity, onView }: { opportunity: UpsellOpportunity; onView: () => void }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'converted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return 'text-green-600';
        if (confidence >= 70) return 'text-blue-600';
        return 'text-orange-600';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{opportunity.memberName}</CardTitle>
                        <CardDescription>{opportunity.currentPlan}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upgrade Path */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Suggested Upgrade</p>
                    <p className="font-bold text-lg text-purple-900">{opportunity.suggestedPlan}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm text-gray-500 line-through">₹{opportunity.currentPrice}</span>
                        <span className="text-2xl font-bold text-green-600">₹{opportunity.suggestedPrice}</span>
                        <span className="text-xs text-gray-600">/year</span>
                    </div>
                </div>

                {/* Revenue Impact */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-600">Monthly Increase</p>
                        <p className="text-lg font-bold text-green-600">+₹{opportunity.monthlyIncrease}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Annual Increase</p>
                        <p className="text-lg font-bold text-green-600">+₹{(opportunity.annualIncrease / 1000).toFixed(0)}K</p>
                    </div>
                </div>

                {/* AI Confidence */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">AI Confidence</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${opportunity.confidence}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold ${getConfidenceColor(opportunity.confidence)}`}>
                            {opportunity.confidence}%
                        </span>
                    </div>
                </div>

                {/* Top Reasons (Preview) */}
                <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Key Indicators:</p>
                    <ul className="space-y-1">
                        {opportunity.reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                    {opportunity.reasons.length > 2 && (
                        <button
                            onClick={onView}
                            className="text-xs text-blue-600 hover:underline mt-2"
                        >
                            +{opportunity.reasons.length - 2} more reasons
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                        disabled={opportunity.status !== 'pending'}
                    >
                        Send Offer
                    </Button>
                    <Button variant="outline" onClick={onView}>
                        Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function UpsellDetailModal({ opportunity, onClose }: { opportunity: UpsellOpportunity; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{opportunity.memberName}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                Upsell Opportunity Analysis
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current vs Suggested */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                            <p className="font-bold text-lg">{opportunity.currentPlan}</p>
                            <p className="text-2xl font-bold text-gray-700 mt-2">₹{opportunity.currentPrice}</p>
                        </div>
                        <div className="p-4 border-2 border-purple-300 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600 mb-1">Suggested Plan</p>
                            <p className="font-bold text-lg text-purple-900">{opportunity.suggestedPlan}</p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">₹{opportunity.suggestedPrice}</p>
                        </div>
                    </div>

                    {/* Revenue Impact */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3">Revenue Impact</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-green-700">Monthly</p>
                                <p className="text-xl font-bold text-green-900">+₹{opportunity.monthlyIncrease}</p>
                            </div>
                            <div>
                                <p className="text-xs text-green-700">Annual</p>
                                <p className="text-xl font-bold text-green-900">+₹{(opportunity.annualIncrease / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                                <p className="text-xs text-green-700">Confidence</p>
                                <p className="text-xl font-bold text-green-900">{opportunity.confidence}%</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Reasoning */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">🤖 AI Analysis</h4>
                        <div className="space-y-2">
                            {opportunity.reasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="text-blue-600 font-bold">{idx + 1}</span>
                                    <p className="text-sm text-gray-700">{reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Message Preview */}
                    <div className="p-4 bg-gray-50 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Automated Message Preview</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Hi {opportunity.memberName.split(' ')[0]}! 👋<br /><br />
                            We've noticed your amazing dedication to fitness - you're crushing it! 💪<br /><br />
                            Based on your progress, we think you'd love our <strong>{opportunity.suggestedPlan}</strong>.
                            It includes premium perks that match perfectly with your routine.<br /><br />
                            <strong>Special offer just for you:</strong> Upgrade now and get your first month at the premium rate with no setup fee!<br /><br />
                            Reply YES to learn more, or tap below to schedule a quick chat. 😊
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                            disabled={opportunity.status !== 'pending'}
                        >
                            Send Offer via WhatsApp
                        </Button>
                        <Button variant="outline" className="h-12">
                            Edit Message
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
