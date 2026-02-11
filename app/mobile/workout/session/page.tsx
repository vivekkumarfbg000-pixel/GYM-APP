'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Clock, CheckCircle, Circle,
    Play, Pause, Flame, Dumbbell, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { db, DbAiWorkout, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function GymSessionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<DbAiWorkout | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

    // Tracking state: exerciseIndex -> setIndex -> boolean
    const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

    // Timer state
    const [startTime] = useState<Date>(new Date());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Rest Timer
    const [restSeconds, setRestSeconds] = useState(0);
    const [isResting, setIsResting] = useState(false);

    // Completion
    const [isFinishing, setIsFinishing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Audio refs for timer beeps
    const beepRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Init beep sound
        beepRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

        const loadWorkout = async () => {
            const memberId = localStorage.getItem('gymflow_member_id');
            if (!memberId) {
                router.push('/mobile/login');
                return;
            }

            try {
                // Fetch the pending or in-progress workout
                const data = await db.workouts.getByMember(memberId);

                if (!data) {
                    toast.error("No active workout found.");
                    router.push('/mobile/ai-workout');
                    return;
                }

                setWorkout(data);

                // If newly started, update status to in_progress
                if (data.status === 'pending') {
                    await supabase
                        .from('ai_workouts')
                        .update({ status: 'in_progress', started_at: new Date().toISOString() })
                        .eq('id', data.id);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load workout");
            } finally {
                setLoading(false);
            }
        };

        loadWorkout();
    }, []);

    // Workout Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!loading && !showSummary && !isPaused) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [loading, showSummary, isPaused]);

    // Rest Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isResting && restSeconds > 0) {
            interval = setInterval(() => {
                setRestSeconds(prev => {
                    if (prev <= 1) {
                        // Timer finished
                        setIsResting(false);
                        beepRef.current?.play().catch(() => { });
                        toast.success("Rest complete! Let's go!");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isResting, restSeconds]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleSet = (exerciseIdx: number, setIdx: number, recommendedRest: number) => {
        const key = `${exerciseIdx}-${setIdx}`;
        const isComplete = !completedSets[key];

        setCompletedSets(prev => ({
            ...prev,
            [key]: isComplete
        }));

        if (isComplete) {
            // Auto-start rest timer if not the last set of the last exercise
            // And if we're not currently resting
            if (!isResting) {
                setRestSeconds(recommendedRest || 60);
                setIsResting(true);
            }
        }
    };

    const handleFinish = async () => {
        if (!workout) return;

        const totalSets = workout.plan_data.reduce((acc: number, ex: any) => acc + ex.sets, 0);
        const completedCount = Object.keys(completedSets).filter(k => completedSets[k]).length;

        if (completedCount < totalSets / 2) {
            if (!confirm("You haven't finished half your sets. End workout anyway?")) return;
        }

        setIsFinishing(true);

        try {
            // Update DB
            await supabase
                .from('ai_workouts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', workout.id);

            setShowSummary(true);
        } catch (error) {
            toast.error("Failed to save workout");
        } finally {
            setIsFinishing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-pulse">Loading Session...</div>
        </div>
    );

    if (!workout) return null;

    if (showSummary) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">

                <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Workout Crushed!</h1>
                <p className="text-gray-400 mb-8">
                    Great job on your {workout.goal} session.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Clock className="w-5 h-5 text-blue-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">{formatTime(elapsedSeconds)}</div>
                        <div className="text-xs text-gray-500 uppercase">Duration</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Flame className="w-5 h-5 text-orange-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">
                            {Math.round(elapsedSeconds / 60 * 6)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">~Cal Burn</div>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/mobile/dashboard')}
                    className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-xl"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentExercise = workout.plan_data[activeExerciseIndex];

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-gray-800 p-4 flex items-center justify-between">
                <div onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
                    <ChevronLeft />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Time Elapsed</span>
                    <span className="font-mono font-bold text-lg">{formatTime(elapsedSeconds)}</span>
                </div>
                <button
                    onClick={() => setIsFinishing(true)} // Or pause modal
                    className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/20"
                >
                    END
                </button>
            </div>

            {/* Rest Timer Overlay */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-4 right-4 bg-blue-600 rounded-2xl p-4 shadow-lg z-30 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="animate-pulse" />
                            <div>
                                <p className="font-bold text-lg">Resting...</p>
                                <p className="text-blue-200 text-xs">Next: Set {Object.keys(completedSets).filter(k => k.startsWith(`${activeExerciseIndex}-`)).length + 1}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-3xl font-bold">{formatTime(restSeconds)}</span>
                            <button
                                onClick={() => setIsResting(false)}
                                className="bg-white/20 p-2 rounded-full hover:bg-white/30"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="pt-24 px-4 space-y-6">

                {/* Exercise Navigation / Title */}
                <div className="flex items-center justify-between">
                    <button
                        disabled={activeExerciseIndex === 0}
                        onClick={() => setActiveExerciseIndex(i => i - 1)}
                        className="p-2 text-gray-500 disabled:opacity-30"
                    >
                        <ChevronLeft />
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-blue-400 font-bold mb-1">
                            EXERCISE {activeExerciseIndex + 1} OF {workout.plan_data.length}
                        </p>
                        <h2 className="text-xl font-bold">{currentExercise.name}</h2>
                    </div>
                    <button
                        disabled={activeExerciseIndex === workout.plan_data.length - 1}
                        onClick={() => setActiveExerciseIndex(i => i + 1)}
                        className="p-2 text-gray-500 disabled:opacity-30"
                    >
                        <ChevronLeft className="rotate-180" />
                    </button>
                </div>

                {/* Sets List */}
                <div className="space-y-3">
                    {Array.from({ length: currentExercise.sets }).map((_, setIdx) => {
                        const isComplete = completedSets[`${activeExerciseIndex}-${setIdx}`];

                        return (
                            <div
                                key={setIdx}
                                onClick={() => toggleSet(activeExerciseIndex, setIdx, currentExercise.rest)}
                                className={cn(
                                    "p-4 rounded-xl border flex items-center justify-between transition-all active:scale-98 cursor-pointer",
                                    isComplete
                                        ? "bg-green-500/10 border-green-500/30"
                                        : "bg-gray-900 border-gray-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                        isComplete ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400"
                                    )}>
                                        {setIdx + 1}
                                    </div>
                                    <div>
                                        <p className={cn("font-bold text-lg", isComplete ? "text-green-500" : "text-white")}>
                                            {currentExercise.reps} <span className="text-sm font-normal text-gray-500">reps</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Prepare for {currentExercise.rest}s rest
                                        </p>
                                    </div>
                                </div>

                                {isComplete ? (
                                    <CheckCircle className="text-green-500 w-6 h-6" />
                                ) : (
                                    <Circle className="text-gray-700 w-6 h-6" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Notes */}
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 mt-8">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" /> Coach's Tip
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Focus on form over weight. Maintain controlled eccentric (lowering) movements for maximum hypertrophy.
                    </p>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gray-800 p-4 backdrop-blur-lg">
                <button
                    onClick={handleFinish}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg shadow-white/10 active:scale-95 transition-all"
                >
                    Finish Workout
                </button>
            </div>

            {/* End Confirmation Modal (Simple browser confirm used for MVP) */}
        </div>
    );
}
