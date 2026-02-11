'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Badge {
    id: string;
    badge_id: string;
    unlocked_at: string;
    badges: {
        name: string;
        description: string;
        icon: string;
        tier: string;
    };
}

export function BadgesShowcase({ memberId }: { memberId: string }) {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBadges();
        // Check for new badges on mount
        checkForNewBadges();
    }, [memberId]);

    const fetchBadges = async () => {
        try {
            const res = await fetch(`/api/badges?memberId=${memberId}`);
            const data = await res.json();
            if (data.success) {
                setBadges(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkForNewBadges = async () => {
        try {
            const gymOwnerId = localStorage.getItem('gymflow_gym_owner_id');
            const res = await fetch('/api/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, gymOwnerId })
            });
            const data = await res.json();

            if (data.success && data.data.newBadges.length > 0) {
                // Show toast for each new badge
                data.data.newBadges.forEach((badge: any) => {
                    toast.success(`🎉 New Badge Unlocked: ${badge.badges.icon} ${badge.badges.name}`, {
                        description: badge.badges.description,
                        duration: 5000
                    });
                });
                // Refresh badges list
                fetchBadges();
            }
        } catch (error) {
            console.error('Failed to check for new badges:', error);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return 'from-orange-400 to-amber-600';
            case 'silver': return 'from-gray-300 to-gray-500';
            case 'gold': return 'from-yellow-400 to-yellow-600';
            case 'platinum': return 'from-purple-400 to-indigo-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award size={20} />
                        Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award size={20} />
                    Achievements ({badges.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {badges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Lock size={40} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Complete workouts to unlock badges!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-4 rounded-xl bg-gradient-to-br ${getTierColor(badge.badges.tier)} shadow-lg group cursor-pointer hover:scale-105 transition-transform`}
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{badge.badges.icon}</div>
                                    <h4 className="font-bold text-white text-sm">{badge.badges.name}</h4>
                                    <p className="text-xs text-white/80 mt-1">{badge.badges.tier.toUpperCase()}</p>
                                </div>

                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {badge.badges.description}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
