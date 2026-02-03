'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Calendar, Zap, MapPin, ChevronRight, Activity, CreditCard, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MobileDashboardSkeleton } from '@/components/shared/skeleton-loaders';

import { StreakCard } from '@/components/mobile/streak-card';

export default function MobileDashboard() {
    const [name, setName] = useState('');
    const [stats, setStats] = useState({ workouts: 0, distance: 0, calories: 0 });
    const [memberData, setMemberData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [streakData, setStreakData] = useState({ streak: 0, lastCheckIn: '' });

    const router = useRouter();

    useEffect(() => {
        const memberId = localStorage.getItem('gymflow_member_id');
        const memberName = localStorage.getItem('gymflow_member_name');

        if (!memberId) {
            router.push('/mobile/login');
            return;
        }

        setName(memberName || 'Member');
        loadDashboardData(memberId);
        handleCheckIn(memberId);
    }, [router]);

    const handleCheckIn = async (memberId: string) => {
        try {
            const res = await fetch('/api/member/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            const data = await res.json();
            if (data.success && data.firstCheckIn) {
                toast.success(`Daily Check-in! +${data.pointsAdded} Points 🔥`);
                // Update local state for immediate feedback
                setStreakData(prev => ({ ...prev, streak: data.streak, lastCheckIn: new Date().toISOString().split('T')[0] }));
            }
        } catch (error) {
            console.error('Check-in failed', error);
        }
    };

    const loadDashboardData = async (memberId: string) => {
        try {
            // 1. Fetch Profile Status
            const profileRes = await fetch(`/api/member/profile?memberId=${memberId}`);
            const profileData = await profileRes.json();
            if (profileData.success) {
                setMemberData(profileData.data);
                // Set initial streak data from profile
                setStreakData({
                    streak: profileData.data.daily_streak || 0,
                    lastCheckIn: profileData.data.last_streak_date || ''
                });
            }

            // 2. Fetch Workouts
            const historyRes = await fetch(`/api/member/workouts?memberId=${memberId}`);
            const historyData = await historyRes.json();

            if (historyData.success && historyData.data) {
                // Calculate totals
                const totalStats = historyData.data.reduce((acc: any, curr: any) => ({
                    workouts: acc.workouts + 1,
                    distance: acc.distance + (curr.distance_meters || 0),
                    calories: acc.calories + (curr.calories_burned || 0)
                }), { workouts: 0, distance: 0, calories: 0 });

                setStats(totalStats);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async () => {
        setProcessing(true);
        try {
            const memberId = localStorage.getItem('gymflow_member_id');
            const res = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId,
                    amount: 2999,
                    paymentMethod: 'card'
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Payment Successful!');
                setShowPayModal(false);
                if (memberId) loadDashboardData(memberId); // Refresh status
            } else {
                toast.error('Payment failed: ' + data.error);
            }
        } catch (error) {
            toast.error('Payment error');
        }
        setProcessing(false);
    };

    const isMembershipActive = memberData?.membership_status === 'active';
    const nextBillDate = memberData?.next_payment_date ? new Date(memberData.next_payment_date).toLocaleDateString() : 'N/A';

    if (loading) {
        return <MobileDashboardSkeleton />;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-xl shadow-blue-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Welcome back,</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
                    </div>
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                        {name.charAt(0)}
                    </div>
                </div>

                {/* Streak Card */}
                <div className="mb-8">
                    <StreakCard streak={streakData.streak} lastCheckIn={streakData.lastCheckIn} />
                </div>

                {/* Stats Row */}
                <div className="flex justify-between text-center">
                    <div className="bg-blue-700/30 p-3 rounded-2xl w-[30%] backdrop-blur-sm border border-blue-500/30">
                        <p className="text-xl font-bold text-white">{stats.workouts}</p>
                        <p className="text-[10px] text-blue-100 uppercase tracking-wide font-medium">Workouts</p>
                    </div>
                    <div className="bg-blue-700/30 p-3 rounded-2xl w-[30%] backdrop-blur-sm border border-blue-500/30">
                        <p className="text-xl font-bold text-white">{(stats.distance / 1000).toFixed(1)}</p>
                        <p className="text-[10px] text-blue-100 uppercase tracking-wide font-medium">km Run</p>
                    </div>
                    <div className="bg-blue-700/30 p-3 rounded-2xl w-[30%] backdrop-blur-sm border border-blue-500/30">
                        <p className="text-xl font-bold text-white">{stats.calories.toFixed(0)}</p>
                        <p className="text-[10px] text-blue-100 uppercase tracking-wide font-medium">Kcal</p>
                    </div>
                </div>
            </div>

            {/* Membership Card (Overlay) */}
            <div className="px-6 -mt-16 relative z-10 space-y-4">
                {/* Membership Status */}
                {memberData && (
                    <div className={`rounded-2xl shadow-lg p-5 flex items-center justify-between text-white ${isMembershipActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
                        <div>
                            <p className="text-xs font-medium opacity-90 uppercase tracking-wider mb-1">Membership Status</p>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {isMembershipActive ? (
                                    <><CheckCircle size={20} /> Active</>
                                ) : (
                                    <><AlertCircle size={20} /> Payment Due</>
                                )}
                            </h3>
                            <p className="text-xs mt-2 opacity-80">
                                {isMembershipActive
                                    ? `Next billing: ${nextBillDate}`
                                    : 'Your subscription has expired.'
                                }
                            </p>
                        </div>
                        {!isMembershipActive && (
                            <Button
                                onClick={() => setShowPayModal(true)}
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/40 shadow-sm backdrop-blur-sm rounded-xl"
                            >
                                Pay Now
                            </Button>
                        )}
                        {isMembershipActive && (
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                    <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/mobile/workout" className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-blue-100 hover:bg-blue-100 group">
                            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                <Play fill="currentColor" size={20} className="ml-1" />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">Start Run</span>
                        </Link>

                        <Link href="/mobile/diet" className="bg-green-50 p-4 rounded-xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-green-100 hover:bg-green-100 group">
                            <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                                <Zap size={22} className="fill-current" />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">Diet Coach</span>
                        </Link>

                        <Link href="/mobile/ai-workout" className="bg-purple-50 p-4 rounded-xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-purple-100 hover:bg-purple-100 group">
                            <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                                <Activity size={22} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">AI Trainer</span>
                        </Link>

                        <Link href="/mobile/community" className="bg-orange-50 p-4 rounded-xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-orange-100 hover:bg-orange-100 group">
                            <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                                <Users size={22} />
                            </div>
                            <span className="font-semibold text-sm text-gray-700">Community</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowPayModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <CreditCard size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Confirm Subscription</h2>
                            <p className="text-gray-500 text-sm mt-1">Monthly Gym Membership</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600 text-sm">Plan</span>
                                <span className="font-semibold text-gray-900">Standard Monthly</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600 text-sm">Duration</span>
                                <span className="font-semibold text-gray-900">30 Days</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
                                <span className="text-gray-900 font-bold">Total</span>
                                <span className="text-blue-600 font-bold text-lg">₹2,999</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-lg shadow-lg shadow-blue-200"
                            onClick={handleProcessPayment}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Pay with Pay'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <Zap size={10} /> Powered by Stripe (Test Mode)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Importing Users icon separately to ensure it works
import { Users } from 'lucide-react';
