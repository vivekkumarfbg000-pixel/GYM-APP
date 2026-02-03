'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Clock, Users, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SchedulePage() {
    const today = new Date();
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New Class Form State
    const [newClass, setNewClass] = useState({
        name: '',
        trainer: '',
        start_time: '', // HH:mm
        duration: 60,
        capacity: 20
    });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/schedule');
            const data = await res.json();
            if (Array.isArray(data)) setClasses(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async () => {
        if (!newClass.name || !newClass.trainer || !newClass.start_time) {
            toast.error('Please fill all fields');
            return;
        }

        // Combine today's date with time string
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const dateTime = `${dateStr}T${newClass.start_time}:00`;

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newClass, start_time: dateTime })
            });

            if (res.ok) {
                toast.success('Class added!');
                setOpen(false);
                setNewClass({ name: '', trainer: '', start_time: '', duration: 60, capacity: 20 });
                loadClasses();
            } else {
                toast.error('Failed to add class');
            }
        } catch (error) {
            toast.error('Error adding class');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Cancel this class?')) return;
        try {
            const res = await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Class cancelled');
                loadClasses();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Class Schedule</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <CalendarIcon size={16} /> {format(today, 'EEEE, MMMM do')}
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus size={18} /> Add Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule New Class</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Class Name (e.g., HIIT)"
                                value={newClass.name}
                                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            />
                            <Input
                                placeholder="Trainer Name"
                                value={newClass.trainer}
                                onChange={(e) => setNewClass({ ...newClass, trainer: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500">Start Time</label>
                                    <Input
                                        type="time"
                                        value={newClass.start_time}
                                        onChange={(e) => setNewClass({ ...newClass, start_time: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500">Duration (min)</label>
                                    <Input
                                        type="number"
                                        value={newClass.duration}
                                        onChange={(e) => setNewClass({ ...newClass, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddClass} className="w-full">Confirm Schedule</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {classes.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No classes scheduled for today
                        </div>
                    )}

                    {classes.map((cls) => (
                        <Card key={cls.id} className="hover:shadow-md transition-shadow group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl text-center min-w-[100px] border border-gray-100">
                                        <Clock size={20} className="mx-auto text-gray-500 mb-1" />
                                        <span className="font-bold text-gray-900 block">
                                            {format(new Date(cls.start_time), 'hh:mm a')}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{cls.name}</h3>
                                        <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
                                            <Users size={16} /> {cls.trainer} • {cls.duration} min
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right mr-4">
                                        <div className="text-sm font-medium text-gray-500 mb-1">Attendance</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            <span className={cls.attendees >= cls.capacity ? 'text-red-500' : 'text-green-600'}>
                                                {cls.attendees}
                                            </span>
                                            <span className="text-gray-400 text-lg">/{cls.capacity}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(cls.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
