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

            {/* Workout Modes */}
            <div className="grid grid-cols-1 gap-4">
                {/* Gym Session */}
                <Link href="/mobile/workout/gym" className="group">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                <Dumbbell size={28} />
                            </div>
                            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-colors">
                                ➔
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Gym Session</h3>
                        <p className="text-sm text-gray-500">Log strength training, sets, reps & weights.</p>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mb-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </Link>

                {/* Outdoor Run */}
                <Link href="/mobile/workout/run" className="group">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-green-50 text-green-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                <MapPin size={28} />
                            </div>
                            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-green-600 group-hover:text-white group-hover:border-transparent transition-colors">
                                ➔
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Outdoor Run</h3>
                        <p className="text-sm text-gray-500">Track GPS route, distance, and pace.</p>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-8 -mb-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
