'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Trophy } from 'lucide-react';

interface LeaderboardRowProps {
    user: any;
    rank: number;
}

export function LeaderboardRow({ user, rank }: LeaderboardRowProps) {
    const isTop3 = rank <= 3;

    return (
        <div className={`group flex items-center p-4 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200 shadow-orange-100 shadow-md' :
                rank === 2 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                    rank === 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100' :
                        'bg-white border-gray-100 hover:shadow-md'
            }`}>
            <div className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded-full mr-4 shrink-0 transition-transform group-hover:scale-110 ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' :
                    rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
                        rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md' :
                            'text-gray-400 bg-gray-50'
                }`}>
                {rank}
            </div>

            <Avatar className={`h-12 w-12 mr-4 border-2 shadow-sm ${rank === 1 ? 'border-yellow-200' : 'border-white'
                }`}>
                <AvatarFallback className={`${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    } font-bold`}>
                    {user.avatar || user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 truncate text-base">
                    {user.name}
                    {user.streak > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                            <Flame size={10} className="fill-current" />
                            {user.streak}
                        </span>
                    )}
                </h3>
                <p className="text-xs text-gray-500 font-medium">{user.points.toLocaleString()} Points</p>
            </div>

            {rank === 1 && (
                <div className="bg-yellow-100 p-2 rounded-full">
                    <Trophy className="text-yellow-600 fill-yellow-600" size={20} />
                </div>
            )}
        </div>
    );
}
