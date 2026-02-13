'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Lock, Star, Zap, Flame, Trophy, Target, Calendar, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Achievement Definitions
const ACHIEVEMENTS = [
    { id: 'first_step', title: 'First Step', description: 'Complete your first workout', icon: Star, condition: (stats: any) => stats.workouts >= 1 },
    { id: 'momentum', title: 'Momentum', description: 'Complete 5 workouts', icon: Zap, condition: (stats: any) => stats.workouts >= 5 },
    { id: 'dedicated', title: 'Dedicated', description: 'Complete 20 workouts', icon: Dumbbell, condition: (stats: any) => stats.workouts >= 20 },
    { id: 'marathoner', title: 'Marathoner', description: 'Run 10km total', icon: Award, condition: (stats: any) => stats.distance >= 10000 },
    { id: 'on_fire', title: 'On Fire', description: '3 day streak', icon: Flame, condition: (stats: any) => stats.streak >= 3 },
    { id: 'champion', title: 'Champion', description: 'Reach Level 5', icon: Trophy, condition: (stats: any) => stats.level >= 5 },
];

export default function AchievementsPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        workouts: 0,
        distance: 0,
        streak: 0,
        level: 1
    });
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const memberId = localStorage.getItem('gymflow_member_id');
        if (!memberId) {
            router.push('/mobile/login');
            return;
        }
        loadData(memberId);
    }, [router]);

    const loadData = async (memberId: string) => {
        try {
            // 1. Fetch Profile for Streak/Level
            const profileRes = await fetch(`/api/member/profile?memberId=${memberId}`);
            const profileData = await profileRes.json();

            // 2. Fetch Workouts for Count/Distance
            const workoutsRes = await fetch(`/api/member/workouts?memberId=${memberId}`);
            const workoutsData = await workoutsRes.json();

            // 3. Fetch Already Unlocked Badges
            const badgesRes = await fetch(`/api/gamification/achievements?memberId=${memberId}`);
            const badgesData = await badgesRes.json();

            const currentUnlocked = new Set<string>(badgesData.success ? badgesData.data.map((b: any) => b.badge_id) : []);
            setUnlockedIds(currentUnlocked);

            if (profileData.success && workoutsData.success) {
                const p = profileData.data;
                const totalWorkouts = workoutsData.data.length;
                const totalDistance = workoutsData.data.reduce((acc: number, cur: any) => acc + (cur.distance || 0), 0);

                const currentStats = {
                    workouts: totalWorkouts,
                    distance: totalDistance,
                    streak: p.daily_streak || 0,
                    level: p.level || 1
                };
                setStats(currentStats);

                // 4. Check & Unlock New Badges
                ACHIEVEMENTS.forEach(async (achievement) => {
                    if (achievement.condition(currentStats) && !currentUnlocked.has(achievement.id)) {
                        // Optimistic Unlock
                        setUnlockedIds(prev => new Set(prev).add(achievement.id));

                        // API Call
                        await fetch('/api/gamification/achievements', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ memberId, badgeId: achievement.id })
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
    }

    const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
    const progressPercentage = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
                <Link href="/mobile/profile">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Achievements</h1>
            </div>

            {/* Hero Progress */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center text-white mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40 mb-4 shadow-lg">
                        <Trophy size={40} className="text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-1">{unlockedCount} <span className="text-2xl opacity-80">/ {ACHIEVEMENTS.length}</span></h2>
                    <p className="text-yellow-100 font-medium mb-4 uppercase tracking-widest text-xs">Badges Unlocked</p>

                    <div className="w-full max-w-xs mx-auto bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
            </div>

            {/* Grid */}
            <div className="px-4 grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const Icon = achievement.icon;

                    return (
                        <div
                            key={achievement.id}
                            className={`relative rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isUnlocked
                                ? 'bg-white border-yellow-100 shadow-yellow-500/10 scale-100'
                                : 'bg-gray-100 border-gray-200 opacity-60 grayscale scale-95'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm ${isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-600' : 'bg-gray-200 text-gray-400'
                                }`}>
                                {isUnlocked ? <Icon size={24} /> : <Lock size={20} />}
                            </div>

                            <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                {achievement.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-tight">
                                {achievement.description}
                            </p>

                            {isUnlocked && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
