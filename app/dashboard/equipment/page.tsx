'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, CheckCircle, AlertTriangle, AlertOctagon, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New Equipment Form State
    const [newItem, setNewItem] = useState({
        name: '',
        serial_number: '',
        status: 'operational',
        notes: ''
    });

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/equipment');
            const data = await res.json();
            if (Array.isArray(data)) setEquipment(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.name) return;
        try {
            const res = await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                toast.success('Equipment added!');
                setOpen(false);
                setNewItem({ name: '', serial_number: '', status: 'operational', notes: '' });
                loadEquipment();
            }
        } catch (error) {
            toast.error('Failed to add');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/equipment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (res.ok) {
                toast.success('Status updated');
                loadEquipment();
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

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

    // Calculate Stats
    const total = equipment.length;
    const operational = equipment.filter(e => e.status === 'operational').length;
    const health = total > 0 ? Math.round((operational / total) * 100) : 0;
    const maintenance = equipment.filter(e => e.status === 'maintenance').length;
    const broken = equipment.filter(e => e.status === 'down' || e.status === 'repair').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment Manager</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gray-900 text-white gap-2">
                            <Plus size={18} /> Add Machine
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Equipment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Machine Name (e.g., Treadmill Matrix)"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                            <Input
                                placeholder="Serial Number / ID"
                                value={newItem.serial_number}
                                onChange={(e) => setNewItem({ ...newItem, serial_number: e.target.value })}
                            />
                            <Select
                                value={newItem.status}
                                onValueChange={(v) => setNewItem({ ...newItem, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="operational">Operational</SelectItem>
                                    <SelectItem value="maintenance">Maintenance Due</SelectItem>
                                    <SelectItem value="repair">Needs Repair</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAdd} className="w-full">Register Item</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Operational</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{health}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Maintenance Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{maintenance}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Out of Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{broken}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Inventory Status</CardTitle>
                        <CardDescription>Live tracking of machine health</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadEquipment}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading && <div className="text-center py-4">Loading inventory...</div>}

                        {!loading && equipment.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors gap-4">
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-500 font-mono">ID: {item.serial_number || 'N/A'}</p>
                                    {item.notes && <p className="text-xs text-gray-400 mt-1 italic">"{item.notes}"</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-gray-500">Last Service</p>
                                        <p className="text-sm font-medium">{item.last_service || 'Unknown'}</p>
                                    </div>

                                    <Select
                                        defaultValue={item.status}
                                        onValueChange={(val) => updateStatus(item.id, val)}
                                    >
                                        <SelectTrigger className={`w-[140px] h-8 text-xs font-bold uppercase tracking-wide border-0 ${getStatusColor(item.status)}`}>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(item.status)}
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="operational">Operational</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="repair">Repair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
