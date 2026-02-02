'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { recentActivity } from '@/lib/mock-data';

export function ActivityFeed() {
    const getActivityColor = (type: string) => {
        switch (type) {
            case 'signup': return 'bg-green-50 border-green-200';
            case 'renewal': return 'bg-blue-50 border-blue-200';
            case 'churn': return 'bg-red-50 border-red-200';
            case 'pt-booking': return 'bg-purple-50 border-purple-200';
            case 'campaign-response': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Live updates from your gym</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {recentActivity.map((activity, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                        >
                            <span className="text-2xl">{activity.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {activity.member}
                                </p>
                                <p className="text-sm text-gray-600">{activity.action}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {activity.time}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
