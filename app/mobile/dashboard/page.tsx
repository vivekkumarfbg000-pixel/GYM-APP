'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Calendar, Zap, MapPin, ChevronRight, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function MobileDashboard() {
    const [name, setName] = useState('');
    const [stats, setStats] = useState({ workouts: 0, distance: 0, calories: 0 });
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const memberId = localStorage.getItem('gymflow_member_id');
        const memberName = localStorage.getItem('gymflow_member_name');

        if (!memberId) {
            router.push('/mobile/login');
            return;
        }

        setName(memberName || 'Member');
        fetchHistory(memberId);
    }, [router]);

    const fetchHistory = async (memberId: string) => {
        try {
            const res = await fetch(`/api/member/workouts?memberId=${memberId}`);
            const data = await res.json();

            if (data.success && data.data) {
                setHistory(data.data);

                // Calculate totals
                const totalStats = data.data.reduce((acc: any, curr: any) => ({
                    workouts: acc.workouts + 1,
                    distance: acc.distance + (curr.distance_meters || 0),
                    calories: acc.calories + (curr.calories_burned || 0)
                }), { workouts: 0, distance: 0, calories: 0 });

                setStats(totalStats);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-xl shadow-blue-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Welcome back,</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
                    </div>
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                        {name.charAt(0)}
                    </div>
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

            {/* Quick Actions Card */}
            <div className="px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 mb-8">
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

                        <Link href="/mobile/ai-workout" className="col-span-2 bg-purple-50 p-4 rounded-xl flex flex-row items-center justify-center gap-4 active:scale-95 transition-transform border border-purple-100 hover:bg-purple-100 group">
                            <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                                <TrendingUp size={22} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-gray-800">Generate Workout</span>
                                <span className="text-xs text-purple-600 font-medium">AI Personalized Plan</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Today's Recommendation - Hardcoded for visual polish */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-gray-800 text-lg">Today's Goal</h2>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-200 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-4"></div>

                        <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="font-bold text-white">Full Body HIIT</h3>
                            <p className="text-xs text-orange-100 font-medium mt-1">30 mins • High Intensity</p>
                        </div>
                        <button className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 active:scale-95 transition-transform">
                            View
                        </button>
                    </div>
                </div>

                {/* Recent Activity History */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-800 text-lg">Recent History</h2>
                        <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-full cursor-pointer">View All</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((workout: any) => (
                                <div key={workout.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 border border-gray-100">
                                        <MapPin size={20} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{workout.workout_type || 'Run'}</p>
                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                            <Calendar size={10} />
                                            {format(new Date(workout.start_time), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{(workout.distance_meters / 1000).toFixed(2)} km</p>
                                        <p className="text-xs text-gray-400 font-medium">{Math.round(workout.calories_burned)} kcal</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Activity className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-400 text-sm">No workouts yet</p>
                            <Link href="/mobile/workout" className="text-blue-600 text-xs font-bold mt-2 inline-block">Start your first run</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
