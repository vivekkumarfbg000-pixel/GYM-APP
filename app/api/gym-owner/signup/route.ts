import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, age, gymName, gymPassword, authUserId } = body;

        // 1. Validate required fields
        if (!name || !email || !gymPassword) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and gym password are required' },
                { status: 400 }
            );
        }

        // 2. Check if email already exists
        const existingByEmail = await db.gymOwners.getByEmail(email);
        if (existingByEmail) {
            return NextResponse.json(
                { success: false, error: 'This email is already registered. Please login instead.' },
                { status: 400 }
            );
        }

        // 3. Check if gym password is already taken
        const existingByPassword = await db.gymOwners.getByGymPassword(gymPassword);
        if (existingByPassword) {
            return NextResponse.json(
                { success: false, error: 'This gym password is already taken. Please choose another one.' },
                { status: 400 }
            );
        }

        let finalAuthUserId = authUserId;

        // 4. Ensure Auth User Exists (Safety Check)
        // If frontend didn't pass authUserId (e.g. legacy call), create one now.
        // 4. Ensure Auth User Exists (Safety Check)
        // If frontend didn't pass authUserId (e.g. legacy call), create one now.
        if (!finalAuthUserId) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

            if (!supabaseUrl || !supabaseServiceKey) {
                console.error('❌ Signup Error: Missing Supabase environment variables');
                return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
            }

            const supabaseAdmin = createClient(
                supabaseUrl,
                supabaseServiceKey,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            // Create Auth User
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: 'tempPassword123!', // Temporary, verification usually needed but we skip for legacy compat
                email_confirm: true,
                user_metadata: { name, role: 'gym_owner', gym_name: gymName }
            });

            if (authError) {
                console.error('Failed to create auth user during gym owner signup:', authError);
                return NextResponse.json({ success: false, error: authError.message }, { status: 500 });
            }
            finalAuthUserId = authData.user.id;
        }

        // 5. Create gym owner in database
        let gymOwner = await db.gymOwners.create({
            id: finalAuthUserId, // Try to set ID to match Auth (Best Practice for 1:1)
            name,
            email,
            phone: phone || null,
            age: age || null,
            gym_name: gymName || null,
            gym_password: gymPassword,
            auth_user_id: finalAuthUserId
        });

        return NextResponse.json({
            success: true,
            data: gymOwner,
            message: 'Gym owner account created successfully!'
        });

    } catch (error: any) {
        console.error('Gym owner signup error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create gym owner account' },
            { status: 500 }
        );
    }
}
