'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMonthlyReport } from '@/lib/reports';
import { FileText, Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
    const [generating, setGenerating] = useState(false);

    // Mock data for report generation (would be real data from API/Supabase)
    const reportData = {
        revenue: 450000,
        activeMembers: 342,
        newMembers: 45,
        attendanceRate: 78,
        recentTransactions: [
            { date: '2025-05-15', member: 'Arjun Singh', type: 'Annual Membership', amount: 15000 },
            { date: '2025-05-14', member: 'Priya Patel', type: 'PT Package', amount: 5000 },
            { date: '2025-05-13', member: 'Rahul Kumar', type: 'Monthly Membership', amount: 2000 },
        ]
    };

    const handleDownloadReport = async (period: string) => {
        setGenerating(true);
        try {
            await generateMonthlyReport(reportData, period);
            toast.success("Report generated successfully!");
        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports & Export</h1>
                <p className="text-gray-500 mt-2">Generate detailed PDF reports for your gym's performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Monthly Performance Report */}
                <Card className="hover:shadow-lg transition-shadow border-blue-100">
                    <CardHeader>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="text-blue-600 h-6 w-6" />
                        </div>
                        <CardTitle>Monthly Performance</CardTitle>
                        <CardDescription>
                            Comprehensive breakdown of revenue, new signups, and churn for the current month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleDownloadReport('May 2025')}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : (
                                <><Download className="mr-2 h-4 w-4" /> Download Report</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Member Attendance Report */}
                <Card className="hover:shadow-lg transition-shadow border-purple-100">
                    <CardHeader>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <Users className="text-purple-600 h-6 w-6" />
                        </div>
                        <CardTitle>Member Attendance</CardTitle>
                        <CardDescription>
                            Detailed log of member check-ins, peak hours, and frequency analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => handleDownloadReport('Attendance - May 2025')}
                            disabled={generating}
                        >
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Financial Statement */}
                <Card className="hover:shadow-lg transition-shadow border-green-100">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="text-green-600 h-6 w-6" />
                        </div>
                        <CardTitle>Financial Statement</CardTitle>
                        <CardDescription>
                            Tax-ready statement of all revenue sources, expenses, and net profit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleDownloadReport('Financials - Q2 2025')}
                            disabled={generating}
                        >
                            <Download className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    Archive
                </h3>
                <div className="space-y-3">
                    {['April 2025', 'March 2025', 'February 2025'].map((month) => (
                        <div key={month} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{month} Report</span>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                Download
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
