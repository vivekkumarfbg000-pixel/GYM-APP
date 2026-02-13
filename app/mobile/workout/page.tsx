'use client';

import Link from 'next/link';
import { Dumbbell, MapPin, Sparkles } from 'lucide-react';

export default function WorkoutHubPage() {
    return (
        <div className="min-h-screen bg-gray-50 relative p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-2">Let's Crush It 💪</h1>
                <p className="text-muted-foreground">Select your workout mode for today.</p>
            </div>

            {/* AI Generator Promo */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-xl shadow-purple-500/20 group cursor-pointer hover:shadow-purple-500/40 transition-all">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">AI COACH</span>
                        <Sparkles size={14} className="animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Generate Plan</h2>
                    <p className="text-purple-100 text-sm mb-4">Get a personalized workout now.</p>
                    <Link href="/mobile/ai-workout" className="bg-white text-purple-600 font-bold px-6 py-3 rounded-xl inline-block hover:bg-purple-50 transition-colors">
                        Ask AI Coach
                    </Link>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 right-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Smart Workout Modes */}
            <div className="grid grid-cols-1 gap-4">
                {/* Unified Smart Session */}
                <Link href="/mobile/workout/session" className="group">
                    <div className="bg-black text-white rounded-3xl p-6 border border-gray-800 shadow-xl relative overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded">GPS ON</span>
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">AI ON</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-1">Start Smart Session</h3>
                        <p className="text-gray-400 text-sm mb-6">One button for everything. We'll track your run, gym sets, and calories automatically.</p>

                        <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/10 py-3 px-4 rounded-xl justify-center group-hover:bg-white group-hover:text-black transition-colors">
                            START NOW <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] ml-1">➔</div>
                        </div>

                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
