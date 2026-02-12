'use client';

import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AIProgressCardProps {
    insight: {
        title: string;
        message: string;
        trend: 'up' | 'down' | 'neutral';
        metric?: string;
    } | null;
    loading?: boolean;
}

export function AIProgressCard({ insight, loading }: AIProgressCardProps) {
    if (loading) {
        return (
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
                <div className="flex gap-3 items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 p-5 rounded-3xl shadow-sm border border-purple-100 relative overflow-hidden group">
            {/* Background sparkle decoration */}
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles className="text-purple-400" size={40} />
            </div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-purple-100 text-purple-600">
                    <Sparkles size={20} className="fill-purple-100" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm">{insight.title}</h3>
                        {insight.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                        {insight.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                        {insight.trend === 'neutral' && <Minus size={14} className="text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        "{insight.message}"
                    </p>
                    {insight.metric && (
                        <div className="mt-3 inline-block bg-white/80 px-3 py-1 rounded-lg border border-purple-100 shadow-sm text-[10px] font-bold text-purple-700">
                            {insight.metric}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
