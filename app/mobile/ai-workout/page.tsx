'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Clock, Flame, ChevronLeft, RefreshCw, CheckCircle, Zap, Pause, Square } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWorkoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [workout, setWorkout] = useState<any>(null);
    const [isWorkingOut, setIsWorkingOut] = useState(false);
    const [duration, setDuration] = useState(0);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isWorkingOut) {
            interval = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isWorkingOut]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const generateWorkout = async () => {
        setLoading(true);

        try {
            const memberId = localStorage.getItem('gymflow_member_id');
            const res = await fetch('/api/member/ai-workout/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: memberId || 'demo',
                    goal: 'strength'
                })
            });

            const data = await res.json();

            if (data.success) {
                setWorkout(data.workout);
                toast.success('Workout Plan Ready!');
                setIsWorkingOut(true); // Auto-start for flow
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Workout generation failed:', error);
            // Fallback for demo
            setWorkout({
                title: 'Full Body Power',
                focus: 'Strength & Conditioning',
                duration: 45,
                calories: 350,
                exercises: [
                    { name: 'Squats', sets: 4, reps: 12, rest: '60s' },
                    { name: 'Pushups', sets: 3, reps: 15, rest: '45s' },
                    { name: 'Dumbbell Rows', sets: 3, reps: 12, rest: '45s' },
                    { name: 'Plank', sets: 3, reps: '45s', rest: '30s' },
                ]
            });
            setIsWorkingOut(true);
        } finally {
            setLoading(false);
        }
    };

    const finishWorkout = () => {
        setIsWorkingOut(false);
        setDuration(0);
        setWorkout(null);
        toast.success('Workout Complete! Great job. 🔥');
        setTimeout(() => router.push('/mobile/dashboard'), 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800">AI Coach</h1>
                        <p className="text-xs text-purple-600 font-medium">
                            {isWorkingOut ? 'Session in Progress' : 'Personalized Plan'}
                        </p>
                    </div>
                </div>
                {isWorkingOut && (
                    <div className="font-mono font-bold text-purple-600 text-lg bg-purple-50 px-3 py-1 rounded-lg">
                        {formatTime(duration)}
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto pb-32">
                {!workout ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 mt-12">
                        <div className="h-32 w-32 bg-purple-50 rounded-full flex items-center justify-center relative">
                            <Zap size={64} className="text-purple-600" />
                            <div className="absolute inset-0 border-4 border-purple-100 rounded-full animate-ping opacity-20"></div>
                        </div>

                        <div className="space-y-2 max-w-xs">
                            <h2 className="text-2xl font-bold text-gray-900">Ready to train?</h2>
                            <p className="text-gray-500">I'll build a custom strength routine just for you.</p>
                        </div>

                        <button
                            onClick={generateWorkout}
                            disabled={loading}
                            className="w-full max-w-xs bg-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon /> Start Session
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* Session Header Card */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <h2 className="text-2xl font-bold mb-1">{workout.title}</h2>
                            <p className="text-purple-100 text-sm mb-6">{workout.focus}</p>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-purple-200" />
                                    <span className="font-semibold">{workout.duration} min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flame size={18} className="text-purple-200" />
                                    <span className="font-semibold">{workout.calories} kcal</span>
                                </div>
                            </div>
                        </div>

                        {/* Exercise List */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 ml-1">Today's Routine</h3>

                            {workout.exercises.map((ex: any, i: number) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                                    <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center font-bold text-purple-600">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{ex.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {ex.sets} sets × <span className="text-purple-600 font-medium">{ex.reps}</span>
                                        </p>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                        Rest: {ex.rest}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Action Bar */}
            {isWorkingOut && (
                <div className="fixed bottom-0 left-0 w-full bg-white p-6 pb-8 border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                    <button
                        onClick={finishWorkout}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg"
                    >
                        <CheckCircle size={20} /> Finish Workout
                    </button>
                </div>
            )}
        </div>
    );
}

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 7.2L20 9.6L14.4 12L12 17.2L9.6 12L4 9.6L9.6 7.2L12 2Z" fill="currentColor" />
    </svg>
);
