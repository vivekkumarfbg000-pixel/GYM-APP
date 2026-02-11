'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Challenge {
    id: string;
    name: string;
    description: string;
    type: string;
    target_value: number;
    start_date: string;
    end_date: string;
    prize_description: string;
    challenge_participants: any[];
}

interface Participant {
    rank: number;
    members: {
        name: string;
    };
    current_progress: number;
    completed_at: string | null;
}

export function ChallengeBrowser({ memberId }: { memberId: string }) {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    useEffect(() => {
        if (selectedChallenge) {
            fetchLeaderboard(selectedChallenge.id);
        }
    }, [selectedChallenge]);

    const fetchChallenges = async () => {
        try {
            const gymOwnerId = localStorage.getItem('gymflow_gym_owner_id');
            const res = await fetch(`/api/community/challenges?gymOwnerId=${gymOwnerId}`);
            const data = await res.json();
            if (data.success) {
                setChallenges(data.data || []);
                if (data.data.length > 0) {
                    setSelectedChallenge(data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async (challengeId: string) => {
        try {
            const res = await fetch(`/api/community/challenges/${challengeId}`);
            const data = await res.json();
            if (data.success) {
                setLeaderboard(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        }
    };

    const joinChallenge = async (challengeId: string) => {
        try {
            const res = await fetch(`/api/community/challenges/${challengeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Successfully joined the challenge!');
                fetchLeaderboard(challengeId);
            } else {
                toast.error(data.error || 'Failed to join challenge');
            }
        } catch (error) {
            console.error('Failed to join challenge:', error);
            toast.error('Failed to join challenge');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading challenges...</div>;
    }

    if (challenges.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No active challenges at the moment</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Challenge Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                    <Card
                        key={challenge.id}
                        className={`cursor-pointer transition-all ${selectedChallenge?.id === challenge.id
                                ? 'ring-2 ring-blue-500 shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                        onClick={() => setSelectedChallenge(challenge)}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target size={20} className="text-blue-600" />
                                {challenge.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(challenge.end_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {challenge.challenge_participants?.[0]?.count || 0} joined
                                </span>
                            </div>
                            {challenge.prize_description && (
                                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                    <p className="text-xs font-semibold text-yellow-800">
                                        🏆 Prize: {challenge.prize_description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Leaderboard */}
            {selectedChallenge && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" />
                                Leaderboard
                            </span>
                            <Button onClick={() => joinChallenge(selectedChallenge.id)} size="sm">
                                Join Challenge
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                No participants yet. Be the first to join!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((participant, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-3 rounded-lg ${participant.rank === 1
                                                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
                                                : participant.rank === 2
                                                    ? 'bg-gray-50 border border-gray-200'
                                                    : participant.rank === 3
                                                        ? 'bg-orange-50 border border-orange-200'
                                                        : 'bg-white border border-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${participant.rank === 1
                                                        ? 'bg-yellow-400 text-white'
                                                        : participant.rank === 2
                                                            ? 'bg-gray-400 text-white'
                                                            : participant.rank === 3
                                                                ? 'bg-orange-400 text-white'
                                                                : 'bg-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {participant.rank}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {participant.members.name}
                                                </p>
                                                {participant.completed_at && (
                                                    <span className="text-xs text-green-600">✓ Completed</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">
                                                {participant.current_progress}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                / {selectedChallenge.target_value}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
