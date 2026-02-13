'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Clock, Flame, ChevronLeft, RefreshCw, CheckCircle, Zap, Pause, Square, Brain, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { db, DbAiWorkout } from '@/lib/supabase';

// Helper to calculate calorie burn directly
const calculateCalories = (weightKg: number, durationMin: number, met: number) => {
    return Math.round((met * 3.5 * weightKg / 200) * durationMin);
};

export default function AIWorkoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<DbAiWorkout | null>(null);
    const [isWorkingOut, setIsWorkingOut] = useState(false);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);

    const [memberId, setMemberId] = useState<string | null>(null);

    // AI Configuration State
    const [config, setConfig] = useState({
        goal: 'Hypertrophy',
        duration: 45,
        focus: 'Full Body'
    });

    useEffect(() => {
        const storedId = localStorage.getItem('gymflow_member_id');
        if (!storedId) {
            router.push('/mobile/login');
            return;
        }
        setMemberId(storedId);
        fetchWorkout(storedId);
    }, []);

    const fetchWorkout = async (id: string) => {
        try {
            setLoading(true);
            const data = await db.workouts.getByMember(id);
            if (data) {
                setWorkout(data);
            }
        } catch (error) {
            console.error(error);
            // Don't toast error on initial load if just empty
        } finally {
            setLoading(false);
        }
    };

    const generateNewWorkout = async () => {
        if (!memberId) return;
        setLoading(true);

        try {
            const res = await fetch('/api/ai/generate-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId,
                    goal: config.goal,
                    duration: config.duration,
                    focus: config.focus
                })
            });

            const result = await res.json();

            if (result.success) {
                const newWorkout = result.data;
                // Ensure the AI returned data matches structure 
                setWorkout(newWorkout);
                toast.success('AI Plan Generated! Coach insight ready.');
            } else {
                toast.error("AI Error: " + result.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate workout.");
        } finally {
            setLoading(false);
        }
    };

    const startWorkout = () => {
        setIsWorkingOut(true);
        setCurrentExerciseIndex(0);
        // Ensure plan_data exists and has items
        if (workout?.plan_data && workout.plan_data.length > 0) {
            setTimeRemaining(parseDuration(workout.plan_data[0].reps));
        }
    };

    // Helper to extract seconds from string like "3 mins" or just return standard set time
    const parseDuration = (str: string) => {
        if (typeof str === 'number') return str;
        if (str.includes('min')) return parseInt(str) * 60;
        return 45; // Default set duration for lifting
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Syncing with AI Coach...</p>
            </div>
        </div>
    );

    // If no workout or pending
    if (!workout || workout.status === 'pending') {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 relative">
                    <Brain className="w-10 h-10 text-purple-500" />
                    {workout?.status === 'pending' && (
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            PENDING
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {workout ? "Plan Under Review" : "AI Personal Coach"}
                </h1>

                <p className="text-gray-400 mb-8 max-w-xs">
                    {workout
                        ? "Your trainer is reviewing the AI's proposal to ensure it's safe for you."
                        : "Generate a personalized workout plan based on your recovery, detailed biometrics, and past performance."}
                </p>

                {workout ? (
                    <div className="w-full max-w-sm bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Goal</span>
                            <span className="font-semibold text-purple-400">{workout.goal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Est. Duration</span>
                            <span className="font-semibold text-white">{workout.duration} min</span>
                        </div>
                    </div>
                ) : (
                ): (
                        <div className = "w-full max-w-sm space-y-6">
                        {/* Configuration Form */ }
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5">
                    {/* Goal Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Goal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Hypertrophy', 'Strength', 'Endurance'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setConfig({ ...config, goal: g })}
                                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${config.goal === g ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Focus Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Focus</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Full Body', 'Upper Body', 'Lower Body', 'Core'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setConfig({ ...config, focus: f })}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${config.focus === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
                            <span className="text-xs font-bold text-purple-400">{config.duration} min</span>
                        </div>
                        <input
                            type="range"
                            min="15"
                            max="90"
                            step="15"
                            value={config.duration}
                            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                            <span>Quick (15m)</span>
                            <span>Epic (90m)</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={generateNewWorkout}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                    Generate Custom Plan
                </button>
            </div>
        )
    }

    {
        workout && (
            <button
                onClick={() => setWorkout(null)} // Reset for demo purposes
                className="text-gray-500 text-xs mt-8 underline"
            >
                Cancel Request (Demo)
            </button>
        )
    }
            </div >
        );
}

// ... (Keep existing Workout View logic but map `workout.plan_data` instead of mocked `workout.exercises`)
// Converting the existing 'isWorkingOut' view to use the fetched data:

const currentExercise = workout.plan_data[currentExerciseIndex];

return (
    <div className="min-h-screen bg-black text-white pb-20">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800">
            <div className="flex items-center justify-between p-4">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ChevronLeft />
                </button>
                <h1 className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Today's Session
                </h1>
                <div className="w-6" />
            </div>
        </header>

        <main className="pt-20 px-4">
            {/* AI Insight Card */}
            {workout.ai_notes && (
                <div className="mb-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-purple-200 text-sm mb-1">Coach Insight</h3>
                            <p className="text-xs text-purple-300/80 leading-relaxed">
                                {workout.ai_notes}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">DURATION</span>
                    </div>
                    <p className="text-2xl font-bold">{workout.duration} min</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="text-xs font-medium">BURN</span>
                    </div>
                    <p className="text-2xl font-bold">~450 kcal</p>
                </div>
            </div>

            {/* Exercise List */}
            <h3 className="text-lg font-semibold mb-4">Routine ({workout.plan_data.length} Exercises)</h3>
            <div className="space-y-3">
                {workout.plan_data.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-gray-900 rounded-xl p-4 flex items-center gap-4 border border-gray-800">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">{ex.name}</h4>
                            <p className="text-sm text-gray-500">{ex.sets} sets × {ex.reps}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                                Rest: {ex.rest}s
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </main>

        {/* Start Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <button
                onClick={() => router.push('/mobile/workout/session')}
                className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Dumbbell className="w-5 h-5" />
                Start Gym Session
            </button>
        </div>

    </div>
);
}

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 7.2L20 9.6L14.4 12L12 17.2L9.6 12L4 9.6L9.6 7.2L12 2Z" fill="currentColor" />
    </svg>
);
