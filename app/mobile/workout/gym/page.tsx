'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Check, Clock, ChevronRight, X, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

// Mock Exercise DB (In a real app, this would be in Supabase)
const EXERCISE_DB = [
    { id: 'bench_press', name: 'Bench Press', muscle: 'Chest' },
    { id: 'squat', name: 'Squat', muscle: 'Legs' },
    { id: 'deadlift', name: 'Deadlift', muscle: 'Back' },
    { id: 'shoulder_press', name: 'Overhead Press', muscle: 'Shoulders' },
    { id: 'pull_up', name: 'Pull Up', muscle: 'Back' },
    { id: 'dumbbell_curl', name: 'Dumbbell Curl', muscle: 'Biceps' },
    { id: 'tricep_extension', name: 'Tricep Extension', muscle: 'Triceps' },
    { id: 'leg_press', name: 'Leg Press', muscle: 'Legs' },
];

export default function GymWorkoutPage() {
    const router = useRouter();
    const [workoutTitle, setWorkoutTitle] = useState('Evening Workout');
    const [exercises, setExercises] = useState<any[]>([]);
    const [showExerciseSearch, setShowExerciseSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [startTime] = useState(new Date().toISOString());

    const [restTimer, setRestTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isTimerRunning && restTimer > 0) {
            timerRef.current = setInterval(() => {
                setRestTimer((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                        toast.success("Rest complete!");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (restTimer === 0) {
            setIsTimerRunning(false);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning, restTimer]);

    const startRestTimer = (seconds: number = 60) => {
        setRestTimer(seconds);
        setIsTimerRunning(true);
        toast.info(`Resting for ${seconds}s`);
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddExercise = (exercise: any) => {
        setExercises([...exercises, { ...exercise, sets: [{ weight: '', reps: '', completed: false }] }]);
        setShowExerciseSearch(false);
        setSearchQuery('');
    };

    const addSet = (exerciseIndex: number) => {
        const newExercises = [...exercises];
        const previousSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
        newExercises[exerciseIndex].sets.push({
            weight: previousSet ? previousSet.weight : '',
            reps: previousSet ? previousSet.reps : '',
            completed: false
        });
        setExercises(newExercises);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: string) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex][field] = value;
        setExercises(newExercises);
    };

    const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed;
        setExercises(newExercises);

        // Simple vibration feedback
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const finishWorkout = async () => {
        if (exercises.length === 0) {
            toast.error('Add some exercises first!');
            return;
        }

        const toastId = toast.loading('Saving workout...');
        try {
            const memberId = localStorage.getItem('gymflow_member_id');
            if (!memberId) throw new Error("Not logged in");

            const payload = {
                memberId,
                workoutType: 'Gym',
                title: workoutTitle,
                startTime,
                endTime: new Date().toISOString(),
                exercises: exercises,
                calories: exercises.length * 50 // Rough estimate
            };

            const res = await fetch('/api/member/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Workout Logged! 💪', { id: toastId });
                router.push('/mobile/dashboard');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error('Failed to save workout', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Top Bar */}
            <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-800">
                        <X size={24} />
                    </button>
                    <input
                        value={workoutTitle}
                        onChange={(e) => setWorkoutTitle(e.target.value)}
                        className="font-bold text-lg bg-transparent focus:outline-none focus:border-b-2 border-blue-500 w-48"
                    />
                </div>
                <button
                    onClick={finishWorkout}
                    className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-700"
                >
                    Finish
                </button>
            </div>

            {/* Workout Content */}
            <div className="flex-1 p-4 space-y-4 pb-24 overflow-y-auto">
                {exercises.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Dumbbell size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-bold text-gray-400">No exercises added</p>
                        <p className="text-sm">Tap 'Add Exercise' to start lifting</p>
                    </div>
                )}

                {exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-blue-900">{ex.name}</h3>
                            <button className="text-gray-400 hover:text-red-500">
                                <X size={16} onClick={() => {
                                    const newEx = [...exercises];
                                    newEx.splice(exIdx, 1);
                                    setExercises(newEx);
                                }} />
                            </button>
                        </div>

                        {/* Sets Header */}
                        <div className="grid grid-cols-10 gap-2 mb-2 text-[10px] uppercase font-bold text-gray-400 text-center">
                            <div className="col-span-2">Set</div>
                            <div className="col-span-3">kg</div>
                            <div className="col-span-3">Reps</div>
                            <div className="col-span-2">Done</div>
                        </div>

                        {/* Sets Rows */}
                        <div className="space-y-2">
                            {ex.sets.map((set: any, setIdx: number) => (
                                <div key={setIdx} className={`grid grid-cols-10 gap-2 items-center text-center transition-colors ${set.completed ? 'opacity-50' : ''}`}>
                                    <div className="col-span-2 text-xs font-bold text-gray-300 bg-gray-50 rounded py-2">{setIdx + 1}</div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-gray-50 rounded-lg text-center py-2 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-gray-50 rounded-lg text-center py-2 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => toggleSetComplete(exIdx, setIdx)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            <Check size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => addSet(exIdx)}
                            className="w-full mt-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-wide"
                        >
                            + Add Set
                        </button>
                    </div>
                ))}

                <button
                    onClick={() => setShowExerciseSearch(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add Exercise
                </button>
            </div>

            {/* Exercise Search PDF Modal/Sheet */}
            {showExerciseSearch && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end animate-in fade-in">
                    <div className="bg-white rounded-t-3xl h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <Search className="text-gray-400" size={20} />
                            <input
                                autoFocus
                                placeholder="Search exercises..."
                                className="flex-1 text-lg outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => setShowExerciseSearch(false)} className="text-sm font-bold text-blue-600">Cancel</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {EXERCISE_DB.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleAddExercise(ex)}
                                    className="w-full text-left p-4 hover:bg-gray-50 rounded-xl flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{ex.name}</p>
                                        <p className="text-xs text-gray-400 uppercase">{ex.muscle}</p>
                                    </div>
                                    <Plus size={20} className="text-gray-300 group-hover:text-blue-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
