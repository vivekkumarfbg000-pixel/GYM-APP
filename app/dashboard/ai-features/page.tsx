'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Users, DollarSign, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AIFeaturesPage() {
    const features = [
        {
            title: 'Churn Prediction',
            description: 'Analyze member behavior to predict dropout risk.',
            icon: Users,
            color: 'bg-red-100 text-red-600',
            href: '/dashboard/members?filter=risk',
            stats: '94% Accuracy'
        },
        {
            title: 'Dynamic Pricing',
            description: 'Optimize membership fees based on demand.',
            icon: DollarSign,
            color: 'bg-green-100 text-green-600',
            href: '/dashboard/products', // Assuming products page handles pricing
            stats: '+15% Revenue'
        },
        {
            title: 'Automated Campaigns',
            description: 'AI-generated offers for at-risk members.',
            icon: Brain,
            color: 'bg-purple-100 text-purple-600',
            href: '/dashboard/campaigns',
            stats: '3.5x ROI'
        },
        {
            title: 'AI Trainer Oversignt',
            description: 'Monitor automated workout plans and quality.',
            icon: Activity,
            color: 'bg-blue-100 text-blue-600',
            href: '/dashboard/trainers', // Or ai-trainer
            stats: '1.2k Plans'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Intelligence Hub</h1>
                <p className="text-gray-500 mt-2">Manage all autonomous agents and predictive models.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {features.map((feature, i) => (
                    <Card key={i} className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-blue-600">
                        <CardHeader className="flex flex-row items-start gap-4">
                            <div className={`p-3 rounded-xl ${feature.color}`}>
                                <feature.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="mt-1">{feature.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                                    {feature.stats}
                                </span>
                                <Link href={feature.href}>
                                    <Button variant="ghost" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        Open <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* AI Insights Summary */}
            <Card className="bg-gradient-to-br from-gray-900 to-slate-800 text-white border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="text-purple-400" /> System Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span>Prediction Models</span>
                        <span className="text-green-400 font-bold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> Active
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span>Last Training Run</span>
                        <span className="text-gray-300">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Pending Actions</span>
                        <span className="text-orange-300 font-bold">12 recommendations</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
