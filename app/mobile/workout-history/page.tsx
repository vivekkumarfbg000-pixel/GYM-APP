'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Calendar,
    Clock,
    Target,
    CheckCircle,
    Star,
    TrendingUp,
    Dumbbell,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Workout = {
    id: string;
    goal: string;
    duration: number;
    risk_level: string;
    status: string;
    ai_notes: string;
    plan_data: any[];
    created_at: string;
    completed_at?: string;
    rating?: number;
    completion_notes?: string;
};

export default function WorkoutHistoryPage() {
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    const memberId = typeof window !== 'undefined'
        ? localStorage.getItem('gymflow_member_id')
        : null;

    useEffect(() => {
        if (memberId) {
            fetchHistory();
        }
    }, [memberId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/member/workout-history?memberId=${memberId}`);
            const data = await res.json();

            if (data.success) {
                setWorkouts(data.data);
            } else {
                toast.error('Failed to load history');
            }
        } catch (error) {
            console.error('Failed to fetch workout history:', error);
            toast.error('Error loading workouts');
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async (workoutId: string, rating?: number) => {
        try {
            const res = await fetch('/api/member/workout-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workoutId,
                    memberId,
                    rating,
                    notes: 'Completed via mobile app'
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Workout marked as complete! 🎉');
                fetchHistory(); // Refresh list
            } else {
                toast.error('Failed to mark complete');
            }
        } catch (error) {
            console.error('Failed to mark workout complete:', error);
            toast.error('Error completing workout');
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const completedCount = workouts.filter(w => w.status === 'completed').length;
    const avgRating = workouts
        .filter(w => w.rating)
        .reduce((acc, w) => acc + (w.rating || 0), 0) / workouts.filter(w => w.rating).length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-6">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Workout History</h1>
                            <p className="text-xs text-gray-500">Track your fitness journey</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="px-4 mt-4 space-y-4">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
                            <CardContent className="p-4 text-center">
                                <Dumbbell className="mx-auto mb-2" size={24} />
                                <p className="text-2xl font-bold">{workouts.length}</p>
                                <p className="text-xs opacity-90">Total</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0">
                            <CardContent className="p-4 text-center">
                                <CheckCircle className="mx-auto mb-2" size={24} />
                                <p className="text-2xl font-bold">{completedCount}</p>
                                <p className="text-xs opacity-90">Completed</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
                            <CardContent className="p-4 text-center">
                                <Star className="mx-auto mb-2" size={24} />
                                <p className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</p>
                                <p className="text-xs opacity-90">Avg Rating</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Workout List */}
                    {workouts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Workouts Yet</h3>
                                <p className="text-sm text-gray-500 mb-4">Generate your first AI workout to get started!</p>
                                <Button
                                    onClick={() => router.push('/mobile/ai-workout')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                                >
                                    Generate Workout
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {workouts.map((workout) => (
                                <Card key={workout.id} className="border-2 hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="text-blue-600" size={20} />
                                                    <CardTitle className="text-base">{workout.goal}</CardTitle>
                                                </div>
                                                <p className="text-xs text-gray-600">{workout.ai_notes}</p>
                                            </div>
                                            <Badge className={getStatusColor(workout.status)}>
                                                {workout.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Workout Details */}
                                        <div className="flex flex-wrap gap-3 text-xs">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Clock size={14} />
                                                <span>{workout.duration} min</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Dumbbell size={14} />
                                                <span>{workout.plan_data?.length || 0} exercises</span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getRiskColor(workout.risk_level)}`}
                                            >
                                                {workout.risk_level} risk
                                            </Badge>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(workout.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Completion Info */}
                                        {workout.status === 'completed' && workout.completed_at && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-xs text-green-700 font-semibold mb-1">
                                                    ✅ Completed on {new Date(workout.completed_at).toLocaleDateString()}
                                                </p>
                                                {workout.rating && (
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={i < workout.rating!
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {workout.status !== 'completed' && (
                                                <Button
                                                    onClick={() => markComplete(workout.id, 5)}
                                                    size="sm"
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle size={16} className="mr-1" />
                                                    Mark Complete
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => setSelectedWorkout(
                                                    selectedWorkout?.id === workout.id ? null : workout
                                                )}
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                {selectedWorkout?.id === workout.id ? 'Hide' : 'View'} Exercises
                                            </Button>
                                        </div>

                                        {/* Exercise Details (Expandable) */}
                                        {selectedWorkout?.id === workout.id && (
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 animate-in slide-in-from-top">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">Exercises:</p>
                                                {workout.plan_data?.map((exercise, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                                        <span className="font-medium text-gray-800">
                                                            {idx + 1}. {exercise.name}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            {exercise.sets}x{exercise.reps}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
