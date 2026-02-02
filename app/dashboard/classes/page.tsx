'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Class {
    id: number;
    name: string;
    instructor: string;
    time: string;
    duration: number;
    capacity: number;
    booked: number;
    waitlist: number;
    category: string;
    level: string;
    day: string;
}

const classes: Class[] = [
    { id: 1, name: 'HIIT Cardio Blast', instructor: 'Rajesh Kumar', time: '06:00 AM', duration: 45, capacity: 25, booked: 23, waitlist: 3, category: 'Cardio', level: 'All Levels', day: 'Mon' },
    { id: 2, name: 'Yoga Flow', instructor: 'Priya Sharma', time: '07:00 AM', duration: 60, capacity: 30, booked: 18, waitlist: 0, category: 'Yoga', level: 'Beginner', day: 'Mon' },
    { id: 3, name: 'CrossFit WOD', instructor: 'Amit Patel', time: '08:00 AM', duration: 60, capacity: 20, booked: 20, waitlist: 5, category: 'Strength', level: 'Advanced', day: 'Mon' },
    { id: 4, name: 'Spin Class', instructor: 'Neha Singh', time: '06:30 PM', duration: 45, capacity: 30, booked: 28, waitlist: 2, category: 'Cardio', level: 'All Levels', day: 'Mon' },
    { id: 5, name: 'Power Yoga', instructor: 'Priya Sharma', time: '07:30 PM', duration: 60, capacity: 30, booked: 22, waitlist: 0, category: 'Yoga', level: 'Intermediate', day: 'Mon' },

    { id: 6, name: 'Boot Camp', instructor: 'Rajesh Kumar', time: '06:00 AM', duration: 45, capacity: 25, booked: 21, waitlist: 0, category: 'Strength', level: 'All Levels', day: 'Tue' },
    { id: 7, name: 'Pilates Core', instructor: 'Priya Sharma', time: '10:00 AM', duration: 50, capacity: 20, booked: 12, waitlist: 0, category: 'Pilates', level: 'Beginner', day: 'Tue' },
    { id: 8, name: 'Boxing Fitness', instructor: 'Amit Patel', time: '07:00 PM', duration: 45, capacity: 25, booked: 24, waitlist: 1, category: 'Boxing', level: 'All Levels', day: 'Tue' },
];

const upcomingClasses = classes.filter(c => c.day === 'Mon').slice(0, 4);

const memberBookings = [
    { id: 1, memberName: 'Sneha Reddy', class: 'HIIT Cardio Blast', time: 'Today 06:00 AM', status: 'Confirmed' },
    { id: 2, memberName: 'Rohit Verma', class: 'CrossFit WOD', time: 'Today 08:00 AM', status: 'Waitlist' },
    { id: 3, memberName: 'Anjali Desai', class: 'Spin Class', time: 'Today 06:30 PM', status: 'Confirmed' },
];

const popularClasses = [
    { name: 'HIIT Cardio Blast', bookings: 156, rating: 4.8 },
    { name: 'CrossFit WOD', bookings: 142, rating: 4.9 },
    { name: 'Spin Class', bookings: 138, rating: 4.7 },
    { name: 'Power Yoga', bookings: 125, rating: 4.6 },
];

