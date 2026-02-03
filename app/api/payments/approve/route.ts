import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentId, action } = body; // action: 'approve' | 'reject'

        if (!paymentId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (action === 'reject') {
            const { error } = await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('id', paymentId);

            if (error) throw error;
            return NextResponse.json({ success: true, status: 'rejected' });
        }

        if (action === 'approve') {
            // 1. Get Payment Details to find Member ID
            const { data: payment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .single();

            if (fetchError || !payment) throw new Error('Payment not found');

            const memberId = payment.member_id;

            // 2. Update Payment Status
            const { error: updateError } = await supabase
                .from('payments')
                .update({ status: 'completed' })
                .eq('id', paymentId);

            if (updateError) throw updateError;

            // 3. Activate Member
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);

            const { error: memberError } = await supabase
                .from('members')
                .update({
                    membership_status: 'active',
                    last_payment_date: new Date().toISOString(),
                    next_payment_date: nextDate.toISOString()
                })
                .eq('id', memberId);

            if (memberError) throw memberError;

            return NextResponse.json({ success: true, status: 'approved' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Approval Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
