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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/error-state';

// Types
interface Member {
    id: string;
    name: string;
    email: string;
    membershipType?: string;
    segment?: string;
    engagementScore?: number;
    checkInFrequency?: number;
}

interface AttendanceRecord {
    id: string;
    member_id: string;
    check_in: string;
    check_out?: string;
    duration?: number;
    members?: {
        name: string;
        email: string;
        segment: string;
    };
}

export default function AttendancePage() {
    const [loading, setLoading] = useState(true);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
    const [scanMode, setScanMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Derived metrics
    const currentCapacity = todayAttendance.filter(a => !a.check_out).length;
    const maxCapacity = 250; // Could be a setting
    const capacityPercent = Math.round((currentCapacity / maxCapacity) * 100);
    const totalCheckins = todayAttendance.length;

    // Load initial data
    useEffect(() => {
        loadTodayAttendance();
    }, []);

    // Search members when query changes
    useEffect(() => {
        const searchMembers = async () => {
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                const res = await fetch(`/api/members?query=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.data);
                }
            } catch (error) {
                console.error('Error searching members:', error);
            }
        };

        const timeoutId = setTimeout(searchMembers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const loadTodayAttendance = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/attendance');
            const data = await res.json();

            if (data.success) {
                setTodayAttendance(data.data);
            } else {
                toast.error('Failed to load attendance');
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            toast.error('Network error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCheckIn = async () => {
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }

        try {
            setProcessingId('checkin');
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: selectedMember.id })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`✅ ${selectedMember.name} checked in!`);
                // Refresh list
                loadTodayAttendance();
                // Reset form
                setSelectedMember(null);
                setSearchQuery('');
                setSearchResults([]);
            } else {
                toast.error(data.error || 'Check-in failed');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            toast.error('An error occurred during check-in');
        } finally {
            setProcessingId(null);
        }
    };

    const handleScanCheckIn = async (memberId: string) => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: memberId })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`✅ Check-in successful!`);
                loadTodayAttendance();
                setScanMode(false);
            } else {
                toast.error(data.error || 'Check-in failed');
            }
        } catch (error) {
            console.error('Scan check-in error:', error);
            toast.error('An error occurred during scan');
        }
    };

    const handleCheckOut = async (recordId: string, memberName: string) => {
        try {
            setProcessingId(recordId);
            const res = await fetch('/api/attendance', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: recordId })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`👋 ${memberName} checked out!`);
                // Update local state to avoid full reload flickers
                setTodayAttendance(prev => prev.map(record =>
                    record.id === recordId
                        ? { ...record, check_out: new Date().toISOString(), duration: data.data.duration }
                        : record
                ));
            } else {
                toast.error(data.error || 'Check-out failed');
            }
        } catch (error) {
            console.error('Check-out error:', error);
            toast.error('An error occurred during check-out');
        } finally {
            setProcessingId(null);
        }
    };

    // Calculate analytics from today's data (simplified for now)
    const activeCheckins = todayAttendance.filter(a => !a.check_out);

    // Mock data for charts (until we have historical API)
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
                        <p className="text-xs text-gray-500 mt-2">Live Count</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Now</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{activeCheckins.length}</div>
                        <p className="text-xs text-gray-500 mt-2">Members working out</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Peak Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">6 PM</div>
                        <p className="text-xs text-gray-500 mt-2">Historical Avg</p>
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
                                    placeholder="Enter Member ID (UUID)..."
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
                                {searchQuery && searchResults.length > 0 && !selectedMember && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map(member => (
                                            <div
                                                key={member.id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setSearchQuery(member.name);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
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
                                            <p className="text-sm text-gray-600">{selectedMember.email}</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">
                                            {selectedMember.segment || 'Member'}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleQuickCheckIn}
                                disabled={!selectedMember || processingId === 'checkin'}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                                size="lg"
                            >
                                {processingId === 'checkin' ? 'Checking In...' : (
                                    <>
                                        <span className="mr-2">✅</span> Check In Member
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
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
                                                <p className="font-medium">{record.members?.name || 'Unknown Member'}</p>
                                                <p className="text-sm text-gray-500">
                                                    Check-in: {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {record.check_out && ` • Check-out: ${new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={record.check_out ? 'secondary' : 'default'}>
                                                    {record.check_out ? `${record.duration}m` : 'Active'}
                                                </Badge>
                                                {!record.check_out && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCheckOut(record.id, record.members?.name || 'Member')}
                                                        disabled={processingId === record.id}
                                                    >
                                                        {processingId === record.id ? '...' : 'Check Out'}
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
                                <CardTitle>Peak Hours (Mock Data)</CardTitle>
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
                                <CardTitle>Weekly Trend (Mock Data)</CardTitle>
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
                                <CardTitle>Member Visit Frequency (Mock Data)</CardTitle>
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
