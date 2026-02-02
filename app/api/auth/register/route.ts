import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, phone } = body;

        // 1. Validate input
        if (!email || !password || !name) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        // 2. Check if user exists
        const { data: existing } = await supabase
            .from('members')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
        }

        // 3. Create new member (Approved = false by default)
        const { data, error } = await supabase
            .from('members')
            .insert([
                {
                    name,
                    email,
                    password, // In prod, hash this!
                    phone,
                    role: 'member',
                    status: 'Pending', // Visual status
                    approved: false,   // Logic status
                    join_date: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
