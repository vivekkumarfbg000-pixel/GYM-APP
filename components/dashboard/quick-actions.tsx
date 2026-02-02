'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function QuickActions() {
    const router = useRouter();

    const actions = [
        {
            icon: '📢',
            title: 'Launch Retention Campaign',
            description: 'Send offers to at-risk members',
            color: 'from-red-500 to-orange-500',
            onClick: () => router.push('/dashboard/campaigns?tab=create&segment=At-Risk')
        },
        {
            icon: '💪',
            title: 'Schedule PT Session',
            description: 'Book personal training',
            color: 'from-purple-500 to-pink-500',
            onClick: () => router.push('/dashboard/trainers')
        },
        {
            icon: '🎉',
            title: 'Weekend Promo',
            description: 'Launch weekend campaign',
            color: 'from-blue-500 to-cyan-500',
            onClick: () => router.push('/dashboard/campaigns?tab=create')
        },
        {
            icon: '📊',
            title: 'View Check-ins',
            description: "Today's attendance",
            color: 'from-green-500 to-emerald-500',
            onClick: () => router.push('/dashboard/analytics')
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks, one click away</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
                        >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {action.title}
                                </h4>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
