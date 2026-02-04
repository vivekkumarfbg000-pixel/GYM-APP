'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Calendar, Zap, MapPin, ChevronRight, Activity, CreditCard, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
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
    const [paymentMode, setPaymentMode] = useState<'card' | 'upi'>('card');
    const [utr, setUtr] = useState('');

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
            const res = await fetch('/api/gamification/streak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            const data = await res.json();

            if (data.status) {
                const messages: Record<string, string> = {
                    'increased': `🔥 ${data.streak} Day Streak! ${data.message}`,
                    'maintained': `✨ ${data.message}`,
                    'reset': `💪 ${data.message}`
                };

                if (data.status === 'increased') {
                    toast.success(messages[data.status]);
                } else {
                    toast(messages[data.status]);
                }

                // Update local state for immediate feedback
                setStreakData({
                    streak: data.streak,
                    lastCheckIn: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Streak update failed', error);
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
                    streak: profileData.data.streak_current || 0,
                    lastCheckIn: profileData.data.last_activity_date || ''
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
                    paymentMethod: paymentMode === 'card' ? 'card' : 'upi_manual',
                    transactionId: paymentMode === 'upi' ? utr : undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                if (paymentMode === 'upi') {
                    toast.success('Payment submitted for verification!');
                } else {
                    toast.success('Payment Successful!');
                }
                setShowPayModal(false);
                setUtr('');
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
        <div className="bg-gray-50 min-h-screen pb-24 relative animate-in fade-in duration-500 font-sans">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-xl shadow-indigo-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1 tracking-wide">Good Morning,</p>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{name.split(' ')[0]}</h1>
                    </div>
                    <div className="h-11 w-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-inner">
                        <span className="font-bold text-lg">{name.charAt(0)}</span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300">
                    <StreakCard streak={streakData.streak} lastCheckIn={streakData.lastCheckIn} />
                </div>

                {/* Glass Stats Row */}
                <div className="flex justify-between text-center gap-3">
                    <StatBox value={stats.workouts} label="Workouts" />
                    <StatBox value={(stats.distance / 1000).toFixed(1)} label="Km Run" />
                    <StatBox value={stats.calories.toFixed(0)} label="Kcal Burn" />
                </div>
            </div>

            {/* Content Container (Overlapping Hero) */}
            <div className="px-5 -mt-16 relative z-10 space-y-6">

                {/* Membership Status Card */}
                {memberData && (
                    <div className={`rounded-2xl shadow-lg p-5 flex items-center justify-between text-white relative overflow-hidden ${isMembershipActive ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
                        {/* Background Deco */}
                        <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-1">Status</p>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {isMembershipActive ? (
                                    <><CheckCircle size={20} /> Active Member</>
                                ) : (
                                    <><AlertCircle size={20} /> Membership Expired</>
                                )}
                            </h3>
                            <p className="text-xs mt-2 opacity-90 font-medium">
                                {isMembershipActive
                                    ? `Renews: ${nextBillDate}`
                                    : 'Access restricted. Renew now.'
                                }
                            </p>
                        </div>

                        {!isMembershipActive && (
                            <Button
                                onClick={() => setShowPayModal(true)}
                                className="bg-white text-red-600 hover:bg-gray-100 border-none shadow-md rounded-xl font-bold relative z-10"
                                size="sm"
                            >
                                Renew
                            </Button>
                        )}
                        {isMembershipActive && (
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                                <CreditCard size={20} />
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-800 mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500 fill-current" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionLink
                            href="/mobile/workout"
                            icon={<Play className="ml-1 fill-current" size={24} />}
                            title="Start Run"
                            color="blue"
                        />
                        <QuickActionLink
                            href="/mobile/diet"
                            icon={<Zap size={24} className="fill-current" />}
                            title="Diet Coach"
                            color="green"
                        />
                        <QuickActionLink
                            href="/mobile/ai-workout"
                            icon={<Activity size={24} />}
                            title="AI Trainer"
                            color="purple"
                        />
                        <QuickActionLink
                            href="/mobile/community"
                            icon={<Users size={24} />}
                            title="Community"
                            color="orange"
                        />
                    </div>
                </div>

                {/* Promotional Banner (Example) */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Join the 'Summer Shred'</h4>
                        <p className="text-xs text-blue-600 font-medium">Win prizes worth ₹50,000!</p>
                    </div>
                    <ChevronRight className="ml-auto text-blue-400" size={20} />
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative animate-in slide-in-from-bottom-10">
                        <button
                            onClick={() => setShowPayModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3 border-4 border-blue-100">
                                <CreditCard size={28} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Upgrade Membership</h2>
                            <p className="text-gray-500 text-sm">Unlimited Access • All Features</p>
                        </div>

                        {/* Payment Method Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                            <button
                                onClick={() => setPaymentMode('card')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                Card
                            </button>
                            <button
                                onClick={() => setPaymentMode('upi')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMode === 'upi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                UPI QR
                            </button>
                        </div>

                        {paymentMode === 'card' ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-200">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-500 text-sm">Amount</span>
                                        <span className="font-bold text-gray-900">₹2,999</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Secure via Stripe</span>
                                        <span>Encrypted</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-200 active:scale-95 transition-all"
                                    onClick={handleProcessPayment}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Pay with Card'}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>

                                    <p className="text-xs font-medium text-indigo-100 mb-2 uppercase tracking-wide">Scan to Pay</p>
                                    <div className="bg-white p-2 rounded-xl w-40 h-40 mx-auto shadow-inner flex items-center justify-center">
                                        {/* Dynamic QR: Generates a UPI generic QR for demo. In prod, use specific VPA */}
                                        {/* Using a placeholder service for visual demo */}
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=gymflow@upi&pn=GymFlow&am=2999&cu=INR`}
                                            alt="UPI QR"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-xl mt-3">₹2,999</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase mb-1 block">Transaction ID (UTR)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 12-digit UTR sent by bank"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                        *Payment will be active after admin verification (approx 10m).
                                    </p>
                                </div>

                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                                    onClick={handleProcessPayment}
                                    disabled={processing || !utr}
                                >
                                    {processing ? 'Verifying...' : 'Submit Payment'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Components ---

function StatBox({ value, label }: { value: string | number, label: string }) {
    return (
        <div className="bg-white/10 p-3 rounded-2xl w-[32%] backdrop-blur-md border border-white/20 shadow-lg">
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold mt-1 opacity-80">{label}</p>
        </div>
    );
}

function QuickActionLink({ href, icon, title, color }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
    };

    return (
        <Link href={href} className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-all border ${colorStyles[color]} group`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md bg-white group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="font-bold text-sm text-gray-700">{title}</span>
        </Link>
    );
}
