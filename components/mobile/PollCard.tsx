'use client';

import { Check, User } from 'lucide-react';

interface PollCardProps {
    poll: any;
    userVotedOptionId: string | null;
    onVote: (pollId: string, optionId: string) => void;
}

export function PollCard({ poll, userVotedOptionId, onVote }: PollCardProps) {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{poll.question}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600/80 font-medium bg-indigo-50 inline-flex px-2 py-1 rounded-lg">
                        <User size={12} />
                        <span>Posted by {poll.createdBy}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white shadow-sm border border-indigo-50 rounded-xl px-3 py-2 min-w-[60px]">
                    <span className="text-xl font-bold text-indigo-600">{poll.totalVotes}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Votes</span>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {poll.options.map((option: any) => {
                    const isVoted = userVotedOptionId === option.id;
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

                    return (
                        <button
                            key={option.id}
                            onClick={() => onVote(poll.id, option.id)}
                            disabled={!!userVotedOptionId}
                            className={`w-full text-left relative h-12 rounded-xl transition-all duration-300 overflow-hidden group/opt ${userVotedOptionId
                                    ? 'cursor-default'
                                    : 'hover:shadow-md hover:-translate-y-0.5'
                                }`}
                        >
                            {/* Background Bar */}
                            <div className="absolute inset-0 bg-gray-100/80 rounded-xl border border-gray-200"></div>

                            {/* Progress Bar */}
                            <div
                                className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${isVoted
                                        ? 'bg-indigo-500'
                                        : userVotedOptionId
                                            ? 'bg-indigo-200'
                                            : 'bg-indigo-100 group-hover/opt:bg-indigo-200'
                                    }`}
                                style={{ width: userVotedOptionId ? `${percentage}%` : '0%' }}
                            ></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                <span className={`text-sm font-bold z-10 ${isVoted ? 'text-white' : 'text-gray-700'}`}>
                                    {option.text}
                                </span>
                                {userVotedOptionId && (
                                    <div className="flex items-center gap-2 z-10">
                                        {isVoted && <Check size={16} className="text-white" />}
                                        <span className={`text-sm font-bold ${isVoted ? 'text-white' : 'text-gray-600'}`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {userVotedOptionId && (
                <div className="mt-4 text-center">
                    <p className="text-xs text-indigo-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                        Thanks for voting! 🗳️
                    </p>
                </div>
            )}
        </div>
    );
}
