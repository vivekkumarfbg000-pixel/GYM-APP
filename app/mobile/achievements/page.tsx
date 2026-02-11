'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Lock, Star, Zap, Flame, Trophy, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileDashboardSkeleton } from '@/components/shared/skeleton-loaders';
import Link from 'next/link';

// Achievement Definitions
const ACHIEVEMENTS = [
    { id: 'first_step', title: 'First Step', description: 'Complete your first workout', icon: Star, condition: (stats: any) => stats.workouts >= 1 },
    { id: 'on_fire', title: 'On Fire', description: 'Reach a 3-day streak', icon: Flame, condition: (stats: any) => stats.streak >= 3 },
    { id: 'dedicated', title: 'Dedicated', description: 'Complete 10 workouts', icon: Target, condition: (stats: any) => stats.workouts >= 10 },
    { id: 'runner', title: 'Runner', description: 'Run total of 10km', icon: Zap, condition: (stats: any) => stats.distance >= 10000 },
    { id: 'marathoner', title: 'Marathoner', description: 'Run total of 42km', icon: Trophy, condition: (stats: any) => stats.distance >= 42000 },
    { id: 'week_warrior', title: 'Week Warrior', description: 'Check in 5 times', icon: Calendar, condition: (stats: any) => stats.checkins >= 5 },
    { id: 'gym_rat', title: 'Gym Rat', description: 'Reach Level 5', icon: Award, condition: (stats: any) => stats.level >= 5 },
    { id: 'master', title: 'Master', description: 'Complete 100 workouts', icon: Award, condition: (stats: any) => stats.workouts >= 100 },
];

export default function AchievementsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        workouts: 0,
        distance: 0,
        calories: 0,
        streak: 0,
        checkins: 0,
        level: 1
    });

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
            // Fetch Profile (Streak, Level)
            const profileRes = await fetch(`/api/member/profile?memberId=${memberId}`);
            const profileData = await profileRes.json();

            // Fetch Workouts (Count, Distance)
            const workoutsRes = await fetch(`/api/member/workouts?memberId=${memberId}`);
            const workoutsData = await workoutsRes.json();

            // FETCH REAL BADGES
            const badgesRes = await fetch(`/api/gamification/achievements?memberId=${memberId}`);
            const badgesData = await badgesRes.json();
            const unlockedIds = new Set(badgesData.success ? badgesData.data.map((b: any) => b.badge_id) : []);

            if (profileData.success && workoutsData.success) {
                const p = profileData.data;
                const totalWorkouts = workoutsData.data.length;
                const totalDistance = workoutsData.data.reduce((acc: number, cur: any) => acc + (cur.distance || cur.distance_meters || 0), 0);

                // Calculate Stats
                const currentStats = {
                    workouts: totalWorkouts,
                    distance: totalDistance,
                    calories: 0,
                    streak: p.daily_streak || 0,
                    checkins: (p.points / 10) || 0,
                    level: p.level || 1
                };

                setStats(currentStats);

                // Sync Unlocks: If condition met but not in DB, unlock it!
                ACHIEVEMENTS.forEach(async (achievement) => {
                    if (achievement.condition(currentStats) && !unlockedIds.has(achievement.id)) {
                        // Trigger Unlock API
                        await fetch('/api/gamification/achievements', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ memberId, badgeId: achievement.id })
                        });
                        unlockedIds.add(achievement.id); // Optimistic update
                    }
                });
            }
        } catch (error) {
            console.error('Error loading achievement data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <MobileDashboardSkeleton />;

    const unlockedCount = ACHIEVEMENTS.filter(a => a.condition(stats)).length;
    const progressPercentage = (unlockedCount / ACHIEVEMENTS.length) * 100;

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

            {/* Progress Hero */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center text-white mb-6">
                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40 mb-4">
                    <Trophy size={40} className="text-white drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-bold mb-1">{unlockedCount} / {ACHIEVEMENTS.length}</h2>
                <p className="text-yellow-100 font-medium mb-4">Badges Unlocked</p>

                <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {/* Grid */}
            <div className="px-4 grid grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = achievement.condition(stats);
                    const Icon = achievement.icon;

                    return (
                        <div
                            key={achievement.id}
                            className={`relative rounded-2xl p-5 border shadow-sm transition-all ${isUnlocked
                                ? 'bg-white border-yellow-100 shadow-yellow-100/50'
                                : 'bg-gray-100 border-gray-200 opacity-60 grayscale'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-600' : 'bg-gray-200 text-gray-400'
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
