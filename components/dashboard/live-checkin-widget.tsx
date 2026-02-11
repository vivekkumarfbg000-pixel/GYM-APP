'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface CheckInMember {
    id: string;
    members: {
        name: string;
    };
    check_in_time: string;
}

export function LiveCheckInWidget({ gymOwnerId }: { gymOwnerId: string }) {
    const [count, setCount] = useState(0);
    const [members, setMembers] = useState<CheckInMember[]>([]);
    const [recentActivity, setRecentActivity] = useState<string>('');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Initial fetch
        fetchCheckIns();

        // Setup WebSocket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

        socketInstance.on('connect', () => {
            console.log('Connected to WebSocket');
            socketInstance.emit('join:gym', gymOwnerId);
        });

        socketInstance.on('checkin:update', (data: any) => {
            setRecentActivity(`${data.memberName} checked in`);
            fetchCheckIns(); // Refresh count
            setTimeout(() => setRecentActivity(''), 5000);
        });

        socketInstance.on('checkout:update', (data: any) => {
            setRecentActivity(`${data.memberName} checked out`);
            fetchCheckIns(); // Refresh count
            setTimeout(() => setRecentActivity(''), 5000);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [gymOwnerId]);

    const fetchCheckIns = async () => {
        try {
            const res = await fetch(`/api/realtime/checkins?gymOwnerId=${gymOwnerId}`);
            const data = await res.json();
            if (data.success) {
                setCount(data.data.count);
                setMembers(data.data.members || []);
            }
        } catch (error) {
            console.error('Failed to fetch check-ins', error);
        }
    };

    return (
        <Card className="relative overflow-hidden border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <div className="relative">
                        <Users size={20} />
                        {count > 0 && (
                            <motion.div
                                className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        )}
                    </div>
                    <span className="text-sm font-semibold">Live Check-Ins</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                    <motion.span
                        key={count}
                        initial={{ scale: 1.3, color: '#22c55e' }}
                        animate={{ scale: 1, color: '#15803d' }}
                        className="text-4xl font-bold text-green-700"
                    >
                        {count}
                    </motion.span>
                    <span className="text-sm text-green-600 font-medium">
                        member{count !== 1 ? 's' : ''} in gym
                    </span>
                </div>

                {/* Recent Activity Toast */}
                <AnimatePresence>
                    {recentActivity && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-2 mt-2"
                        >
                            <Activity size={14} className="animate-pulse" />
                            <span>{recentActivity}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Member List Preview (Optional) */}
                {members.length > 0 && members.length <= 5 && (
                    <div className="mt-4 space-y-1">
                        {members.map((member) => (
                            <div key={member.id} className="text-xs text-green-600 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                <span>{member.members.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
