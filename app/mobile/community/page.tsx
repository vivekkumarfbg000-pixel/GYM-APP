'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Users, Flame, Heart, MessageCircle, Share2, Award, ChevronRight, Send, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityPost } from '@/components/mobile/CommunityPost';
import { PollCard } from '@/components/mobile/PollCard';
import { LeaderboardRow } from '@/components/mobile/LeaderboardRow';
import { ChallengeCard } from '@/components/mobile/ChallengeCard';
import { CommunityFeedSkeleton, LeaderboardSkeleton } from '@/components/shared/skeleton-loaders';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'challenges' | 'duels'>('feed');
    const [challenge, setChallenge] = useState<any>(null);
    const [feed, setFeed] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    // Comments state
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, any[]>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

    // Polls state
    const [polls, setPolls] = useState<any[]>([]);
    const [votedPolls, setVotedPolls] = useState<Record<string, string>>({}); // pollId -> optionId

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
                // Fetch posts
                const res = await fetch(`/api/community/feed?memberId=${mid || ''}`);
                const data = await res.json();
                if (Array.isArray(data)) setFeed(data);

                // Fetch polls
                const pollsRes = await fetch('/api/community/polls');
                const pollsData = await pollsRes.json();
                if (Array.isArray(pollsData)) {
                    setPolls(pollsData);

                    // Check which polls user has voted on
                    if (mid) {
                        // Check which polls user has voted on (Bulk Fetch)
                        if (mid) {
                            try {
                                const voteRes = await fetch(`/api/community/polls/vote?memberId=${mid}`);
                                const voteData = await voteRes.json();
                                if (voteData.votes) {
                                    setVotedPolls(voteData.votes);
                                }
                            } catch (e) {
                                console.error("Failed to load user votes", e);
                            }
                        }
                    }
                }
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
            if (activeTab === 'duels') {
                const res = await fetch(`/api/gamification/duels?memberId=${mid || ''}`);
                const data = await res.json();
                if (data.success) setChallenges(data.data); // Reuse challenges state for duels list
            }
        } catch (error) {
            console.error('Failed to load community data', error);
            toast.error('Failed to load data');
        }
        setLoading(false);
    };

    const handleCreatePost = async (imageUrl?: string) => {
        if (!postContent.trim() || !memberId) return;
        setPosting(true);
        try {
            const res = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, content: postContent, imageUrl, type: 'regular' })
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

    const handleAiPost = async () => {
        if (!memberId) return;
        try {
            toast.promise(
                fetch('/api/ai/generate-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ triggerMemberId: memberId })
                }).then(res => res.json()),
                {
                    loading: 'AI Coach is writing...',
                    success: () => {
                        loadData(memberId);
                        return 'AI Motivation Posted!';
                    },
                    error: 'Failed to generate'
                }
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleLike = async (postId: string, reactionType: string = 'like') => {
        if (!memberId) return;

        // Special case for AI Analysis
        if (reactionType === 'analyze') {
            try {
                toast.promise(
                    fetch('/api/ai/community-coach', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId, memberId })
                    }).then(res => res.json()),
                    {
                        loading: 'Coach is analyzing...',
                        success: (data) => {
                            if (data.analysis) {
                                // Update local state to show analysis immediately
                                setFeed(prev => prev.map(p =>
                                    p.id === postId ? { ...p, ai_analysis: data.analysis } : p
                                ));
                                return 'Analysis Ready! 🧠';
                            }
                            return 'Analysis Complete';
                        },
                        error: 'Analysis failed'
                    }
                );
            } catch (e) {
                console.error(e);
            }
            return;
        }

        // Optimistic update for Reactions
        setFeed(prev => prev.map(p => {
            if (p.id === postId) {
                const isRemoving = p.userReaction === reactionType;
                const isChanging = p.userReaction && p.userReaction !== reactionType;

                return {
                    ...p,
                    isLiked: !isRemoving, // Legacy support
                    userReaction: isRemoving ? null : reactionType,
                    likes: isRemoving ? p.likes - 1 : (isChanging ? p.likes : p.likes + 1)
                };
            }
            return p;
        }));

        try {
            await fetch('/api/community/interact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like', postId, memberId, reactionType })
            });
        } catch (e) {
            toast.error("Failed to react");
            loadData(memberId); // Revert on error
        }
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

    const toggleComments = async (postId: string) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
            return;
        }

        setExpandedPost(postId);

        // Fetch if not already loaded
        if (!comments[postId]) {
            setLoadingComments(prev => ({ ...prev, [postId]: true }));
            try {
                const res = await fetch(`/api/community/comments?postId=${postId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setComments(prev => ({ ...prev, [postId]: data }));
                }
            } catch (error) {
                console.error(error);
            }
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleComment = async (postId: string, content: string) => {
        if (!content.trim() || !memberId) return;

        // Optimistic update
        const newComment = {
            id: 'temp-' + Date.now(),
            user: 'Me',
            avatar: 'ME',
            content: content,
            time: 'Just now'
        };

        setComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] || []), newComment]
        }));

        // Update feed count
        setFeed(prev => prev.map(p =>
            p.id === postId ? { ...p, comments: p.comments + 1 } : p
        ));

        try {
            await fetch('/api/community/interact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'comment', postId, memberId, content })
            });
            // Background re-fetch could happen here to get real ID/timestamp
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        if (!memberId) {
            toast.error('Please log in to vote');
            return;
        }

        // Optimistic update
        setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));

        // Update poll data optimistically
        setPolls(prev => prev.map(poll => {
            if (poll.id === pollId) {
                return {
                    ...poll,
                    options: poll.options.map((opt: any) => {
                        if (opt.id === optionId) {
                            return { ...opt, votes: opt.votes + 1 };
                        }
                        // If user changed vote, decrement old option
                        if (votedPolls[pollId] && opt.id === votedPolls[pollId]) {
                            return { ...opt, votes: Math.max(0, opt.votes - 1) };
                        }
                        return opt;
                    }),
                    totalVotes: votedPolls[pollId] ? poll.totalVotes : poll.totalVotes + 1
                };
            }
            return poll;
        }));

        try {
            const res = await fetch('/api/community/polls/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollId, memberId, optionId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Vote recorded!');
                // Refresh polls data to get accurate counts
                loadData(memberId);
            }
        } catch (error) {
            toast.error('Failed to vote');
            // Revert on error
            loadData(memberId);
        }
    };

    const [showDuelModal, setShowDuelModal] = useState(false);
    const [duelConfig, setDuelConfig] = useState({
        opponentEmail: '',
        title: 'Battle Royale',
        target: 500, // calories or points
        days: 3
    });

    const handleCreateDuel = async () => {
        if (!memberId || !duelConfig.opponentEmail) return;
        setPosting(true);
        try {
            // First find opponent by email (mock search for now or real if API exists)
            // For MVP we just creaet the challenge directly with the email as a placeholder or fail

            const res = await fetch('/api/gamification/duels/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorId: memberId,
                    opponentEmail: duelConfig.opponentEmail,
                    title: duelConfig.title,
                    target: duelConfig.target,
                    duration: duelConfig.days
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Duel Challenge Sent! ⚔️');
                setShowDuelModal(false);
                loadData(memberId);
            } else {
                toast.error(data.error || 'User not found');
            }
        } catch (error) {
            toast.error('Failed to create duel');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-in fade-in duration-300 relative">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        Community
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                            <Flame size={14} className="text-orange-500 fill-orange-500" />
                            <span className="text-xs font-bold text-orange-700">12 Day Streak</span>
                        </div>
                        <div className="h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-200">
                            5
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-2">
                    <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={<MessageCircle size={18} />} label="Feed" />
                    <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy size={18} />} label="Ranking" />
                    <TabButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} icon={<Flame size={18} />} label="Challenges" />
                    <TabButton active={activeTab === 'duels'} onClick={() => setActiveTab('duels')} icon={<Users size={18} />} label="Duels" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <>
                        {activeTab === 'feed' && <CommunityFeedSkeleton />}
                        {activeTab === 'leaderboard' && <LeaderboardSkeleton />}
                        {(activeTab === 'challenges' || activeTab === 'duels') && (
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
                        {activeTab === 'feed' && (
                            <div className="space-y-4">
                                {/* Create Post Input */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                                    <div className="flex gap-3">
                                        <Avatar className="h-10 w-10 bg-gray-200">
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Share your victory..."
                                                value={postContent}
                                                onChange={(e) => setPostContent(e.target.value)}
                                                className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                                            />

                                            {/* Image URL Input (MVP) */}
                                            <input
                                                type="text"
                                                placeholder="Image URL (optional)..."
                                                className="w-full text-xs text-gray-500 bg-transparent border-b border-gray-100 focus:outline-none"
                                                id="post-image-url"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500" onClick={() => document.getElementById('post-image-url')?.focus()} aria-label="Add image URL">
                                                <Share2 size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500" onClick={handleAiPost}>
                                                <Bot size={16} /> <span className="ml-1 text-xs">AI Post</span>
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="rounded-full bg-orange-500 hover:bg-orange-600 px-6"
                                            onClick={() => {
                                                const imgUrl = (document.getElementById('post-image-url') as HTMLInputElement).value;
                                                handleCreatePost(imgUrl);
                                            }}
                                            disabled={posting || !postContent.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </div>

                                {/* Daily AI Challenge Card */}
                                {challenge && (
                                    <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏆</div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                                    AI Daily Challenge
                                                </span>
                                                <span className="text-xl">{challenge.emoji}</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{challenge.title}</h3>
                                            <p className="text-xs text-white/90 mb-3">{challenge.description}</p>
                                            <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                                                Accept Challenge
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Posts Feed */}
                                {/* Polls Section */}
                                {polls.map(poll => (
                                    <PollCard
                                        key={poll.id}
                                        poll={poll}
                                        userVotedOptionId={votedPolls[poll.id]}
                                        onVote={handleVote}
                                    />
                                ))}

                                {feed.length === 0 && polls.length === 0 && (
                                    <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-sm font-medium">No posts yet. Be the first to share your gains!</p>
                                    </div>
                                )}

                                {feed.map(post => (
                                    <CommunityPost
                                        key={post.id}
                                        post={post}
                                        currentMemberId={memberId}
                                        isExpanded={expandedPost === post.id}
                                        comments={comments[post.id] || []}
                                        loadingComments={loadingComments[post.id]}
                                        onLike={handleLike}
                                        onToggleComments={toggleComments}
                                        onPostComment={handleComment}
                                    />
                                ))}
                            </div>
                        )}

                        {/* LEADERBOARD TAB */}
                        {activeTab === 'leaderboard' && (
                            <div className="space-y-3">
                                {leaderboard.map((user, i) => (
                                    <LeaderboardRow
                                        key={user.id}
                                        user={user}
                                        rank={user.rank}
                                    />
                                ))}
                            </div>
                        )}

                        {/* CHALLENGES TAB */}
                        {activeTab === 'challenges' && (
                            <div className="space-y-4">
                                {challenges.map(challenge => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onJoin={handleJoinChallenge}
                                    />
                                ))}
                            </div>
                        )}

                        {/* DUELS TAB */}
                        {activeTab === 'duels' && (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-red-200">
                                    <h2 className="text-2xl font-bold mb-2">⚔️ Gym Battle Arena</h2>
                                    <p className="text-white/90 mb-4 text-sm">Challenge a friend to a 1v1 duel!</p>
                                    <Button
                                        onClick={() => setShowDuelModal(true)}
                                        className="bg-white text-red-600 hover:bg-gray-100 w-full rounded-full font-bold"
                                    >
                                        Start a Duel
                                    </Button>
                                </div>

                                <h3 className="font-bold text-gray-900 mt-6">My Active Duels</h3>
                                {(challenges || []).filter((c: any) => c.is_duel).length === 0 ? (
                                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
                                        <p className="text-gray-400 text-sm">No active battles. Start one!</p>
                                    </div>
                                ) : (
                                    (challenges || []).filter((c: any) => c.is_duel).map((duel: any) => (
                                        <div key={duel.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                                    <Flame size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900">{duel.title}</h4>
                                                    <p className="text-xs text-gray-500">vs {duel.opponent?.name || 'Waiting...'}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600 uppercase">
                                                {duel.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* DUEL MODAL */}
                {showDuelModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 text-white text-center">
                                <h3 className="text-xl font-bold">New Challenge</h3>
                                <p className="text-white/80 text-sm">Challenge a rival to a duel</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Opponent Email</label>
                                    <input
                                        type="email"
                                        className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-200"
                                        placeholder="friend@email.com"
                                        value={duelConfig.opponentEmail}
                                        onChange={e => setDuelConfig(c => ({ ...c, opponentEmail: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Target (Cal/Pts)</label>
                                        <input
                                            type="number"
                                            className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-200"
                                            value={duelConfig.target}
                                            onChange={e => setDuelConfig(c => ({ ...c, target: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Duration (Days)</label>
                                        <input
                                            type="number"
                                            className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-200"
                                            value={duelConfig.days}
                                            onChange={e => setDuelConfig(c => ({ ...c, days: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => setShowDuelModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleCreateDuel}
                                        disabled={posting || !duelConfig.opponentEmail}
                                    >
                                        {posting ? 'Sending...' : 'Send Challenge'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
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