export default function ClassesPage() {
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [selectedDay, setSelectedDay] = useState('Mon');

    const filteredClasses = classes.filter(c => c.day === selectedDay);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Class Scheduling & Booking
                        </h1>
                        <p className="text-gray-600 mt-1">Manage classes, bookings, and schedules</p>
                    </div>
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                        + Create New Class
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Today's Classes"
                    value="12"
                    subtitle="5 upcoming"
                    icon="📅"
                    color="orange"
                />
                <MetricCard
                    title="Total Bookings"
                    value="156"
                    subtitle="+18 vs yesterday"
                    icon="🎫"
                    color="blue"
                />
                <MetricCard
                    title="Avg Attendance"
                    value="87%"
                    subtitle="Capacity utilization"
                    icon="📊"
                    color="green"
                />
                <MetricCard
                    title="On Waitlist"
                    value="11"
                    subtitle="Across 4 classes"
                    icon="⏳"
                    color="purple"
                />
            </div>

            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="instructors">Instructors</TabsTrigger>
                </TabsList>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-6">
                    {/* Day Selector */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-2 overflow-x-auto">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                    <Button
                                        key={day}
                                        variant={selectedDay === day ? 'default' : 'outline'}
                                        onClick={() => setSelectedDay(day)}
                                        className="min-w-24"
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredClasses.map((classItem) => (
                            <ClassCard
                                key={classItem.id}
                                classItem={classItem}
                                onBook={() => setSelectedClass(classItem)}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>Latest member class registrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {memberBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{booking.memberName}</p>
                                            <p className="text-sm text-gray-600">{booking.class}</p>
                                            <p className="text-xs text-gray-500">{booking.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                                                {booking.status}
                                            </Badge>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" variant="outline" className="text-xs">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                View All Bookings (156)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Waitlist Management */}
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="text-orange-900">Waitlist Management</CardTitle>
                            <CardDescription>Members waiting for class spots</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { class: 'CrossFit WOD', members: 5, nextAvailable: 'Tomorrow 08:00 AM' },
                                    { class: 'HIIT Cardio Blast', members: 3, nextAvailable: 'Tomorrow 06:00 AM' },
                                    { class: 'Spin Class', members: 2, nextAvailable: 'Today 06:30 PM' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white border border-orange-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{item.class}</p>
                                                <p className="text-sm text-gray-600">{item.members} members waiting</p>
                                                <p className="text-xs text-orange-600">Next: {item.nextAvailable}</p>
                                            </div>
                                            <Button size="sm" className="bg-orange-600">
                                                Notify All
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Popular Classes</CardTitle>
                                <CardDescription>By total bookings this month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {popularClasses.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-yellow-500">⭐</span>
                                                        <span className="text-sm text-gray-600">{item.rating}</span>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-orange-600">{item.bookings}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                    style={{ width: `${(item.bookings / 156) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Class Category Breakdown</CardTitle>
                                <CardDescription>Distribution by type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { category: 'Cardio', count: 45, color: 'orange' },
                                        { category: 'Strength', count: 38, color: 'blue' },
                                        { category: 'Yoga', count: 32, color: 'purple' },
                                        { category: 'Other', count: 25, color: 'green' },
                                    ].map((item) => (
                                        <div key={item.category}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{item.category}</span>
                                                <span className="text-sm text-gray-600">{item.count}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                    style={{ width: `${item.count}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-blue-900">🤖 AI Optimization Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-white border border-blue-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>💡 Schedule Optimization:</strong> Move "Pilates Core" from 10 AM to 7 PM to increase attendance by estimated 40%
                                </p>
                            </div>
                            <div className="p-3 bg-white border border-blue-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>📈 Capacity Expansion:</strong> "CrossFit WOD" has 5 waitlisted members consistently. Consider adding a second session at 9 AM
                                </p>
                            </div>
                            <div className="p-3 bg-white border border-blue-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>👥 Instructor Balance:</strong> Priya Sharma teaching 40% of classes. Distribute load to prevent burnout
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Instructors Tab */}
                <TabsContent value="instructors" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Rajesh Kumar', classes: 8, rating: 4.8, speciality: 'HIIT & Strength' },
                            { name: 'Priya Sharma', classes: 12, rating: 4.9, speciality: 'Yoga & Pilates' },
                            { name: 'Amit Patel', classes: 7, rating: 4.7, speciality: 'CrossFit & Boxing' },
                            { name: 'Neha Singh', classes: 5, rating: 4.6, speciality: 'Spin & Cardio' },
                        ].map((instructor) => (
                            <Card key={instructor.name}>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {instructor.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <h3 className="font-bold text-lg mt-3">{instructor.name}</h3>
                                        <p className="text-sm text-gray-600">{instructor.speciality}</p>
                                        <div className="flex items-center justify-center gap-4 mt-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-orange-600">{instructor.classes}</p>
                                                <p className="text-xs text-gray-600">Classes/Week</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-yellow-600">{instructor.rating}</p>
                                                <p className="text-xs text-gray-600">Rating</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full mt-4" size="sm">
                                            View Schedule
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Booking Modal */}
            {selectedClass && (
                <BookingModal
                    classItem={selectedClass}
                    onClose={() => setSelectedClass(null)}
                />
            )}
        </div>
    );
}

function ClassCard({ classItem, onBook }: { classItem: Class; onBook: () => void }) {
    const availableSpots = classItem.capacity - classItem.booked;
    const capacityPercent = Math.round((classItem.booked / classItem.capacity) * 100);
    const isFull = availableSpots === 0;

    return (
        <Card className={isFull ? 'border-red-200' : 'border-green-200'}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{classItem.name}</h3>
                        <p className="text-sm text-gray-600">{classItem.instructor}</p>
                    </div>
                    <Badge className={isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {isFull ? 'Full' : `${availableSpots} spots left`}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-600">Time</p>
                        <p className="font-semibold">{classItem.time}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="font-semibold">{classItem.duration} min</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-semibold">{classItem.category}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Level</p>
                        <p className="font-semibold">{classItem.level}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Capacity</span>
                        <span className="text-xs font-semibold">{classItem.booked}/{classItem.capacity} ({capacityPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${capacityPercent}%` }}
                        />
                    </div>
                </div>

                {classItem.waitlist > 0 && (
                    <p className="text-xs text-orange-600 mb-3">
                        ⏳ {classItem.waitlist} members on waitlist
                    </p>
                )}

                <Button
                    onClick={onBook}
                    className={`w-full ${isFull ? 'bg-orange-600' : 'bg-green-600'}`}
                >
                    {isFull ? 'Join Waitlist' : 'Book Now'}
                </Button>
            </CardContent>
        </Card>
    );
}

function BookingModal({ classItem, onClose }: { classItem: Class; onClose: () => void }) {
    const isFull = classItem.booked >= classItem.capacity;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{isFull ? 'Join Waitlist' : 'Book Class'}</CardTitle>
                            <CardDescription>{classItem.name}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-600">Instructor</p>
                                <p className="font-semibold">{classItem.instructor}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Time</p>
                                <p className="font-semibold">{classItem.time}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Duration</p>
                                <p className="font-semibold">{classItem.duration} min</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Level</p>
                                <p className="font-semibold">{classItem.level}</p>
                            </div>
                        </div>
                    </div>

                    {isFull && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-900">
                                ⚠️ This class is currently full. You'll be added to the waitlist and notified via WhatsApp when a spot opens up.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Select Member:</p>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose member to book for..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Sneha Reddy - Premium</SelectItem>
                                <SelectItem value="2">Rohit Verma - Standard</SelectItem>
                                <SelectItem value="3">Anjali Desai - Premium+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold">
                        {isFull ? 'Join Waitlist' : 'Confirm Booking'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        orange: 'from-orange-500 to-red-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
