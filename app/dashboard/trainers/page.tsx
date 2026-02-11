'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, FileText, Activity, Brain } from 'lucide-react';
import { mockMembers, mockPendingWorkouts, type PendingWorkout } from '@/lib/mock-data';
import { DbTrainer, DbPtSession, DbPtPackage } from '@/lib/supabase';

export default function TrainersPage() {
    const [selectedTrainer, setSelectedTrainer] = useState<DbTrainer | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [reviewWorkout, setReviewWorkout] = useState<PendingWorkout | null>(null);

    // Real Data State
    const [trainersList, setTrainersList] = useState<DbTrainer[]>([]);
    const [sessionsList, setSessionsList] = useState<DbPtSession[]>([]);
    const [packagesList, setPackagesList] = useState<DbPtPackage[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Trainers
                const tRes = await fetch('/api/trainers');
                const tData = await tRes.json();
                if (tData.success) setTrainersList(tData.data);

                // Fetch Sessions (For creating the "Today's Sessions" view, we might need to iterate or fetch all active)
                // For MVP, we'll fetch sessions for the first trainer found or all if API supported it
                // Ideally, we'd have an endpoint /api/gyms/sessions?date=today
                // We'll mock the session fetching for ALL trainers by looping for now or assume the API returns relevant ones
                // Let's assume we fetch for the first few trainers to populate the list
                if (tData.data.length > 0) {
                    const sRes = await fetch(`/api/trainers/sessions?trainerId=${tData.data[0].id}`);
                    const sData = await sRes.json();
                    if (sData.success) setSessionsList(sData.data);
                }

                // Fetch Packages
                const pRes = await fetch('/api/trainers/packages');
                const pData = await pRes.json();
                if (pData.success) setPackagesList(pData.data);

            } catch (error) {
                console.error("Failed to load trainer data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Derived metrics
    const totalRevenue = sessionsList.reduce((sum, s) => sum + (s.price_at_booking || 0), 0);
    const todaySessions = sessionsList.filter(s => s.status === 'scheduled').length; // Naive check, date comparison needed in real app
    const completedThisMonth = sessionsList.filter(s => s.status === 'completed').length;
    const ptReadyMembers = mockMembers.filter(m => m.segment === 'PT Ready').length * 25;
    const pendingReviews = mockPendingWorkouts.filter(w => w.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Trainer Command Center
                    </h1>
                    <p className="text-gray-600 mt-1">Manage schedules, sales, and AI workout approvals</p>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="grid w-full md:w-auto grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="ai-oversight" className="relative">
                            AI Oversight
                            {pendingReviews > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {pendingReviews}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <TabsContent value="overview" className="space-y-6">
                {/* Header Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="PT Revenue (Est)"
                            value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
                            subtitle="Based on loaded sessions"
                            icon="💰"
                            color="green"
                        />
                        <MetricCard
                            title="Scheduled Sessions"
                            value={todaySessions.toString()}
                            subtitle={`${trainersList.length} trainers active`}
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
                            title="Pending Reviews"
                            value={pendingReviews.toString()}
                            subtitle="AI Workouts"
                            icon="🤖"
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
                                        <CardDescription>{trainersList.length} active trainers</CardDescription>
                                    </div>
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                        + Add Trainer
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? (
                                    <p className="text-center py-4 text-gray-500">Loading trainers...</p>
                                ) : trainersList.length === 0 ? (
                                    <p className="text-center py-4 text-gray-500">No trainers found. Add one to get started.</p>
                                ) : (
                                    trainersList.map((trainer) => (
                                        <TrainerCard
                                            key={trainer.id}
                                            trainer={trainer}
                                            sessions={sessionsList.filter(s => s.trainer_id === trainer.id)}
                                            onBook={() => setSelectedTrainer(trainer)}
                                        />
                                    ))
                                )}
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
                                {packagesList.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-2">No packages active</p>
                                ) : (
                                    packagesList.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                                                    <p className="text-sm text-gray-600">{pkg.session_count} sessions</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700">
                                                    {pkg.validity_days} days
                                                </Badge>
                                            </div>
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-2xl font-bold text-purple-600">₹{pkg.price}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Sessions</CardTitle>
                                <CardDescription>Latest bookings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sessionsList.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-2">No active sessions</p>
                                ) : (
                                    sessionsList.slice(0, 5).map((session) => (
                                        <div key={session.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(session.start_time).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{session.member?.name || 'Member'}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {session.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">with {session.trainer?.name}</p>
                                            <p className="text-sm font-bold text-blue-600 mt-1">₹{session.price_at_booking}</p>
                                        </div>
                                    ))
                                )}
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
            </TabsContent>

            <TabsContent value="ai-oversight">
                {/* ... existing AI oversight content ... */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-t-4 border-t-purple-600">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="text-purple-600" />
                                    AI Workout Review Queue
                                </CardTitle>
                                <CardDescription>
                                    Workouts generated by members that require professional trainer oversight.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {mockPendingWorkouts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                                        <p className="text-lg font-medium">All caught up!</p>
                                        <p>No workouts pending review.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {mockPendingWorkouts.map(workout => (
                                            <div
                                                key={workout.id}
                                                className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => setReviewWorkout(workout)}
                                            >
                                                {/* Consistent UI from previous version */}
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${workout.riskLevel === 'high' ? 'from-red-500 to-orange-500' :
                                                        workout.riskLevel === 'medium' ? 'from-yellow-400 to-orange-400' :
                                                            'from-green-400 to-blue-500'
                                                        }`}>
                                                        {workout.memberName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{workout.memberName}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span>{workout.goal}</span>
                                                            <span>•</span>
                                                            <span>{workout.exercises} Exercises</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {new Date(workout.generatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <Button size="sm" variant="ghost" className="mt-1 text-purple-600 h-8">
                                                        Review →
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            {/* Book Session Modal */}
            {selectedTrainer && (
                <BookSessionModal
                    trainer={selectedTrainer}
                    packages={packagesList}
                    onClose={() => setSelectedTrainer(null)}
                />
            )}

            {/* AI Workout Review Modal */}
            {reviewWorkout && (
                <WorkoutReviewModal
                    workout={reviewWorkout}
                    onClose={() => setReviewWorkout(null)}
                />
            )}
        </div>
    );
}

// Helper Components (Updated Types)

function MetricCard({ title, value, subtitle, icon, color }: any) {
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

function TrainerCard({ trainer, sessions, onBook }: { trainer: DbTrainer; sessions: DbPtSession[]; onBook: () => void }) {
    const monthlyRevenue = sessions.reduce((sum, s) => sum + (s.price_at_booking || 0), 0);

    return (
        <div className="p-4 border rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{trainer.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                    ⭐ {trainer.rating}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    {trainer.sessions_conducted} sessions
                                </span>
                            </div>
                        </div>
                        <Button size="sm" onClick={onBook}>
                            Book Session
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                            {trainer.specialization}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Rate/Hour</p>
                            <p className="font-semibold">₹{trainer.hourly_rate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Commission</p>
                            <p className="font-semibold">{trainer.commission_rate}%</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Revenue</p>
                            <p className="font-semibold text-green-600">₹{(monthlyRevenue / 1000).toFixed(0)}K</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookSessionModal({ trainer, packages, onClose }: { trainer: DbTrainer; packages: DbPtPackage[]; onClose: () => void }) {
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
                        <p className="text-3xl font-bold text-purple-900">₹{trainer.hourly_rate}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Recommended Members</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            {ptReadyMembers.length * 25} PT-Ready members based on AI analysis
                        </p>
                        {/* Mock member list for booking demo */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {ptReadyMembers.slice(0, 3).map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-gray-500">Engagement: {member.engagementScore}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs">Select</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Available Packages</h4>
                        {packages.length === 0 ? <p className="text-sm text-gray-400">No active packages</p> : (
                            <div className="grid grid-cols-2 gap-2">
                                {packages.slice(0, 2).map((pkg) => (
                                    <div key={pkg.id} className="p-3 border rounded-lg text-center hover:border-purple-300 cursor-pointer">
                                        <p className="text-xs text-gray-600">{pkg.session_count} sessions</p>
                                        <p className="font-bold text-purple-600">₹{pkg.price}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                        Schedule Session (Demo)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function WorkoutReviewModal({ workout, onClose }: { workout: PendingWorkout; onClose: () => void }) {
    // Reuse existing implementation but wrapped properly
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/trainers/approve-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workoutId: workout.id,
                    status: 'approved',
                    approvedBy: 'Trainer' // In real app, get from auth context
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`Workout plan for ${workout.memberName} approved!`);
                onClose();
            } else {
                toast.error(data.error || 'Failed to approve workout');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to process request");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-xl w-full">
                <CardHeader>
                    <CardTitle>Review Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">{workout.memberName} - {workout.goal}</p>
                    <p className="mb-4 text-sm text-gray-500">{workout.aiNotes}</p>
                    <div className="flex gap-2">
                        <Button onClick={handleApprove} className="w-full bg-green-600">Approve</Button>
                        <Button onClick={onClose} variant="outline" className="w-full">Cancel</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ExerciseRow({ name, duration, info }: { name: string, duration: string, info: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div>
                <p className="font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{info}</p>
            </div>
            <Badge variant="secondary">{duration}</Badge>
        </div>
    );
}
