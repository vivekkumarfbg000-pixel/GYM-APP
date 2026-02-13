'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function EquipmentPage() {
    const router = useRouter();
    const [equipment, setEquipment] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            const res = await fetch('/api/equipment');
            const data = await res.json();
            if (Array.isArray(data)) setEquipment(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportIssue = (machineName: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Submitting report...',
                success: `Report sent for ${machineName}. Thanks for helping!`,
                error: 'Failed to send report'
            }
        );
    };

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Equipment Guide</h1>
                </div>
                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find machine..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-10 opacity-50">Loading machines...</div>
                ) : filteredEquipment.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                {item.status === 'operational' && <CheckCircle size={14} className="text-green-500" />}
                                {item.status === 'maintenance' && <Clock size={14} className="text-yellow-500" />}
                                {item.status === 'down' || item.status === 'repair' && <AlertTriangle size={14} className="text-red-500" />}
                            </div>
                            <p className="text-xs text-gray-500 mb-3">ID: {item.serial_number || 'N/A'}</p>

                            <div className="flex gap-2">
                                <button className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium border border-blue-100 flex items-center gap-1">
                                    <Info size={10} /> How to Use
                                </button>
                                {item.status === 'operational' && (
                                    <button
                                        onClick={() => handleReportIssue(item.name)}
                                        className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-medium border border-gray-100"
                                    >
                                        Report Issue
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            {/* Status Pill */}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${item.status === 'operational' ? 'bg-green-100 text-green-700' :
                                    item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
