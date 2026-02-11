'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ReportGeneratorProps {
    gymOwnerId: string;
}

export function ReportGenerator({ gymOwnerId }: ReportGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'attendance' | 'revenue' | 'members'>('attendance');

    const generateReport = async () => {
        setLoading(true);
        try {
            // Get date range (last 30 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const res = await fetch(
                `/api/reports/generate?gymOwnerId=${gymOwnerId}&type=${reportType}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );
            const data = await res.json();

            if (data.success) {
                // Generate PDF using browser's print functionality
                generatePDF(data.data);
                toast.success('Report generated successfully!');
            } else {
                throw new Error('Failed to generate report');
            }
        } catch (error) {
            console.error('Report generation failed:', error);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (reportData: any) => {
        // Create a new window for PDF generation
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to download reports');
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportData.title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #333;
                    }
                    h1 {
                        color: #4f46e5;
                        border-bottom: 3px solid #4f46e5;
                        padding-bottom: 10px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .summary {
                        background: #f3f4f6;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    .summary-item {
                        background: white;
                        padding: 15px;
                        border-radius: 5px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .summary-item h3 {
                        margin: 0 0 5px 0;
                        font-size: 14px;
                        color: #6b7280;
                    }
                    .summary-item p {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                        color: #4f46e5;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #e5e7eb;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background: #4f46e5;
                        color: white;
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background: #f9fafb;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #9ca3af;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>GymFlow AI - ${reportData.title}</h1>
                    <p>Date Range: ${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()}</p>
                </div>
                
                <div class="summary">
                    ${Object.entries(reportData.summary).map(([key, value]) => `
                        <div class="summary-item">
                            <h3>${key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</h3>
                            <p>${value}</p>
                        </div>
                    `).join('')}
                </div>

                ${reportData.details ? `
                    <h2>Details</h2>
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(reportData.details[0] || {}).map(key => `<th>${key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.details.slice(0, 50).map((row: any) => `
                                <tr>
                                    ${Object.values(row).map((val: any) => `
                                        <td>${typeof val === 'string' && val.includes('T') ? new Date(val).toLocaleString() : val || '-'}</td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString()} | GymFlow AI © 2026</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Trigger print dialog after content loads
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Generate Reports
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant={reportType === 'attendance' ? 'default' : 'outline'}
                        onClick={() => setReportType('attendance')}
                        className="text-sm"
                    >
                        <Calendar size={16} className="mr-2" />
                        Attendance
                    </Button>
                    <Button
                        variant={reportType === 'revenue' ? 'default' : 'outline'}
                        onClick={() => setReportType('revenue')}
                        className="text-sm"
                    >
                        💰 Revenue
                    </Button>
                    <Button
                        variant={reportType === 'members' ? 'default' : 'outline'}
                        onClick={() => setReportType('members')}
                        className="text-sm"
                    >
                        👥 Members
                    </Button>
                </div>

                <Button
                    onClick={generateReport}
                    disabled={loading}
                    className="w-full"
                >
                    <Download size={18} className="mr-2" />
                    {loading ? 'Generating...' : `Generate ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report (PDF)`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                    Report will cover the last 30 days
                </p>
            </CardContent>
        </Card>
    );
}
