import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, paymentMethod, amount = 2999, transactionId } = body;

        if (!memberId) {
            return NextResponse.json({ error: 'Missing Member ID' }, { status: 400 });
        }

        const isManual = paymentMethod === 'upi_manual';
        const status = isManual ? 'pending' : 'completed';
        const txnId = isManual ? transactionId : `txn_${Date.now()}_mock`;

        // 1. Create Payment Record
        const { data: payment, error: payError } = await supabase
            .from('payments')
            .insert([{
                member_id: memberId,
                amount: amount,
                status: status,
                description: 'Monthly Membership Subscription',
                payment_method: paymentMethod || 'card',
                transaction_id: txnId
            }])
            .select()
            .single();

        if (payError) throw payError;

        // 2. Update Member Status (ONLY if completed)
        let nextDate = null;
        let memberError = null;

        if (!isManual) {
            nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1); // +1 Month

            const { error } = await supabase
                .from('members')
                .update({
                    membership_status: 'active',
                    last_payment_date: new Date().toISOString(),
                    next_payment_date: nextDate.toISOString()
                })
                .eq('id', memberId);

            memberError = error;
        }

        if (memberError) {
            console.error('Failed to update member status', memberError);
            // Note: In real app, rollback payment or queue retry
        }

        return NextResponse.json({ success: true, data: payment, nextPayment: nextDate });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
