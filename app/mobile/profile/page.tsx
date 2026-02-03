'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, Medal, LogOut, ChevronRight, MapPin, Phone, Mail, Award, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileDashboardSkeleton } from '@/components/shared/skeleton-loaders';

export default function MobileProfile() {
    const router = useRouter();
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const memberId = localStorage.getItem('gymflow_member_id');
        if (!memberId) {
            router.push('/mobile/login');
            return;
        }

        fetchProfile(memberId);
    }, [router]);

    const fetchProfile = async (memberId: string) => {
        try {
            const res = await fetch(`/api/member/profile?memberId=${memberId}`);
            const data = await res.json();
            if (data.success) {
                setMember(data.data);
            }
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('gymflow_member_id');
        localStorage.removeItem('gymflow_member_name');
        localStorage.removeItem('gymflow_member_email');
        router.push('/mobile/login');
    };

    if (loading) return <MobileDashboardSkeleton />;

    if (!member) return null;

    // Calculate level progress (mock)
    const levelProgress = (member.points % 1000) / 10; // 0-100%

    return (
        <div className="bg-gray-50 min-h-screen pb-24 relative">
            {/* Header / Cover */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 h-48 relative">
                <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Settings size={20} />
                    </Button>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
                    <div className="w-24 h-24 bg-white rounded-full p-1 mx-auto shadow-md -mt-16 mb-4">
                        <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                            {member.name?.charAt(0)}
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                    <p className="text-sm text-gray-500 mb-6">{member.email}</p>

                    {/* Level & Points */}
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="text-center border-r border-gray-100">
                            <div className="flex items-center justify-center gap-1 text-orange-500 font-bold text-xl mb-1">
                                <Award size={20} />
                                <span>Lvl {member.level || 1}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${levelProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{member.points || 0} XP</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-red-500 font-bold text-xl mb-1">
                                <Flame size={20} />
                                <span>{member.daily_streak || 0}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Day Streak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="px-6 mt-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Statistics</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                            <TrendingUp size={18} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{member.total_workouts || 12}</p>
                        <p className="text-xs text-gray-500">Total Workouts</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center text-purple-600 mb-2">
                            <Award size={18} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{member.achievements_unlocked || 3}</p>
                        <p className="text-xs text-gray-500">Achievements</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="px-6 mt-6 space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Account</h2>

                <Link href="/mobile/achievements" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-50 w-10 h-10 rounded-full flex items-center justify-center text-yellow-600">
                            <Medal size={20} />
                        </div>
                        <span className="font-medium text-gray-700">Achievements</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                </Link>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 block">Gym Location</span>
                            <span className="text-xs text-gray-400">GymFlow Downtown</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="destructive"
                    className="w-full justify-start h-auto py-4 px-4 rounded-xl mt-4 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
                    onClick={handleLogout}
                >
                    <div className="flex items-center gap-3">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </div>
                </Button>
            </div>

            <div className="h-12 text-center flex items-center justify-center text-xs text-gray-300 mt-6">
                v1.0.2 • GymFlow AI
            </div>
        </div>
    );
}
