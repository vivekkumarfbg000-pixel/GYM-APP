'use client';

import { Trophy, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChallengeCardProps {
    challenge: any;
    onJoin: (id: string) => void;
}

export function ChallengeCard({ challenge, onJoin }: ChallengeCardProps) {
    const isJoined = challenge.joined;
    const progressPercent = challenge.total > 0 ? (challenge.progress / challenge.total) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 p-8 rounded-bl-[100px] opacity-10 transition-colors ${isJoined ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <div className="absolute top-4 right-4 text-gray-100 group-hover:scale-110 transition-transform duration-500">
                <Trophy size={80} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isJoined ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {isJoined ? 'Active' : 'New Challenge'}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl tracking-tight">{challenge.title}</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                            <Award size={12} /> Goal: {challenge.goal}
                        </p>
                    </div>
                </div>

                {isJoined ? (
                    <div className="mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-gray-900">{Math.round(progressPercent)}% Complete</span>
                            <span className="text-gray-500">{challenge.daysLeft} days left</span>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-400 text-right">
                            {challenge.progress} / {challenge.total} {challenge.unit || 'pts'}
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 text-orange-600 p-2 rounded-xl">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Reward</p>
                                <p className="text-sm font-bold text-gray-900">500 Points</p>
                            </div>
                        </div>
                        <Button
                            className="rounded-full bg-gray-900 hover:bg-black text-white px-6 shadow-lg shadow-gray-200 group-hover:shadow-xl transition-all"
                            onClick={() => onJoin(challenge.id)}
                        >
                            Join Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
