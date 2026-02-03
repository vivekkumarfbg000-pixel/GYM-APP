'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function EquipmentPage() {
    const equipment = [
        { name: 'Treadmill Matrix T50', id: 'TR-01', status: 'operational', lastService: '2 weeks ago' },
        { name: 'Treadmill Matrix T50', id: 'TR-02', status: 'operational', lastService: '2 weeks ago' },
        { name: 'Elliptical E-Series', id: 'EL-01', status: 'maintenance', lastService: 'Pending' },
        { name: 'Smith Machine', id: 'SM-01', status: 'operational', lastService: '1 month ago' },
        { name: 'Cable Crossover', id: 'CC-01', status: 'repair', lastService: 'Broken cable' },
        { name: 'Leg Press', id: 'LP-01', status: 'operational', lastService: '3 weeks ago' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-green-100 text-green-700 border-green-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'repair': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'operational': return <CheckCircle size={16} />;
            case 'maintenance': return <Wrench size={16} />;
            case 'repair': return <AlertOctagon size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment Manager</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Summary Stats */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Operational</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">85%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Maintenance Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">3</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Out of Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">1</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory Status</CardTitle>
                    <CardDescription>Live tracking of machine health</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {equipment.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-500 font-mono">ID: {item.id}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-gray-500">Last Service</p>
                                        <p className="text-sm font-medium">{item.lastService}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {item.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
