'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/error-state';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        setLoading(true);
        try {
            // Fetch payments directly via Supabase client or a dedicated API route if needed. 
            // For now, assuming we might need an endpoint or use client-side supabase.
            // Let's use a GET endpoint for cleaner architecture if we had one, 
            // but for speed, I'll assume we can just query existing payments table if we had a GET route.
            // Since we don't have a GET /payments endpoint yet, let's assume we create one or query supabase directly.
            // Actually, best to fetch via existing /api/payments if available, or just mock it, 
            // BUT since this is "Execution", I should just implement the fetch logic here.

            // NOTE: I am using the response from a hypothetical GET /api/payments/pending
            // I will create this route next or assume it works.
            // Let's create a simple client-side fetch wrapper for now assuming we create the route.

            const res = await fetch('/api/payments/pending');
            const data = await res.json();

            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, action })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(action === 'approve' ? 'Payment Approved!' : 'Payment Rejected');
                loadPayments();
            } else {
                toast.error('Action failed');
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment Approvals</h1>
                    <p className="text-gray-500 mt-1">Verify manual UPI transactions.</p>
                </div>
                <Button variant="outline" onClick={loadPayments} className="gap-2">
                    <RefreshCw size={16} /> Refresh
                </Button>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading payments...</div>
                ) : payments.length === 0 ? (
                    <EmptyState
                        icon="ok"
                        title="All Caught Up!"
                        description="No pending payments to review."
                    />
                ) : (
                    payments.map((p) => (
                        <Card key={p.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">₹{p.amount}</h3>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                Pending Verification
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-mono text-gray-700 font-medium">UTR: {p.transaction_id}</span>
                                            <span className="mx-2">•</span>
                                            {p.members?.name || 'Unknown Member'} ({p.members?.email})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {format(new Date(p.created_at), 'MMM d, yyyy h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleAction(p.id, 'approve')}
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(p.id, 'reject')}
                                        variant="outline"
                                        className="text-red-500 border-red-200 hover:bg-red-50 gap-2"
                                    >
                                        <XCircle size={18} /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
