import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        // 1. Find member by email
        const members = await db.members.search(email);
        const user = members.find(m => m.email === email);

        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Verify hashed password using bcrypt
        const storedPassword = (user as any).password;
        if (!storedPassword) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, storedPassword);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Verify member is linked to a gym owner
        if (!user.gym_owner_id) {
            return NextResponse.json({
                success: false,
                error: 'Account not connected to a gym. Please contact support.'
            }, { status: 403 });
        }

        // 4. Check if account is active
        if (user.is_active === false) {
            return NextResponse.json({
                success: false,
                error: 'Your account has been deactivated. Please contact your gym owner.'
            }, { status: 403 });
        }

        // 5. Check if account is approved by gym owner
        if (!user.approved) {
            return NextResponse.json({
                success: false,
                error: 'Account pending approval. Please contact the gym owner.'
            }, { status: 403 });
        }

        // 6. Get gym owner information
        const gymOwner = await db.gymOwners.getById(user.gym_owner_id);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role || 'member',
                email: user.email,
                gym_owner_id: user.gym_owner_id,
                gym_name: gymOwner?.gym_name || 'Your Gym'
            },
            redirect: '/mobile/dashboard'
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
    }
}
