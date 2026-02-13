'use client';

import { ArrowRight, Dumbbell, Sparkles, CheckCircle, Clock, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TodaysMissionCardProps {
    workout: any | null;
    loading: boolean;
    onGenerate: () => void;
    onStart: () => void;
}

export function TodaysMissionCard({ workout, loading, onGenerate, onStart }: TodaysMissionCardProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="w-full h-48 bg-white/10 rounded-3xl animate-pulse backdrop-blur-md border border-white/20"></div>
        );
    }

    // STATE 1: No Workout Assigned -> "Generate Plan"
    if (!workout || workout.status === 'completed') {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 shadow-xl shadow-indigo-500/30 border border-white/10 group cursor-pointer transition-all hover:scale-[1.02]" onClick={onGenerate}>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
                        </div>
                        <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            Daily Mission
                        </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-1">Build Your Legacy</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-[80%]">
                        Your AI Coach is ready to build today's perfect routine.
                    </p>

                    <Button
                        onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                        className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl w-full flex justify-between group-hover:shadow-lg transition-all"
                    >
                        <span>Generate Workout</span>
                        <ArrowRight size={18} />
                    </Button>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl -ml-10 -mb-10"></div>
            </div>
        );
    }

    // STATE 2: Workout Ready -> "Start Mission"
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-xl shadow-teal-500/30 border border-white/10 group cursor-pointer transition-all hover:scale-[1.02]" onClick={onStart}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-black/20 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                            <Clock size={12} /> {workout.duration}m
                        </span>
                        <span className="bg-black/20 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                            <Flame size={12} /> {workout.calories || 450}
                        </span>
                    </div>
                </div>

                <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Today's Objective</p>
                <h3 className="text-2xl font-bold mb-6 line-clamp-1">{workout.goal || "Full Body Power"}</h3>

                <div className="bg-black/20 rounded-xl p-3 mb-6 backdrop-blur-sm border border-white/5">
                    <p className="text-xs text-teal-50 line-clamp-2 italic">
                        "{workout.ai_notes || "Focus on form and controlled eccentric movements today."}"
                    </p>
                </div>

                <Button
                    onClick={(e) => { e.stopPropagation(); onStart(); }}
                    className="bg-white text-teal-800 hover:bg-teal-50 font-bold rounded-xl w-full flex justify-between shadow-lg transition-all"
                >
                    <span>Start Session</span>
                    <ArrowRight size={18} />
                </Button>
            </div>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
        </div>
    );
}
