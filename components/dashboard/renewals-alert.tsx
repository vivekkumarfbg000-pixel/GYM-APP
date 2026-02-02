'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { upcomingRenewals } from '@/lib/mock-data';

export function RenewalsAlert() {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'secondary';
        }
    };

    const getRiskBgColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-red-50 border-red-200';
            case 'medium': return 'bg-yellow-50 border-yellow-200';
            case 'low': return 'bg-green-50 border-green-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const urgentRenewals = upcomingRenewals.filter(r => r.expiresIn <= 7);
    const upcomingCount = upcomingRenewals.filter(r => r.expiresIn <= 30).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Upcoming Renewals</CardTitle>
                        <CardDescription>{upcomingCount} memberships expiring in 30 days</CardDescription>
                    </div>
                    <Badge className="text-lg px-3 py-1" variant="outline">
                        {urgentRenewals.length} Urgent
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {upcomingRenewals.slice(0, 5).map((renewal) => (
                        <div
                            key={renewal.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${getRiskBgColor(renewal.riskLevel)}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900">{renewal.name}</p>
                                    <Badge variant={getRiskColor(renewal.riskLevel)} className="text-xs">
                                        {renewal.riskLevel}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{renewal.membershipType}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Expires in <span className="font-semibold">{renewal.expiresIn} days</span> • ₹{renewal.value.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                    Remind
                                </Button>
                                <Button size="sm" className="text-xs">
                                    Offer
                                </Button>
                            </div>
                        </div>
                    ))}
                    {upcomingRenewals.length > 5 && (
                        <Button variant="outline" className="w-full">
                            View All {upcomingRenewals.length} Renewals
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
