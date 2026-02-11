import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, phone, age, gymPassword } = body;

        // 1. Validate input
        if (!email || !password || !name || !gymPassword) {
            return NextResponse.json({
                success: false,
                error: 'Name, email, password, and gym password are required'
            }, { status: 400 });
        }

        // 2. Verify gym password and get gym owner
        const gymOwner = await db.gymOwners.getByGymPassword(gymPassword);

        if (!gymOwner) {
            return NextResponse.json({
                success: false,
                error: 'Invalid gym password. Please check with your gym owner.'
            }, { status: 400 });
        }

        // 3. Create User in Supabase Auth (This enables Login)
        // We use signUp which works with the public anon key.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'member'
                }
            }
        });

        if (authError) {
            console.error('Supabase Auth Error:', authError);
            return NextResponse.json({
                success: false,
                error: authError.message
            }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({
                success: false,
                error: 'Failed to create user account'
            }, { status: 500 });
        }

        // 4. Create Member Profile in public.members table
        // We link it using the ID from Auth
        const memberData = {
            id: authData.user.id, // CRITICAL: Link Auth ID to Member ID
            name,
            email,
            phone: phone || null,
            age: age || null,
            gym_owner_id: gymOwner.id,
            role: 'member',
            status: 'Pending',
            approved: false,
            join_date: new Date().toISOString(),
            membership_type: 'Pending',
            segment: 'New',
            // We still store hashed password for legacy/backup, though Auth handles login now
            password: await bcrypt.hash(password, 10)
        };

        // Manual insert used instead of db.members.create to ensure ID is set explicitly
        const { data: profile, error: profileError } = await supabase
            .from('members')
            .insert([memberData])
            .select()
            .single();

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            // Optional: Cleanup auth user if profile fails (requires admin key, skipping for now)
            return NextResponse.json({
                success: false,
                error: 'Account created but profile failed. Please contact support.'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: profile,
            message: `Successfully registered! Your request has been sent to ${gymOwner.gym_name || 'your gym'} for approval.`
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Registration failed'
        }, { status: 500 });
    }
}
