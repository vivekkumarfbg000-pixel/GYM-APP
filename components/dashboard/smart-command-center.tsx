'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Megaphone, Users, Calendar, BarChart3, Settings, Dumbbell } from 'lucide-react';

type Tab = 'suggested' | 'campaigns' | 'manage';

export function SmartCommandCenter() {
    const [activeTab, setActiveTab] = useState<Tab>('suggested');
    const router = useRouter();

    const actions = {
        suggested: [
            {
                label: 'Generate Retention Plan',
                icon: <Sparkles className="h-5 w-5 text-purple-500" />,
                desc: 'AI-driven strategy for at-risk members',
                onClick: () => router.push('/dashboard/ai-features')
            },
            {
                label: 'Weekend Promo',
                icon: <Megaphone className="h-5 w-5 text-blue-500" />,
                desc: 'Launch a flash sale campaign',
                onClick: () => router.push('/dashboard/campaigns?tab=create')
            },
            {
                label: 'Analyze Churn',
                icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
                desc: 'View deep dive metrics',
                onClick: () => router.push('/dashboard/analytics')
            }
        ],
        campaigns: [
            {
                label: 'New Email Blast',
                icon: <Megaphone className="h-5 w-5 text-gray-700" />,
                desc: 'Send to all active members',
                onClick: () => router.push('/dashboard/campaigns')
            },
            {
                label: 'Win-Back Offer',
                icon: <Users className="h-5 w-5 text-gray-700" />,
                desc: 'Target cancelled members',
                onClick: () => router.push('/dashboard/campaigns?segment=cancelled')
            }
        ],
        manage: [
            {
                label: 'Add Trainer',
                icon: <Users className="h-5 w-5 text-gray-700" />,
                desc: 'Onboard new staff',
                onClick: () => router.push('/dashboard/trainers')
            },
            {
                label: 'Class Schedule',
                icon: <Calendar className="h-5 w-5 text-gray-700" />,
                desc: 'Manage weekly timetable',
                onClick: () => router.push('/dashboard/schedule')
            },
            {
                label: 'Equipment Log',
                icon: <Dumbbell className="h-5 w-5 text-gray-700" />,
                desc: 'Track maintenance',
                onClick: () => router.push('/dashboard/equipment')
            }
        ]
    };

    return (
        <Card className="h-full border-none shadow-md bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            Command Center
                        </CardTitle>
                        <CardDescription>Quick access to high-impact actions</CardDescription>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg mt-4">
                    {(['suggested', 'campaigns', 'manage'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {actions[activeTab].map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all group text-left"
                        >
                            <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {action.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {action.label}
                                </h4>
                                <p className="text-xs text-gray-500">{action.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
