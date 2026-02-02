'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Users, Flame, Heart, MessageCircle, Share2, Award, ChevronRight, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityFeedSkeleton, LeaderboardSkeleton } from '@/components/shared/skeleton-loaders';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'challenges'>('feed');
    const [feed, setFeed] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    // Member ID (Assuming stored in localStorage for now)
    const [memberId, setMemberId] = useState<string | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('gymflow_member_id');
        setMemberId(storedId);
        loadData(storedId);
    }, [activeTab]);

    const loadData = async (mid: string | null) => {
        setLoading(true);
        try {
            if (activeTab === 'feed') {
                const res = await fetch('/api/community/feed');
                const data = await res.json();
                if (Array.isArray(data)) setFeed(data);
            }
            if (activeTab === 'leaderboard') {
                const res = await fetch('/api/community/leaderboard');
                const data = await res.json();
                if (Array.isArray(data)) setLeaderboard(data);
            }
            if (activeTab === 'challenges') {
                const res = await fetch(`/api/community/challenges?memberId=${mid || ''}`);
                const data = await res.json();
                if (Array.isArray(data)) setChallenges(data);
            }
        } catch (error) {
            console.error('Failed to load community data', error);
            toast.error('Failed to load data');
        }
        setLoading(false);
    };

    const handleCreatePost = async () => {
        if (!postContent.trim() || !memberId) return;
        setPosting(true);
        try {
            const res = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, content: postContent })
            });
            if (res.ok) {
                toast.success('Post shared!');
                setPostContent('');
                loadData(memberId); // Reload feed
            }
        } catch (error) {
            toast.error('Failed to post');
        }
        setPosting(false);
    };

    const handleJoinChallenge = async (challengeId: string) => {
        if (!memberId) {
            toast.error('You must be logged in');
            return;
        }
        try {
            const res = await fetch('/api/community/challenges/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, challengeId })
            });
            if (res.ok) {
                toast.success('Joined challenge!');
                loadData(memberId); // Reload to show progress
            }
        } catch (error) {
            toast.error('Failed to join');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        Community
                    </h1>
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs transition-transform-200 hover:scale-110">
                        {/* User Level - Hardcoded for demo, could filter from leaderboard */}
                        LVL 5
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-2">
                    <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={<MessageCircle size={18} />} label="Feed" />
                    <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy size={18} />} label="Ranking" />
                    <TabButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} icon={<Flame size={18} />} label="Challenges" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <>
                        {activeTab === 'feed' && <CommunityFeedSkeleton />}
                        {activeTab === 'leaderboard' && <LeaderboardSkeleton />}
                        {activeTab === 'challenges' && (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* FEED TAB */}
                        {activeTab === 'feed' && (
                            <div className="space-y-4">
                                {/* Create Post Input */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                                    <Avatar className="h-10 w-10 bg-gray-200">
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Share your victory..."
                                            value={postContent}
                                            onChange={(e) => setPostContent(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                                            className="bg-gray-50 flex-1 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                        />
                                        <Button
                                            size="icon"
                                            className="rounded-full bg-orange-500 hover:bg-orange-600 h-10 w-10"
                                            onClick={handleCreatePost}
                                            disabled={posting || !postContent.trim()}
                                        >
                                            <Send size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {feed.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">No posts yet. Be the first!</div>
                                )}

                                {feed.map(post => (
                                    <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-400 text-white">
                                                <AvatarFallback>{post.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900">{post.user}</h3>
                                                <p className="text-xs text-gray-400">{post.time}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-800 text-sm mb-4 leading-relaxed">{post.content}</p>
                                        <div className="flex items-center gap-6 text-gray-400 text-sm">
                                            <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                                <Heart size={18} /> {post.likes}
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                                <MessageCircle size={18} /> {post.comments}
                                            </button>
                                            <button className="ml-auto">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* LEADERBOARD TAB */}
                        {activeTab === 'leaderboard' && (
                            <div className="space-y-3">
                                {leaderboard.map((user, i) => (
                                    <div key={user.id} className={`flex items-center p-4 rounded-2xl border ${user.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
                                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full mr-4 ${user.rank <= 3 ? 'bg-yellow-400 text-white shadow-md' : 'text-gray-400 bg-gray-100'}`}>
                                            {user.rank}
                                        </div>
                                        <Avatar className="h-10 w-10 mr-3 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-gray-200 text-gray-600">{user.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{user.name}</h3>
                                            <p className="text-xs text-gray-500">{user.points} Points</p>
                                        </div>
                                        {user.rank === 1 && <Trophy className="text-yellow-500" size={24} />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CHALLENGES TAB */}
                        {activeTab === 'challenges' && (
                            <div className="space-y-4">
                                {challenges.map(challenge => (
                                    <div key={challenge.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Trophy size={64} />
                                        </div>

                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{challenge.title}</h3>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Goal: {challenge.goal}</p>
                                            </div>
                                            {challenge.joined ? (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Joined</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">New</span>
                                            )}
                                        </div>

                                        {challenge.joined ? (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs font-semibold mb-1">
                                                    <span className="text-green-600">{Math.round((challenge.progress / challenge.total) * 100)}% Complete</span>
                                                    <span className="text-gray-400">{challenge.daysLeft} days left</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="text-xs text-orange-600 font-bold flex items-center gap-1">
                                                    <Award size={14} /> Earn 500 pts
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                                                    onClick={() => handleJoinChallenge(challenge.id)}
                                                >
                                                    Join
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all ${active ? 'border-orange-500 text-orange-600 font-bold' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
    >
        {icon}
        <span className="text-sm">{label}</span>
    </button>
);
