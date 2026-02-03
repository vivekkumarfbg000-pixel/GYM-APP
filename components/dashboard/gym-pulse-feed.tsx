'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, TrendingUp, UserMinus, Activity, CheckCircle2 } from 'lucide-react';

export function GymPulseFeed() {
    const items = [
        {
            type: 'alert',
            title: 'High Churn Risk Detected',
            msg: '3 premium members showed low activity this week.',
            time: '2h ago',
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            bg: 'bg-red-50'
        },
        {
            type: 'insight',
            title: 'Revenue Spike',
            msg: 'Personal training bookings are up 15% vs last month.',
            time: 'Yesterday',
            icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
            bg: 'bg-emerald-50'
        },
        {
            type: 'activity',
            title: 'New Member Signup',
            msg: 'Sarah J. joined "Premium Annual" plan.',
            time: '1d ago',
            icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
            bg: 'bg-blue-50'
        },
        {
            type: 'alert',
            title: 'Subscription Failed',
            msg: 'Payment failed for Member #4092.',
            time: '2d ago',
            icon: <UserMinus className="h-5 w-5 text-orange-500" />,
            bg: 'bg-orange-50'
        }
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-6">
                <Activity className="h-5 w-5 text-blue-600" />
                GymPulse Intelligence
            </h3>

            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${item.bg}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {item.msg}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
