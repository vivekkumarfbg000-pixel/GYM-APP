'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ROICalculatorPage() {
    const [totalMembers, setTotalMembers] = useState(200);
    const [avgMembershipValue, setAvgMembershipValue] = useState(18000);
    const [currentChurnRate, setCurrentChurnRate] = useState(30);
    const [ptHourlyRate, setPtHourlyRate] = useState(1000);
    const [trainerUtilization, setTrainerUtilization] = useState(60);

    // Calculations
    const churnedMembers = Math.round((totalMembers * currentChurnRate) / 100);
    const currentRevenueLoss = churnedMembers * avgMembershipValue;

    // With GymFlow AI
    const churnReduction = 50; // Save 50% of at-risk members
    const savedMembers = Math.round(churnedMembers * (churnReduction / 100));
    const revenueRecovered = savedMembers * avgMembershipValue;

    // PT Optimization
    const utilizationIncrease = 25; // Increase utilization by 25%
    const additionalPTRevenue = Math.round(
        (totalMembers * 0.2) * // 20% buy PT
        4 * // 4 sessions/month
        ptHourlyRate *
        (utilizationIncrease / 100)
    );

    // Campaign improvements
    const campaignRevenue = Math.round(totalMembers * 0.15 * 2000); // 15% response, ₹2000 avg upsell

    // Total gains
    const totalAnnualGain = revenueRecovered + additionalPTRevenue + campaignRevenue;

    // Software cost
    const monthlyPlan = totalMembers <= 100 ? 2999 : totalMembers <= 300 ? 5999 : 9999;
    const annualSoftwareCost = monthlyPlan * 12;

    // Net profit
    const netProfit = totalAnnualGain - annualSoftwareCost;
    const roi = ((netProfit / annualSoftwareCost) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-2xl">ROI Calculator</CardTitle>
                        <CardDescription>
                            Calculate your exact revenue increase with GymFlow AI
                        </CardDescription>
                    </CardHeader>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Gym Details</CardTitle>
                            <CardDescription>Enter your current numbers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="members">Total Active Members</Label>
                                <Input
                                    id="members"
                                    type="number"
                                    value={totalMembers}
                                    onChange={(e) => setTotalMembers(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="membership">Average Member Lifetime Value (₹)</Label>
                                <Input
                                    id="membership"
                                    type="number"
                                    value={avgMembershipValue}
                                    onChange={(e) => setAvgMembershipValue(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                                <p className="text-xs text-gray-500">
                                    Typical: ₹15,000 - ₹25,000 per member
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="churn">Current Annual Churn Rate (%)</Label>
                                <Input
                                    id="churn"
                                    type="number"
                                    value={currentChurnRate}
                                    onChange={(e) => setCurrentChurnRate(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                                <p className="text-xs text-gray-500">
                                    Industry average: 30-40%
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ptrate">PT Hourly Rate (₹)</Label>
                                <Input
                                    id="ptrate"
                                    type="number"
                                    value={ptHourlyRate}
                                    onChange={(e) => setPtHourlyRate(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="utilization">Current Trainer Utilization (%)</Label>
                                <Input
                                    id="utilization"
                                    type="number"
                                    value={trainerUtilization}
                                    onChange={(e) => setTrainerUtilization(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                                <p className="text-xs text-gray-500">
                                    Average: 60-70%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Current Situation */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-900">Current Revenue Loss</CardTitle>
                                <CardDescription className="text-red-700">
                                    Without GymFlow AI
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-gray-700">Members Lost Annually:</span>
                                    <span className="text-3xl font-bold text-red-900">{churnedMembers}</span>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-gray-700">Revenue Loss:</span>
                                    <span className="text-3xl font-bold text-red-900">
                                        ₹{(currentRevenueLoss / 100000).toFixed(2)}L
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Revenue Recovery */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900">Revenue Gains with GymFlow AI</CardTitle>
                                <CardDescription className="text-green-700">
                                    Annual revenue increase
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">Churn Prevention (50% saved)</span>
                                    <span className="font-bold text-green-900">₹{(revenueRecovered / 100000).toFixed(2)}L</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">PT Optimization (+25% utilization)</span>
                                    <span className="font-bold text-green-900">₹{(additionalPTRevenue / 100000).toFixed(2)}L</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">Smart Campaigns (15% response)</span>
                                    <span className="font-bold text-green-900">₹{(campaignRevenue / 100000).toFixed(2)}L</span>
                                </div>
                                <div className="border-t-2 border-green-300 pt-3 mt-3">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-lg font-semibold text-gray-900">Total Annual Gain:</span>
                                        <span className="text-4xl font-bold text-green-900">
                                            ₹{(totalAnnualGain / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Final ROI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                            <CardHeader>
                                <CardTitle className="text-purple-900">Your Investment & ROI</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">GymFlow AI Cost (annual):</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{(annualSoftwareCost / 1000).toFixed(0)}K
                                    </span>
                                </div>
                                <div className="border-t-2 border-purple-300 pt-4">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-lg font-semibold text-gray-900">Net Profit:</span>
                                        <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            ₹{(netProfit / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Return on Investment:</span>
                                        <span className="text-4xl font-bold text-purple-600">
                                            {roi}x
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-purple-200">
                                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg">
                                        Start Free Trial - 30 Days
                                    </Button>
                                    <p className="text-center text-xs text-gray-600 mt-2">
                                        Money-back guarantee • No credit card required
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Additional Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>What You Get with GymFlow AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FeatureItem
                                icon="🎯"
                                title="Churn Prediction"
                                description="AI identifies at-risk members 30 days before they leave"
                            />
                            <FeatureItem
                                icon="📢"
                                title="Smart Campaigns"
                                description="Automated WhatsApp campaigns with 12-15% response rates"
                            />
                            <FeatureItem
                                icon="💪"
                                title="PT Optimization"
                                description="Maximize trainer utilization and revenue per session"
                            />
                            <FeatureItem
                                icon="📊"
                                title="Revenue Analytics"
                                description="Real-time dashboards showing exactly where money is made/lost"
                            />
                            <FeatureItem
                                icon="🤖"
                                title="AI Insights"
                                description="Daily recommendations on upselling and retention opportunities"
                            />
                            <FeatureItem
                                icon="✅"
                                title="Easy Setup"
                                description="Get started in 1 day with free data migration"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="flex gap-3">
            <div className="text-3xl">{icon}</div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}
