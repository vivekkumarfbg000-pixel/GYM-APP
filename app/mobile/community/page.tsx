'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Users, Flame, Heart, MessageCircle, Share2, Award, ChevronRight, Send, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityFeedSkeleton, LeaderboardSkeleton } from '@/components/shared/skeleton-loaders';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'challenges' | 'duels'>('feed');
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
                        const voted: Record<string, string> = {};
                        for (const poll of pollsData) {
                            const voteRes = await fetch(`/api/community/polls/vote?pollId=${poll.id}&memberId=${mid}`);
                            const voteData = await voteRes.json();
                            if (voteData.voted) {
                                voted[poll.id] = voteData.optionId;
                            }
                        }
                        setVotedPolls(voted);
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

    const handleLike = async (postId: string) => {
        if (!memberId) return;

        // Optimistic update
        setFeed(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLiked: !p.isLiked,
                    likes: p.isLiked ? p.likes - 1 : p.likes + 1
                };
            }
            return p;
        }));

        try {
            await fetch('/api/community/interact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like', postId, memberId })
            });
        } catch (e) {
            toast.error("Failed to like");
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
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500" onClick={() => document.getElementById('post-image-url')?.focus()}>
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

                                {/* Polls Section */}
                                {polls.map(poll => {
                                    const userVoted = votedPolls[poll.id];
                                    return (
                                        <div key={poll.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl shadow-sm border border-indigo-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-base mb-1">{poll.question}</h3>
                                                    <p className="text-xs text-indigo-600 font-medium">by {poll.createdBy}</p>
                                                </div>
                                                <div className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
                                                    {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {poll.options.map((option: any) => {
                                                    const isVoted = userVoted === option.id;
                                                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleVote(poll.id, option.id)}
                                                            className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden ${isVoted
                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                : userVoted
                                                                    ? 'bg-white/50 text-gray-600 cursor-default'
                                                                    : 'bg-white hover:bg-indigo-100 text-gray-700 hover:shadow-sm active:scale-98'
                                                                }`}
                                                            disabled={!!userVoted}
                                                        >
                                                            {/* Progress bar background */}
                                                            {userVoted && (
                                                                <div
                                                                    className={`absolute inset-0 ${isVoted ? 'bg-indigo-700/30' : 'bg-indigo-200/40'} transition-all duration-500`}
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            )}

                                                            <div className="relative z-10 flex items-center justify-between">
                                                                <span className="font-medium text-sm">{option.text}</span>
                                                                {userVoted && (
                                                                    <span className={`text-xs font-bold ${isVoted ? 'text-white' : 'text-indigo-700'}`}>
                                                                        {percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {userVoted && (
                                                <p className="text-xs text-indigo-600 mt-3 text-center">✓ You voted</p>
                                            )}
                                        </div>
                                    );
                                })}

                                {feed.length === 0 && polls.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">No posts yet. Be the first!</div>
                                )}

                                {feed.map(post => (
                                    <div key={post.id} className={`bg-white p-4 rounded-2xl shadow-sm border ${post.type === 'ai' ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className={`h-10 w-10 ${post.type === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-gradient-to-br from-blue-400 to-indigo-400 text-white'}`}>
                                                <AvatarFallback>
                                                    {post.type === 'ai' ? <Bot size={20} /> : post.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                                                    {post.type === 'ai' ? 'AI Coach' : post.user}
                                                    {post.type === 'owner' && <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold">OWNER</span>}
                                                    {post.type === 'ai' && <span className="bg-purple-100 text-purple-600 text-[10px] px-1.5 py-0.5 rounded font-bold">BOT</span>}
                                                </h3>
                                                <p className="text-xs text-gray-400">{post.time}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-800 text-sm mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                        {post.image && (
                                            <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                                                <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-64" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-50 pt-3">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                                            >
                                                <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} /> {post.likes}
                                            </button>
                                            <button
                                                className={`flex items-center gap-1.5 transition-colors ${expandedPost === post.id ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}`}
                                                onClick={() => toggleComments(post.id)}
                                            >
                                                <MessageCircle size={18} /> {post.comments}
                                            </button>
                                            <button className="ml-auto hover:text-gray-800">
                                                <Share2 size={18} />
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {expandedPost === post.id && (
                                            <div className="mt-4 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                                                    {loadingComments[post.id] ? (
                                                        <p className="text-xs text-center text-gray-400">Loading comments...</p>
                                                    ) : (comments[post.id] || []).length > 0 ? (
                                                        (comments[post.id] || []).map((comment: any) => (
                                                            <div key={comment.id} className="flex gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                                                                <Avatar className="h-6 w-6 mt-1">
                                                                    <AvatarFallback className="text-[10px] bg-gray-200">{comment.avatar}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-baseline">
                                                                        <span className="font-bold text-xs">{comment.user}</span>
                                                                        <span className="text-[10px] text-gray-400">{comment.time}</span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-xs mt-0.5">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-center text-gray-400 py-2">No comments yet. Say something!</p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        className="flex-1 text-sm bg-gray-50 border-none rounded-full px-4 py-2 focus:ring-1 focus:ring-blue-200"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleComment(post.id, (e.target as HTMLInputElement).value);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                            handleComment(post.id, input.value);
                                                            input.value = '';
                                                        }}
                                                    >
                                                        <Send size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
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
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                {user.name}
                                                {user.streak > 0 && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">
                                                        <Flame size={10} className="fill-current" />
                                                        {user.streak}
                                                    </span>
                                                )}
                                            </h3>
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
