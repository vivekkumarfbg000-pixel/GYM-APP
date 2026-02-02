'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trainers, ptSessions, ptPackages, mockMembers, type Trainer } from '@/lib/mock-data';

export default function TrainersPage() {
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

    // Calculate metrics
    const totalRevenue = ptSessions.reduce((sum, s) => sum + s.revenue, 0);
    const todaySessions = ptSessions.filter(s => s.status === 'scheduled').length;
    const completedThisMonth = ptSessions.filter(s => s.status === 'completed').length;
    const ptReadyMembers = mockMembers.filter(m => m.segment === 'PT Ready').length * 25;

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
                        title="PT Revenue (Month)"
                        value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
                        subtitle="+35% vs last month"
                        icon="💰"
                        color="green"
                    />
                    <MetricCard
                        title="Today's Sessions"
                        value={todaySessions.toString()}
                        subtitle="2 trainers active"
                        icon="📅"
                        color="blue"
                    />
                    <MetricCard
                        title="PT-Ready Members"
                        value={ptReadyMembers.toString()}
                        subtitle="Upsell opportunity"
                        icon="🎯"
                        color="purple"
                    />
                    <MetricCard
                        title="Completed Sessions"
                        value={completedThisMonth.toString()}
                        subtitle="This month"
                        icon="✅"
                        color="orange"
                    />
                </div>
            </motion.div>

            {/* Upsell Alert Banner */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🎯</span>
                                <div>
                                    <p className="font-bold text-purple-900 text-lg">
                                        {ptReadyMembers} Members Ready for PT Upsell
                                    </p>
                                    <p className="text-sm text-purple-700">
                                        Estimated revenue: ₹{((ptReadyMembers * 13000) / 100000).toFixed(1)}L (10-session packages)
                                    </p>
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                Launch Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trainers List - 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Personal Trainers</CardTitle>
                                    <CardDescription>{trainers.length} active trainers</CardDescription>
                                </div>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    + Add Trainer
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {trainers.map((trainer) => (
                                <TrainerCard
                                    key={trainer.id}
                                    trainer={trainer}
                                    onBook={() => setSelectedTrainer(trainer)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* PT Packages & Schedule - 1 column */}
                <div className="space-y-6">
                    {/* PT Packages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>PT Packages</CardTitle>
                            <CardDescription>Session bundles with savings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {ptPackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                                            <p className="text-sm text-gray-600">{pkg.sessions} sessions</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">
                                            Save ₹{pkg.savings}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl font-bold text-purple-600">₹{pkg.price}</span>
                                        <span className="text-xs text-gray-500">{pkg.validityDays} days</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>Upcoming sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {ptSessions
                                .filter(s => s.status === 'scheduled')
                                .map((session) => {
                                    const trainer = trainers.find(t => t.id === session.trainerId);
                                    return (
                                        <div key={session.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{session.time}</p>
                                                    <p className="text-sm text-gray-600">{session.memberName}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {session.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">with {trainer?.name}</p>
                                            <p className="text-sm font-bold text-blue-600 mt-1">₹{session.revenue}</p>
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                📊 View Full Schedule
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                💰 Commission Report
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                📧 Send PT Upsell Campaign
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                📈 Performance Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Book Session Modal */}
            {selectedTrainer && (
                <BookSessionModal
                    trainer={selectedTrainer}
                    onClose={() => setSelectedTrainer(null)}
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

function TrainerCard({ trainer, onBook }: { trainer: Trainer; onBook: () => void }) {
    const sessions = ptSessions.filter(s => s.trainerId === trainer.id);
    const monthlyRevenue = sessions.reduce((sum, s) => sum + s.revenue, 0);

    return (
        <div className="p-4 border rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{trainer.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                    ⭐ {trainer.rating}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    {trainer.sessionsCompleted} sessions
                                </span>
                            </div>
                        </div>
                        <Button size="sm" onClick={onBook}>
                            Book Session
                        </Button>
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {trainer.specialization.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {spec}
                            </Badge>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Rate/Hour</p>
                            <p className="font-semibold">₹{trainer.hourlyRate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Commission</p>
                            <p className="font-semibold">{trainer.commissionRate}%</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Month Revenue</p>
                            <p className="font-semibold text-green-600">₹{(monthlyRevenue / 1000).toFixed(0)}K</p>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="mt-3 text-xs text-gray-600">
                        <span className="font-medium">Available:</span> {trainer.availability.join(', ')}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookSessionModal({ trainer, onClose }: { trainer: Trainer; onClose: () => void }) {
    const ptReadyMembers = mockMembers.filter(m => m.segment === 'PT Ready');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Book PT Session</CardTitle>
                            <CardDescription>with {trainer.name}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                        <p className="text-3xl font-bold text-purple-900">₹{trainer.hourlyRate}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Recommended Members</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            {ptReadyMembers.length * 25} PT-Ready members based on AI analysis
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {ptReadyMembers.slice(0, 5).map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-gray-500">Engagement: {member.engagementScore}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs">
                                        Select
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Available Packages</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {ptPackages.slice(0, 2).map((pkg) => (
                                <div key={pkg.id} className="p-3 border rounded-lg text-center hover:border-purple-300 cursor-pointer">
                                    <p className="text-xs text-gray-600">{pkg.sessions} sessions</p>
                                    <p className="font-bold text-purple-600">₹{pkg.price}</p>
                                    <Badge className="text-xs mt-1 bg-green-100 text-green-700">
                                        Save ₹{pkg.savings}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                        Schedule Session
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
