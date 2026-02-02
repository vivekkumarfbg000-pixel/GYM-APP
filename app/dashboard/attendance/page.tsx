'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockMembers, type Member } from '@/lib/mock-data';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/error-state';

interface AttendanceRecord {
    id: string;
    memberId: string;
    memberName: string;
    checkIn: string;
    checkOut?: string;
    duration?: string;
}

export default function AttendancePage() {
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
    const [scanMode, setScanMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const currentCapacity = todayAttendance.filter(a => !a.checkOut).length;
    const maxCapacity = 250;
    const capacityPercent = Math.round((currentCapacity / maxCapacity) * 100);
    const totalCheckins = todayAttendance.length;

    // Load initial data
    useEffect(() => {
        loadTodayAttendance();
    }, []);

    const loadTodayAttendance = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Create some mock attendance records
        const mockAttendance: AttendanceRecord[] = [
            { id: '1', memberId: '1', memberName: 'Rahul Sharma', checkIn: '06:15 AM', checkOut: '07:30 AM', duration: '1h 15m' },
            { id: '2', memberId: '3', memberName: 'Amit Kumar', checkIn: '07:00 AM', duration: 'Active' },
            { id: '3', memberId: '5', memberName: 'Vikram Singh', checkIn: '08:30 AM', checkOut: '09:45 AM', duration: '1h 15m' },
            { id: '4', memberId: '8', memberName: 'Kavya Iyer', checkIn: '09:00 AM', duration: 'Active' },
        ];
        setTodayAttendance(mockAttendance);
        setLoading(false);
    };

    const handleQuickCheckIn = async () => {
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            memberId: selectedMember.id,
            memberName: selectedMember.name,
            checkIn: timeString,
            duration: 'Active'
        };

        setTodayAttendance([newRecord, ...todayAttendance]);
        toast.success(`✅ ${selectedMember.name} checked in at ${timeString}`, {
            description: 'Welcome to the gym!'
        });

        setSelectedMember(null);
        setSearchQuery('');
    };

    const handleScanCheckIn = (memberId: string) => {
        const member = mockMembers.find(m => m.id === memberId);
        if (!member) {
            toast.error('Member not found');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            memberId: member.id,
            memberName: member.name,
            checkIn: timeString,
            duration: 'Active'
        };

        setTodayAttendance([newRecord, ...todayAttendance]);
        toast.success(`✅ ${member.name} checked in!`);
        setScanMode(false);
    };

    const handleCheckOut = (recordId: string, memberName: string) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        setTodayAttendance(todayAttendance.map(record => {
            if (record.id === recordId) {
                // Calculate duration (simplified)
                return {
                    ...record,
                    checkOut: timeString,
                    duration: '1h 15m' // Simplified calculation
                };
            }
            return record;
        }));

        toast.success(`👋 ${memberName} checked out at ${timeString}`, {
            description: 'Great workout!'
        });
    };

    const filteredMembers = searchQuery
        ? mockMembers.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // Analytics data
    const peakHoursData = [
        { hour: '5 AM', count: 12 },
        { hour: '6 AM', count: 28 },
        { hour: '7 AM', count: 45 },
        { hour: '8 AM', count: 38 },
        { hour: '9 AM', count: 25 },
        { hour: '5 PM', count: 42 },
        { hour: '6 PM', count: 52 },
        { hour: '7 PM', count: 48 },
        { hour: '8 PM', count: 35 },
    ];

    const weeklyTrend = [
        { day: 'Mon', visits: 145 },
        { day: 'Tue', visits: 152 },
        { day: 'Wed', visits: 138 },
        { day: 'Thu', visits: 148 },
        { day: 'Fri', visits: 142 },
        { day: 'Sat', visits: 168 },
        { day: 'Sun', visits: 125 },
    ];

    const visitFrequency = [
        { name: 'Daily', count: 45, color: '#10b981' },
        { name: 'Regular', count: 78, color: '#3b82f6' },
        { name: 'Occasional', count: 52, color: '#f59e0b' },
        { name: 'Rare', count: 25, color: '#ef4444' },
    ];

    const inactiveMembers = mockMembers
        .filter(m => m.churnRisk > 60)
        .slice(0, 5);

    if (loading && todayAttendance.length === 0) {
        return <LoadingState message="Loading attendance data..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Attendance & Check-in
                    </h1>
                    <p className="text-gray-600 mt-1">Real-time facility monitoring and member tracking</p>
                </div>
                <Button
                    onClick={() => setScanMode(!scanMode)}
                    className={scanMode ? 'bg-red-600' : 'bg-gradient-to-r from-green-600 to-blue-600'}
                >
                    {scanMode ? (
                        <>
                            <span className="mr-2">❌</span> Cancel Scan
                        </>
                    ) : (
                        <>
                            <span className="mr-2">📷</span> QR Scan Mode
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Real-time Capacity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Current Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{currentCapacity}/{maxCapacity}</div>
                        <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${capacityPercent > 80 ? 'bg-red-500' : capacityPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${capacityPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{capacityPercent}% capacity</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Today's Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{totalCheckins}</div>
                        <p className="text-xs text-gray-500 mt-2">+12% vs yesterday</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg. Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">1h 22m</div>
                        <p className="text-xs text-gray-500 mt-2">Today's average</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Peak Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">6 PM</div>
                        <p className="text-xs text-gray-500 mt-2">52 members</p>
                    </CardContent>
                </Card>
            </div>

            {/* QR Scan Mode */}
            {scanMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="border-4 border-green-500">
                        <CardHeader>
                            <CardTitle className="text-green-600">🔍 QR Scanner Active</CardTitle>
                            <CardDescription>Simulated QR scanner - enter member ID to check in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Enter Member ID (1-8)..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleScanCheckIn(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button onClick={() => setScanMode(false)} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="checkin" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="checkin">Quick Check-in</TabsTrigger>
                    <TabsTrigger value="today">Today's Log ({totalCheckins})</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Quick Check-in */}
                <TabsContent value="checkin" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Member Check-in</CardTitle>
                            <CardDescription>Search and check in members manually</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Input
                                    placeholder="Search member by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {/* Member Search Results */}
                                {searchQuery && filteredMembers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredMembers.slice(0, 5).map(member => (
                                            <div
                                                key={member.id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setSearchQuery(member.name);
                                                }}
                                            >
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email} • {member.membershipType}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedMember && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-lg">{selectedMember.name}</p>
                                            <p className="text-sm text-gray-600">{selectedMember.membershipType}</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">
                                            {selectedMember.segment}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Engagement:</span>
                                            <span className="ml-1 font-medium">{selectedMember.engagementScore}/100</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Check-ins/week:</span>
                                            <span className="ml-1 font-medium">{selectedMember.checkInFrequency.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleQuickCheckIn}
                                disabled={!selectedMember}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                                size="lg"
                            >
                                <span className="mr-2">✅</span> Check In Member
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Inactive Members Alert */}
                    {inactiveMembers.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="text-orange-900 flex items-center gap-2">
                                    <span>⚠️</span> Inactive Members Alert
                                </CardTitle>
                                <CardDescription>Members who haven't checked in recently</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {inactiveMembers.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Last check-in: {Math.floor(Math.random() * 15 + 5)} days ago
                                                </p>
                                            </div>
                                            <Badge variant="destructive">High Risk</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Today's Log */}
                <TabsContent value="today" className="space-y-4">
                    {todayAttendance.length === 0 ? (
                        <EmptyState
                            icon="📋"
                            title="No check-ins yet"
                            description="Start checking in members to see them here"
                        />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Check-ins ({totalCheckins})</CardTitle>
                                <CardDescription>Real-time attendance log</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {todayAttendance.map(record => (
                                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex-1">
                                                <p className="font-medium">{record.memberName}</p>
                                                <p className="text-sm text-gray-500">
                                                    Check-in: {record.checkIn}
                                                    {record.checkOut && ` • Check-out: ${record.checkOut}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={record.checkOut ? 'secondary' : 'default'}>
                                                    {record.duration}
                                                </Badge>
                                                {!record.checkOut && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCheckOut(record.id, record.memberName)}
                                                    >
                                                        Check Out
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Analytics */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Peak Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Peak Hours</CardTitle>
                                <CardDescription>Hourly distribution of check-ins</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={peakHoursData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Weekly Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Trend</CardTitle>
                                <CardDescription>Check-ins by day of week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={weeklyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Visit Frequency */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Member Visit Frequency</CardTitle>
                                <CardDescription>Distribution of member activity levels</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {visitFrequency.map(freq => (
                                        <div key={freq.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{freq.name}</span>
                                                <span className="text-sm text-gray-600">{freq.count} members</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full"
                                                    style={{
                                                        width: `${(freq.count / 200) * 100}%`,
                                                        backgroundColor: freq.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
