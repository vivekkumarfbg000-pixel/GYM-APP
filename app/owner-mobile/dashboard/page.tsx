'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, TrendingUp, Users, DollarSign, Activity, ChevronRight, UserPlus, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OwnerDashboard() {
    const [gymName, setGymName] = useState('My Gym');
    const [stats, setStats] = useState({
        activeMembers: 142,
        checkInsToday: 34,
        monthlyRevenue: 285000
    });

    useEffect(() => {
        const name = localStorage.getItem('gymflow_owner_name');
        if (name) setGymName(name.split(' ')[0] + "'s Gym"); // "Vivek's Gym"
    }, []);

    const recentActivity = [
        { id: 1, type: 'checkin', user: 'Rahul Sharma', time: '2 min ago', message: 'Checked in' },
        { id: 2, type: 'signup', user: 'New Member', time: '1 hour ago', message: 'gold plan purchased' },
        { id: 3, type: 'payment', user: 'Priya Singh', time: '2 hours ago', message: 'Renewed membership' },
        { id: 4, type: 'alert', user: 'System', time: '4 hours ago', message: 'Treadmill 3 reported issue' },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-6 pb-2 flex items-center justify-between">
                <div>
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">Owner Dashboard</p>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        {gymName}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-900"></span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Carousel */}
            <div className="px-6 py-4 flex gap-4 overflow-x-auto scrollbar-hide snap-x">
                <StatCard
                    icon={Users}
                    label="Active Members"
                    value={stats.activeMembers}
                    color="blue"
                    trend="+12% this month"
                />
                <StatCard
                    icon={DollarSign}
                    label="Revenue (Feb)"
                    value={`₹${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
                    color="green"
                    trend="+5% vs Jan"
                />
                <StatCard
                    icon={Activity}
                    label="Check-ins"
                    value={stats.checkInsToday}
                    color="purple"
                    trend="Busy time now"
                />
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-2">
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 p-4 rounded-2xl flex items-center gap-3 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                            <UserPlus size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm text-zinc-200">Add Member</p>
                            <p className="text-[10px] text-zinc-500">Quick Register</p>
                        </div>
                    </button>
                    <button className="bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 p-4 rounded-2xl flex items-center gap-3 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform">
                            <Send size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm text-zinc-200">Blast Msg</p>
                            <p className="text-[10px] text-zinc-500">Alert All</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Live Feed */}
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-white">Live Activity</h2>
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        View All <ChevronRight size={12} />
                    </button>
                </div>

                <div className="space-y-4">
                    {recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors">
                            <div className={`w-2 h-2 rounded-full ${item.type === 'checkin' ? 'bg-green-500' :
                                    item.type === 'signup' ? 'bg-blue-500' :
                                        item.type === 'payment' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                            <Avatar className="h-10 w-10 border border-zinc-800">
                                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                    {item.user.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-200">{item.user}</p>
                                <p className="text-xs text-zinc-500">{item.message}</p>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
    const colors: any = {
        blue: 'from-blue-600 to-indigo-600',
        green: 'from-emerald-600 to-teal-600',
        purple: 'from-purple-600 to-fuchsia-600'
    };

    return (
        <div className="min-w-[140px] snap-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={48} />
            </div>
            <div className="relative z-10">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon size={16} className="text-white" />
                </div>
                <p className="text-zinc-400 text-xs font-medium mb-1">{label}</p>
                <p className="text-xl font-bold text-white mb-2">{value}</p>
                <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-green-500" />
                    <span className="text-[10px] text-green-500 font-bold">{trend}</span>
                </div>
            </div>
        </div>
    );
}
