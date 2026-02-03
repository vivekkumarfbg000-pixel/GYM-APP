'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function SchedulePage() {
    const today = new Date();
    const classes = [
        { name: 'HIIT Blast', time: '06:00 AM', trainer: 'Sarah J.', attendees: 18, capacity: 20 },
        { name: 'Power Yoga', time: '08:00 AM', trainer: 'Mike T.', attendees: 12, capacity: 15 },
        { name: 'Spin Class', time: '05:30 PM', trainer: 'Jenny W.', attendees: 25, capacity: 25 },
        { name: 'CrossFit', time: '07:00 PM', trainer: 'David R.', attendees: 10, capacity: 12 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Class Schedule</h1>
                    <p className="text-gray-500 mt-1">{format(today, 'EEEE, MMMM do')}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                    {classes.length} Classes Today
                </div>
            </div>

            <div className="grid gap-4">
                {classes.map((cls, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-gray-50 rounded-2xl text-center min-w-[100px]">
                                    <Clock size={20} className="mx-auto text-gray-500 mb-1" />
                                    <span className="font-bold text-gray-900 block">{cls.time}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{cls.name}</h3>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                        <Users size={16} /> {cls.trainer}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-500 mb-1">Attendance</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    <span className={cls.attendees === cls.capacity ? 'text-red-500' : 'text-green-600'}>
                                        {cls.attendees}
                                    </span>
                                    <span className="text-gray-400 text-lg">/{cls.capacity}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
