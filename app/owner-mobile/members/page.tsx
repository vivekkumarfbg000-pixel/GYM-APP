'use client';

import { useState } from 'react';
import { Search, Phone, MoreVertical, Filter, User, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function MobileMembersPage() {
    const [search, setSearch] = useState('');

    // Mock Data
    const members = [
        { id: 1, name: 'Rahul Sharma', plan: 'Gold Plan', status: 'Active', expiry: '20 days left' },
        { id: 2, name: 'Priya Singh', plan: 'Silver Plan', status: 'Active', expiry: '12 days left' },
        { id: 3, name: 'Amit Kumar', plan: 'Gold Plan', status: 'Expiring', expiry: '2 days left' },
        { id: 4, name: 'Sneha Gupta', plan: 'Basic', status: 'Inactive', expiry: 'Expired' },
        { id: 5, name: 'Vikram Malhotra', plan: 'Platinum', status: 'Active', expiry: '45 days left' },
        { id: 6, name: 'Anjali Desai', plan: 'Gold Plan', status: 'Active', expiry: '28 days left' },
    ];

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCall = (name: string) => {
        toast.success(`Calling ${name}...`);
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 z-10 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-white">Members</h1>
                    <button className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                        <Filter size={16} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-900/50"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4 py-2 space-y-2">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="bg-zinc-900/40 border border-zinc-800/50 p-3 rounded-xl flex items-center justify-between hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-zinc-800">
                                <AvatarFallback className={`text-xs font-bold ${member.status === 'Active' ? 'bg-blue-900/30 text-blue-400' :
                                        member.status === 'Expiring' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-red-900/30 text-red-500'
                                    }`}>
                                    {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-sm font-medium text-gray-200">{member.name}</h3>
                                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                    {member.plan} • <span className={
                                        member.status === 'Active' ? 'text-green-500' :
                                            member.status === 'Expiring' ? 'text-yellow-500' : 'text-red-500'
                                    }>{member.expiry}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCall(member.name); }}
                                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-green-400 hover:bg-green-900/20 transition-all"
                            >
                                <Phone size={14} />
                            </button>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                        </div>
                    </div>
                ))}

                {filteredMembers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-600">
                            <User size={24} />
                        </div>
                        <p className="text-zinc-500">No members found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
