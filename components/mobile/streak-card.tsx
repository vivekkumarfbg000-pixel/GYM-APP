'use client';

import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreakCardProps {
    streak: number;
    lastCheckIn?: string;
}

export function StreakCard({ streak, lastCheckIn }: StreakCardProps) {
    const today = new Date().toISOString().split('T')[0];
    const isCheckedInToday = lastCheckIn === today;

    return (
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-none text-white shadow-lg shadow-orange-200">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Flame className={`${isCheckedInToday ? 'animate-pulse' : ''} fill-white`} />
                        {streak} Day Streak
                    </h3>
                    <p className="text-xs text-orange-100 mt-1">
                        {isCheckedInToday
                            ? "You're on fire! 🔥"
                            : "Don't break the chain!"}
                    </p>
                </div>
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {streak}
                </div>
            </CardContent>
        </Card>
    );
}
