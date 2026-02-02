'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { revenueHistory } from '@/lib/mock-data';

export function RevenueChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly recurring revenue over last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueHistory}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            tickFormatter={(value) => value ? `₹${(value / 1000).toFixed(0)}K` : ''}
                        />
                        <Tooltip
                            formatter={(value: any) => typeof value === 'number' ? `₹${value.toLocaleString()}` : '₹0'}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Monthly Growth</p>
                        <p className="text-2xl font-bold text-green-600">+18%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Avg New Members</p>
                        <p className="text-2xl font-bold text-blue-600">11/mo</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Churn Trend</p>
                        <p className="text-2xl font-bold text-purple-600">↓ 58%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
