'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { classUtilization } from '@/lib/mock-data';

export function UtilizationHeatmap() {
    const getColorClass = (value: number) => {
        if (value >= 90) return 'bg-green-600 text-white';
        if (value >= 75) return 'bg-green-400';
        if (value >= 60) return 'bg-yellow-400';
        if (value >= 40) return 'bg-orange-400';
        return 'bg-red-400';
    };

    const timeSlots = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '5PM', '6PM', '7PM', '8PM'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Class Utilization Heatmap</CardTitle>
                <CardDescription>Average attendance by day and time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        {/* Header */}
                        <div className="flex items-center mb-2">
                            <div className="w-16"></div>
                            {timeSlots.map(slot => (
                                <div key={slot} className="flex-1 min-w-[50px] text-center text-xs font-medium text-gray-600">
                                    {slot}
                                </div>
                            ))}
                        </div>

                        {/* Heatmap Grid */}
                        {classUtilization.map((row) => (
                            <div key={row.day} className="flex items-center mb-1">
                                <div className="w-16 text-sm font-medium text-gray-700">{row.day}</div>
                                {timeSlots.map(slot => {
                                    const value = (row as any)[slot];
                                    if (value === undefined) return (
                                        <div key={slot} className="flex-1 min-w-[50px] mx-0.5">
                                            <div className="h-10 rounded bg-gray-100"></div>
                                        </div>
                                    );
                                    return (
                                        <div key={slot} className="flex-1 min-w-[50px] mx-0.5">
                                            <div
                                                className={`h-10 rounded flex items-center justify-center text-xs font-semibold ${getColorClass(value)} transition-transform hover:scale-110 cursor-pointer`}
                                                title={`${row.day} ${slot}: ${value}% capacity`}
                                            >
                                                {value}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-400"></div>
                        <span className="text-gray-600">&lt;40%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-400"></div>
                        <span className="text-gray-600">40-59%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-400"></div>
                        <span className="text-gray-600">60-74%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-400"></div>
                        <span className="text-gray-600">75-89%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-600 text-white flex items-center justify-center">
                            <span className="text-white">✓</span>
                        </div>
                        <span className="text-gray-600">90%+</span>
                    </div>
                </div>

                {/* Insights */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 AI Insights:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Underutilized:</strong> Saturday/Sunday mornings (avg 45%)</li>
                        <li>• <strong>Peak Hours:</strong> Weekday 6-7 PM (95%+ capacity)</li>
                        <li>• <strong>Opportunity:</strong> Promote 9 AM classes with discount</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
