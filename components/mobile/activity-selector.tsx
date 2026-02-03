'use client';

import { useRouter } from 'next/navigation';
import { X, MapPin, Dumbbell, ChevronRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface ActivitySelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActivitySelector({ open, onOpenChange }: ActivitySelectorProps) {
    const router = useRouter();

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-white rounded-t-[2rem]">
                <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mt-4 mb-6" />

                <DrawerHeader className="text-center pb-2">
                    <DrawerTitle className="text-2xl font-bold text-gray-900">Start Activity</DrawerTitle>
                    <p className="text-gray-500 font-medium">Choose your workout mode</p>
                </DrawerHeader>

                <div className="p-6 space-y-4 pb-12">
                    {/* Outdoor Run Option */}
                    <button
                        onClick={() => router.push('/mobile/workout')}
                        className="w-full bg-blue-50 p-4 rounded-3xl flex items-center justify-between border border-blue-100 hover:bg-blue-100 active:scale-95 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                <MapPin size={24} fill="currentColor" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Outdoor Run</h3>
                                <p className="text-sm text-blue-600 font-medium">GPS Tracking • Pace • Route</p>
                            </div>
                        </div>
                        <ChevronRight className="text-blue-300" />
                    </button>

                    {/* AI Strength Option */}
                    <button
                        onClick={() => router.push('/mobile/ai-workout')}
                        className="w-full bg-purple-50 p-4 rounded-3xl flex items-center justify-between border border-purple-100 hover:bg-purple-100 active:scale-95 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                                <Dumbbell size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 text-lg">AI Strength Coach</h3>
                                <p className="text-sm text-purple-600 font-medium">Custom Plan • Reps • Sets</p>
                            </div>
                        </div>
                        <ChevronRight className="text-purple-300" />
                    </button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
