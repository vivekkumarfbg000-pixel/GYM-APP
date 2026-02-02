import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role } = body; // Role is optional (if not sent, check both)

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        // 1. Find user
        const { data: user, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Check Password (Simple check for MVP)
        // In prod, use bcrypt.compare(password, user.password)
        if (user.password !== password) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Gym Owner Login Logic
        if (role === 'admin' || user.role === 'admin') {
            if (user.role !== 'admin') {
                return NextResponse.json({ success: false, error: 'Unauthorized: Not an admin' }, { status: 403 });
            }
            return NextResponse.json({
                success: true,
                user: { id: user.id, name: user.name, role: 'admin', email: user.email },
                redirect: '/dashboard'
            });
        }

        // 4. Member Login Logic
        // CRITICAL: Check Approval
        if (!user.approved) {
            return NextResponse.json({
                success: false,
                error: 'Account pending approval. Please contact the gym owner.'
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, role: 'member', email: user.email },
            redirect: '/mobile/dashboard'
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
