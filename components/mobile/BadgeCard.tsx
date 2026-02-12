'use client';

import { Lock } from 'lucide-react';
import Image from 'next/image';

interface BadgeCardProps {
    badge: {
        id: string;
        name: string;
        description: string;
        icon: string;
        xp_reward: number;
        category: string;
    };
    isUnlocked: boolean;
    unlockedDate?: string;
}

export function BadgeCard({ badge, isUnlocked, unlockedDate }: BadgeCardProps) {
    return (
        <div className={`relative group p-4 rounded-2xl border transition-all duration-300 ${isUnlocked
                ? 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200'
                : 'bg-gray-50 border-gray-100 opacity-70'
            }`}>
            <div className="flex flex-col items-center text-center gap-3">
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm relative overflow-hidden ${isUnlocked
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'
                        : 'bg-gray-100 border border-gray-200'
                    }`}>
                    {isUnlocked ? (
                        <span>{badge.icon}</span>
                    ) : (
                        <Lock size={20} className="text-gray-300" />
                    )}

                    {/* Shine effect for unlocked (simulated) */}
                    {isUnlocked && <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>}
                </div>

                <div>
                    <h3 className={`font-bold text-sm ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {badge.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2">
                        {badge.description}
                    </p>
                </div>

                {isUnlocked ? (
                    <div className="mt-1 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Unlocked
                    </div>
                ) : (
                    <div className="mt-1 bg-gray-100 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                        {badge.xp_reward} XP
                    </div>
                )}
            </div>
        </div>
    );
}
