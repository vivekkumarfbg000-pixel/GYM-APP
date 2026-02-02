import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, paymentMethod, amount = 2999 } = body;

        if (!memberId) {
            return NextResponse.json({ error: 'Missing Member ID' }, { status: 400 });
        }

        // 1. Create Payment Record
        const { data: payment, error: payError } = await supabase
            .from('payments')
            .insert([{
                member_id: memberId,
                amount: amount,
                status: 'completed',
                description: 'Monthly Membership Subscription',
                payment_method: paymentMethod || 'card',
                transaction_id: `txn_${Date.now()}_mock`
            }])
            .select()
            .single();

        if (payError) throw payError;

        // 2. Update Member Status
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1); // +1 Month

        const { error: memberError } = await supabase
            .from('members')
            .update({
                membership_status: 'active',
                last_payment_date: new Date().toISOString(),
                next_payment_date: nextDate.toISOString()
            })
            .eq('id', memberId);

        if (memberError) {
            console.error('Failed to update member status', memberError);
            // Note: In real app, rollback payment or queue retry
        }

        return NextResponse.json({ success: true, data: payment, nextPayment: nextDate });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
