import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, action } = body;

        if (!memberId || !action) {
            return NextResponse.json({ success: false, error: 'Missing logic' }, { status: 400 });
        }

        let updates: any = {};
        if (action === 'approve') {
            updates = { approved: true, status: 'Active' };
        } else if (action === 'reject') {
            updates = { approved: false, status: 'Rejected' };
        }

        const { data, error } = await supabase
            .from('members')
            .update(updates)
            .eq('id', memberId)
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
