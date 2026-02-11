'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Square, MapPin, Check, X, Clock, Navigation, Flame } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { MobileMapSkeleton } from '@/components/shared/skeleton-loaders';

// Dynamically import Map (no SSR)
const LiveMap = dynamic(() => import('@/components/mobile/LiveMap'), {
    ssr: false,
    loading: () => <MobileMapSkeleton />
});

// Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default function WorkoutTrackingPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);

    // Stats
    const [startTime, setStartTime] = useState<string | null>(null);
    const [duration, setDuration] = useState(0); // seconds
    const [distance, setDistance] = useState(0); // meters
    const [speed, setSpeed] = useState(0); // km/h
    const [calories, setCalories] = useState(0);

    // Saving state
    const [isSaving, setIsSaving] = useState(false);

    const watchId = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastPos = useRef<[number, number] | null>(null);

    // Initial location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    lastPos.current = [pos.coords.latitude, pos.coords.longitude];
                },
                (err) => console.error('GPS Error:', err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
                // MET value ~8.0 for running, but let's assume ~10kcal/min for avg
                setCalories(c => c + (10 / 60));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startTracking = () => {
        if (!startTime) setStartTime(new Date().toISOString());
        setStatus('recording');
        toast.success('Workout started! GPS active.');

        if ('geolocation' in navigator) {
            watchId.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const newPoint: [number, number] = [lat, lng];

                    setPosition(newPoint);
                    setRoute(prev => [...prev, newPoint]);

                    if (lastPos.current) {
                        const dist = getDistance(
                            lastPos.current[0], lastPos.current[1],
                            lat, lng
                        );

                        // Ignore GPS noise (< 3 meters)
                        if (dist > 3) {
                            setDistance(d => d + dist);
                            // Instant speed
                            if (pos.coords.speed) {
                                setSpeed(pos.coords.speed * 3.6);
                            }
                            lastPos.current = newPoint;
                        }
                    } else {
                        lastPos.current = newPoint;
                    }
                },
                (err) => toast.error('GPS Lost: ' + err.message),
                { enableHighAccuracy: true }
            );
        }
    };

    const pauseTracking = () => {
        setStatus('paused');
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };

    const finishWorkout = () => {
        pauseTracking();
        setStatus('finished');
    };

    const saveWorkout = async () => {
        setIsSaving(true);
        const memberId = localStorage.getItem('gymflow_member_id');

        if (!memberId) {
            toast.error('Not logged in!');
            router.push('/mobile/login');
            return;
        }

        try {
            const payload = {
                memberId,
                workoutType: 'Running', // Hardcoded for MVP, make selectable later
                startTime: startTime,
                endTime: new Date().toISOString(),
                duration,
                distance,
                calories: Math.round(calories),
                routeData: route // Save full route for replay
            };

            const res = await fetch('/api/member/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Workout Saving...');
                setTimeout(() => {
                    router.push('/mobile/dashboard');
                }, 1000);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error('Failed to save: ' + error.message);
            setIsSaving(false);
        }
    };

    const discardWorkout = () => {
        if (confirm('Discard this workout? Data will be lost.')) {
            router.push('/mobile/dashboard');
        }
    };

    // Summary Screen
    if (status === 'finished') {
        return (
            <div className="fixed inset-0 bg-white z-[600] flex flex-col animate-in fade-in slide-in-from-bottom-10">
                <div className="bg-blue-600 p-8 text-white text-center rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <MapPin size={200} className="absolute -right-10 -top-10" />
                    </div>

                    <h1 className="text-3xl font-bold mb-1 relative z-10">Great Job! 🎉</h1>
                    <p className="text-blue-100 relative z-10">Workout Complete</p>

                    <div className="mt-8 flex justify-center items-end gap-2 relative z-10">
                        <span className="text-6xl font-bold">{(distance / 1000).toFixed(2)}</span>
                        <span className="text-xl font-medium mb-3 opacity-80">km</span>
                    </div>
                </div>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                            <Clock className="text-orange-500 mb-2" size={24} />
                            <p className="text-2xl font-bold text-gray-800">{formatTime(duration)}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase">Duration</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                            <Flame className="text-red-500 mb-2" size={24} />
                            <p className="text-2xl font-bold text-gray-800">{calories.toFixed(0)}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase">Calories</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center col-span-2">
                            <Navigation className="text-blue-500 mb-2" size={24} />
                            <p className="text-2xl font-bold text-gray-800">
                                {duration > 0 ? (speed || (distance / 1000 / (duration / 3600))).toFixed(1) : 0}
                            </p>
                            <p className="text-xs text-gray-500 font-medium uppercase">Avg Speed (km/h)</p>
                        </div>
                    </div>

                    {/* Small Map Preview (Static-ish) */}
                    <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                        {/* We can re-use LiveMap here but smaller */}
                        {position && <LiveMap position={position} route={route} />}
                        <div className="absolute inset-0 bg-transparent pointer-events-none border-4 border-white/50 rounded-xl"></div>
                    </div>
                </div>

                <div className="p-6 pb-12 bg-white border-t border-gray-100 flex gap-4">
                    <button
                        onClick={discardWorkout}
                        disabled={isSaving}
                        className="flex-1 py-4 text-gray-500 font-semibold rounded-xl hover:bg-gray-50"
                    >
                        Discard
                    </button>
                    <button
                        onClick={saveWorkout}
                        disabled={isSaving}
                        className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Workout'}
                        {!isSaving && <Check size={20} />}
                    </button>
                </div>
            </div>
        );
    }

    // Tracker UI
    return (
        <div className="h-[calc(100vh-64px)] relative flex flex-col bg-gray-50">
            {/* Map Area */}
            <div className="flex-1 bg-gray-200 relative">
                {position ? (
                    <LiveMap position={position} route={route} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100">
                        <div className="text-center animate-pulse">
                            <MapPin className="mx-auto mb-2 text-blue-500" />
                            <p className="text-sm font-medium">Acquiring GPS...</p>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-[400] bg-white text-gray-700 p-2 rounded-full shadow-md"
                >
                    <X size={20} />
                </button>

                {/* Live Stats Overlay */}
                <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-gray-900">
                            {(distance / 1000).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">km</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="font-mono font-bold text-blue-600 text-lg">
                        {formatTime(duration)}
                    </div>
                </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-white px-6 pb-20 pt-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[500] relative -mt-6">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8"></div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-3 gap-8 mb-8 text-center">
                    <div>
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Flame size={14} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Kcal</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{calories.toFixed(0)}</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Navigation size={14} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Km/h</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{speed.toFixed(1)}</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Clock size={14} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Pace</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {(1000 / speed || 0).toFixed(0)}<span className="text-xs text-gray-400">/km</span>
                        </p>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center justify-center gap-8">
                    {status === 'recording' ? (
                        <>
                            <button
                                onClick={pauseTracking}
                                className="h-16 w-16 bg-yellow-100 text-yellow-600 rounded-3xl flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <Pause size={32} fill="currentColor" />
                            </button>
                            <button
                                onClick={finishWorkout}
                                className="h-24 w-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-red-200 active:scale-95 transition-transform"
                            >
                                <Square size={32} fill="currentColor" />
                            </button>
                        </>
                    ) : status === 'paused' ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={startTracking}
                                    className="h-20 w-20 bg-green-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-green-200 active:scale-95 transition-transform"
                                >
                                    <Play size={40} fill="currentColor" className="ml-2" />
                                </button>
                                <span className="text-xs font-medium text-green-600">Resume</span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={finishWorkout}
                                    className="h-20 w-20 bg-gray-100 text-gray-600 rounded-[2rem] flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    <Square size={28} fill="currentColor" />
                                </button>
                                <span className="text-xs font-medium text-gray-500">Finish</span>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={startTracking}
                            className="h-24 w-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-300 active:scale-95 transition-all hover:scale-105 active:shadow-blue-200"
                        >
                            <Play size={44} fill="currentColor" className="ml-2" />
                        </button>
                    )}
                </div>

                {status === 'idle' && (
                    <p className="text-center text-gray-400 text-sm mt-6 font-medium">Tap to start running</p>
                )}
            </div>
        </div>
    );
}
