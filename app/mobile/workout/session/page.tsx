'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Clock, CheckCircle, Circle,
    Play, Pause, Flame, Dumbbell, Save, X,
    MapPin, Zap, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { db, DbAiWorkout, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSessionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<DbAiWorkout | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

    // Tracking state
    const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

    // Smart Metrics
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0); // Meters
    const [speed, setSpeed] = useState(0); // m/s
    const [gpsActive, setGpsActive] = useState(false);

    // AI Advice
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [loadingAdvice, setLoadingAdvice] = useState(false);

    // Rest Timer
    const [restSeconds, setRestSeconds] = useState(0);
    const [isResting, setIsResting] = useState(false);

    // Completion
    const [isFinishing, setIsFinishing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Freestyle / Add Exercise
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');

    const beepRef = useRef<HTMLAudioElement | null>(null);
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        beepRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        loadWorkout();
        startGpsTracking();

        return () => stopGpsTracking();
    }, []);

    const loadWorkout = async () => {
        const memberId = localStorage.getItem('gymflow_member_id');
        if (!memberId) {
            router.push('/mobile/login');
            return;
        }

        try {
            const data = await db.workouts.getByMember(memberId);
            // If no workout, create a "Freestyle" one
            if (!data) {
                const freestyle: any = {
                    id: 'freestyle-' + Date.now(),
                    goal: 'Freestyle',
                    duration: 60,
                    plan_data: [],
                    status: 'in_progress'
                };
                setWorkout(freestyle);
            } else {
                setWorkout(data);
                if (data.status === 'pending') {
                    await supabase.from('ai_workouts').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', data.id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startGpsTracking = () => {
        if (!navigator.geolocation) return;

        setGpsActive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { speed: gpsSpeed } = position.coords;
                // Speed is m/s. If null (stationary), 0.
                const currentSpeed = gpsSpeed || 0;
                setSpeed(currentSpeed);

                // Simple distance accum (approx updates every sec)
                if (currentSpeed > 0.5 && !isPaused) {
                    setDistance(prev => prev + currentSpeed);
                }
            },
            (err) => console.warn("GPS Error", err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const stopGpsTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
    };

    // Main Timer & Calorie Math
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!loading && !showSummary && !isPaused) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);

                // Dynamic Calorie Calculation
                // Base MET for sitting: 1
                // Lifting: ~3-6 MET
                // Running: ~8-12 MET

                let currentMet = 1.5; // Standing

                if (isResting) {
                    currentMet = 1.2;
                } else if (speed > 2) {
                    // Running (>7km/h)
                    currentMet = 9.8;
                } else if (speed > 0.5) {
                    // Walking
                    currentMet = 3.5;
                } else {
                    // Assuming Lifting/Active if not resting and unknown speed
                    currentMet = 5.0;
                }

                // Cals/min = (MET * 3.5 * WeightKg) / 200
                // We assume 70kg avg for now (Refine with profile data later)
                const calsPerSec = (currentMet * 3.5 * 75) / 200 / 60;
                setCalories(prev => prev + calsPerSec);

            }, 1000);
        }
        return () => clearInterval(interval);
    }, [loading, showSummary, isPaused, isResting, speed]);

    // Rest Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isResting) {
            interval = setInterval(() => {
                setRestSeconds(prev => {
                    if (prev <= 1) {
                        setIsResting(false);
                        beepRef.current?.play().catch(() => { });
                        toast.success("Go time!");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isResting]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleSet = (exerciseIdx: number, setIdx: number, recommendedRest: number) => {
        const key = `${exerciseIdx}-${setIdx}`;
        const isComplete = !completedSets[key];
        setCompletedSets(prev => ({ ...prev, [key]: isComplete }));

        if (isComplete && !isResting) {
            setRestSeconds(recommendedRest || 60);
            setIsResting(true);
        }
    };

    const getAiAdvice = async () => {
        setLoadingAdvice(true);
        try {
            const res = await fetch('/api/ai/optimize-session', {
                method: 'POST',
                body: JSON.stringify({
                    duration: elapsedSeconds,
                    calories: Math.round(calories),
                    setsCompleted: Object.keys(completedSets).length,
                    distance: distance
                })
            });
            const data = await res.json();
            if (data.success) {
                setAiAdvice(data.advice);
                setTimeout(() => setAiAdvice(null), 8000); // Hide after 8s
            }
        } catch (e) {
            toast.error("Coach is offline");
        } finally {
            setLoadingAdvice(false);
        }
    };

    const handleFinish = async () => {
        if (!workout) return;
        setIsFinishing(true);
        try {
            if (String(workout.id).startsWith('freestyle')) {
                // Create a real entry for history
                await supabase.from('workouts_history').insert({
                    member_id: memberId,
                    name: 'Freestyle Session',
                    duration: elapsedSeconds,
                    calories: Math.round(calories),
                    distance: distance,
                    data: (workout as any).plan_data || [], // Use 'as any' if type def is strict
                    completed_at: new Date().toISOString()
                });
            } else {
                await supabase.from('ai_workouts')
                    .update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        plan_data: workout.plan_data // Save any modifications/additions
                    })
                    .eq('id', workout.id);
            }
            setShowSummary(true);
        } catch (error) {
            toast.error("Failed to save");
            setShowSummary(true); // Show anyway
        } finally {
            setIsFinishing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Smart Session...</div>;
    if (!workout) return null;

    if (showSummary) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
                <p className="text-gray-400 mb-8">You crushed your {workout.goal} goal.</p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Clock className="w-5 h-5 text-blue-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">{formatTime(elapsedSeconds)}</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Flame className="w-5 h-5 text-orange-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">{Math.round(calories)}</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <MapPin className="w-5 h-5 text-green-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">{(distance / 1000).toFixed(2)}km</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <Dumbbell className="w-5 h-5 text-purple-500 mb-2 mx-auto" />
                        <div className="text-2xl font-bold">{Object.keys(completedSets).length} Sets</div>
                    </div>
                </div>

                <button onClick={() => router.push('/mobile/dashboard')} className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-xl">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentExercise = workout.plan_data[activeExerciseIndex];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
            {/* Ambient Background based on Speed */}
            <div className={cn(
                "absolute inset-0 transition-opacity duration-1000 opacity-20 pointer-events-none",
                speed > 2 ? "bg-gradient-to-b from-orange-600 to-red-900" : "bg-gradient-to-b from-blue-900 to-black"
            )}></div>

            {/* AI Advice Overlay */}
            <AnimatePresence>
                {aiAdvice && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-20 left-4 right-4 bg-purple-600 text-white p-4 rounded-xl z-50 shadow-xl flex items-center gap-3"
                    >
                        <Brain className="shrink-0 animate-pulse" />
                        <p className="font-bold text-sm">{aiAdvice}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-gray-800 p-3 pt-4">
                <div className="flex justify-between items-center mb-4">
                    <div onClick={() => router.back()} className="p-1 text-gray-400"><ChevronLeft /></div>
                    <h1 className="font-bold text-lg">Smart Mode</h1>
                    <button onClick={() => setIsFinishing(true)} className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full">End</button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                        <span className="text-gray-500 block text-[10px]">TIME</span>
                        <span className="font-mono text-lg">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <div>
                        <span className="text-orange-500 block text-[10px]">CALS</span>
                        <span className="font-mono text-lg">{Math.round(calories)}</span>
                    </div>
                    <div>
                        <span className="text-green-500 block text-[10px]">DIST</span>
                        <span className="font-mono text-lg">{(distance / 1000).toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-blue-500 block text-[10px]">PACE</span>
                        <span className="font-mono text-lg">{speed.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* Main Scrollable Area */}
            <div className="pt-36 px-4 space-y-6">

                {/* AI Optimizer Button */}
                <button
                    onClick={getAiAdvice} disabled={loadingAdvice}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-purple-900/40 active:scale-95 transition-transform"
                >
                    {loadingAdvice ? <Brain className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    {loadingAdvice ? "Analyzing..." : "Ask Coach Intelligence"}
                </button>

                {/* Current Activity Card */}
                {currentExercise ? (
                    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                                <button disabled={activeExerciseIndex === 0} onClick={() => setActiveExerciseIndex(i => i - 1)} className="p-1 text-gray-400"><ChevronLeft size={20} /></button>
                                <div>
                                    <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Exercise {activeExerciseIndex + 1}</p>
                                    <h2 className="text-xl font-bold">{currentExercise.name}</h2>
                                </div>
                            </div>
                            <button disabled={activeExerciseIndex === workout.plan_data.length - 1} onClick={() => setActiveExerciseIndex(i => i + 1)} className="p-1 text-gray-400"><ChevronLeft size={20} className="rotate-180" /></button>
                        </div>

                        <div className="space-y-2">
                            {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                <div key={i} onClick={() => toggleSet(activeExerciseIndex, i, currentExercise.rest)}
                                    className={cn("p-3 rounded-xl border flex justify-between items-center", completedSets[`${activeExerciseIndex}-${i}`] ? "bg-green-500/10 border-green-500/40" : "bg-black/40 border-gray-800")}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", completedSets[`${activeExerciseIndex}-${i}`] ? "bg-green-500 text-black" : "bg-gray-700 text-gray-400")}>{i + 1}</div>
                                        <span className={cn(completedSets[`${activeExerciseIndex}-${i}`] ? "text-green-400" : "text-gray-300")}>{currentExercise.reps} reps</span>
                                    </div>
                                    {completedSets[`${activeExerciseIndex}-${i}`] ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Circle className="text-gray-600 w-5 h-5" />}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900/50 border border-dashed border-gray-700 p-8 rounded-2xl text-center">
                        <MapPin className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <h3 className="text-gray-300 font-bold">Free Run / Walk Mode</h3>
                        <p className="text-gray-500 text-sm mb-4">GPS tracking is active. Just keep moving!</p>
                        <button
                            onClick={() => setShowAddExercise(true)}
                            className="text-purple-400 font-bold text-sm bg-purple-500/10 px-4 py-2 rounded-xl"
                        >
                            + Add Gym Exercise
                        </button>
                    </div>
                )}

                {/* Floating Add Button (if not empty) */}
                {currentExercise && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowAddExercise(true)}
                            className="bg-gray-800 text-gray-300 font-bold text-xs px-4 py-2 rounded-full border border-gray-700"
                        >
                            + Add Another Exercise
                        </button>
                    </div>
                )}
            </div>

            {/* Rest Overlay */}
            <AnimatePresence>
                {isResting && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-6 rounded-t-3xl z-40 flex justify-between items-center shadow-2xl">
                        <div>
                            <p className="font-bold text-2xl">Resting</p>
                            <p className="text-blue-200 text-sm">Recover your breath...</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-4xl font-bold">{formatTime(restSeconds)}</span>
                            <button onClick={() => setIsResting(false)} className="bg-white/20 p-2 rounded-full"><X /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Exercise Modal */}
            <AnimatePresence>
                {showAddExercise && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-sm border border-gray-800">
                            <h3 className="font-bold text-lg mb-4">Add Exercise</h3>
                            <input
                                autoFocus
                                placeholder="e.g. Bench Press"
                                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-purple-500"
                                value={newExerciseName}
                                onChange={e => setNewExerciseName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddExercise(false)}
                                    className="flex-1 py-3 font-bold text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!newExerciseName.trim()) return;
                                        const newEx = {
                                            name: newExerciseName,
                                            sets: 3,
                                            reps: '10',
                                            rest: 60
                                        };
                                        const newData = [...(workout?.plan_data || []), newEx];
                                        setWorkout({ ...workout!, plan_data: newData });
                                        setActiveExerciseIndex(newData.length - 1);
                                        setShowAddExercise(false);
                                        setNewExerciseName('');
                                    }}
                                    className="flex-1 bg-purple-600 text-white rounded-xl font-bold"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
