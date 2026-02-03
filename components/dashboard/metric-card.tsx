'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    inverseTrend?: boolean;
}

export function MetricCard({ title, value, change, icon: Icon, trend = 'up', inverseTrend = false }: MetricCardProps) {
    // Determine color based on trend and inverse flag
    // Standard: Up = Green, Down = Red
    // Inverse (e.g. Churn): Up = Red, Down = Green

    let trendColor = 'text-gray-500';
    let TrendIcon = Minus;

    if (change > 0) {
        TrendIcon = ArrowUpRight;
        trendColor = inverseTrend ? 'text-red-500' : 'text-emerald-500';
    } else if (change < 0) {
        TrendIcon = ArrowDownRight;
        trendColor = inverseTrend ? 'text-emerald-500' : 'text-red-500';
    }

    // Background icon color
    const iconColor = change > 0 && !inverseTrend ? 'text-blue-500' : 'text-gray-500';

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-none relative overflow-hidden group">
            {/* Gradient glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <p className={`text-xs flex items-center mt-1 font-medium ${trendColor}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {Math.abs(change)}% from last month
                </p>
            </CardContent>
        </Card>
    );
}
