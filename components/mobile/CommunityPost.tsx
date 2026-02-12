'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bot, Send, Dumbbell, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityPostProps {
    post: any;
    currentMemberId: string | null;
    isExpanded: boolean;
    comments: any[];
    loadingComments: boolean;
    onLike: (postId: string) => void;
    onToggleComments: (postId: string) => void;
    onPostComment: (postId: string, content: string) => void;
}

export function CommunityPost({
    post,
    currentMemberId,
    isExpanded,
    comments,
    loadingComments,
    onLike,
    onToggleComments,
    onPostComment
}: CommunityPostProps) {
    const isAi = post.type === 'ai';
    const isOwner = post.type === 'owner';

    return (
        <div className={`bg-white p-5 rounded-3xl shadow-sm border transition-all duration-300 ${isAi ? 'border-purple-200 bg-gradient-to-br from-white to-purple-50/30' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="flex items-center gap-3 mb-4">
                <Avatar className={`h-11 w-11 border-2 ${isAi ? 'border-purple-100' : 'border-white shadow-sm'}`}>
                    {isAi ? (
                        <div className="h-full w-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Bot size={24} />
                        </div>
                    ) : (
                        <AvatarFallback className={`text-white font-bold ${isOwner ? 'bg-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                            {post.avatar || post.user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div>
                    <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                        {isAi ? 'GymFlow AI Coach' : post.user}
                        {isOwner && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">OWNER</span>}
                        {isAi && <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">COACH</span>}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">{post.time}</p>
                </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-wrap pl-1">{post.content}</p>

            {post.image && (
                <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-72" />
                </div>
            )}

            <div className="flex items-center gap-6 pt-2 border-t border-gray-50">
                <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-all active:scale-95 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                    <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "drop-shadow-sm" : ""} />
                    <span>{post.likes}</span>
                </button>
                <button
                    onClick={() => onToggleComments(post.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-all active:scale-95 ${isExpanded ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                    <MessageCircle size={20} fill={isExpanded ? "currentColor" : "none"} />
                    <span>{post.comments}</span>
                </button>
                <button className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Comments Section */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {loadingComments ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-3 text-sm group">
                                    <Avatar className="h-8 w-8 mt-0.5 border border-gray-100">
                                        <AvatarFallback className="text-[10px] bg-gray-100 text-gray-500 font-bold">
                                            {comment.avatar || comment.user.substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none group-hover:bg-gray-100 transition-colors">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold text-xs text-gray-900">{comment.user}</span>
                                            <span className="text-[10px] text-gray-400">{comment.time}</span>
                                        </div>
                                        <p className="text-gray-700 text-xs leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-xs">No comments yet. Be the first!</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 text-sm bg-transparent border-none px-4 py-2 focus:outline-none placeholder:text-gray-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onPostComment(post.id, (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                onPostComment(post.id, input.value);
                                input.value = '';
                            }}
                        >
                            <Send size={14} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
