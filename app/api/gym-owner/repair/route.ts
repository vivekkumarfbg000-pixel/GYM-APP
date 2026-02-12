import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, gymPassword, newPassword } = body;

        if (!email || !gymPassword || !newPassword) {
            return NextResponse.json({ error: 'Email, Gym Password, and New Login Password are required' }, { status: 400 });
        }

        // 1. Verify Identity via DB
        const gymOwner = await db.gymOwners.getByEmail(email);

        if (!gymOwner) {
            return NextResponse.json({ error: 'Gym Owner not found' }, { status: 404 });
        }

        if (gymOwner.gym_password !== gymPassword) {
            return NextResponse.json({ error: 'Invalid Gym Password' }, { status: 403 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Try all possible env var names for the service key
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Repair Account Error: Missing Supabase credentials.');
            return NextResponse.json({ error: 'Server configuration error: Critical credentials missing.' }, { status: 500 });
        }

        // 2. Initialize Admin Client
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

        // 3. Check if Auth User already exists (Fetch up to 1000 to be safe)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingAuth = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingAuth) {
            // Check if IDs match
            if (existingAuth.id !== gymOwner.id) {
                // Critical ID mismatch. The Auth user exists but points to a different ID than the DB record.
                // We must update the DB record to match the Auth ID to fix the link.
                // But wait, the DB ID is likely the "source of truth" for relations.
                // It's safer to delete the mismatched Auth user and recreate it with the correct ID.
                console.log('ID Mismatch detected. Deleting mismatched Auth user...');
                await supabaseAdmin.auth.admin.deleteUser(existingAuth.id);
            } else {
                // Account exists and IDs match. Just update the password.
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    existingAuth.id,
                    { password: newPassword }
                );

                if (updateError) throw updateError;

                return NextResponse.json({
                    success: true,
                    message: 'Account verified and password updated successfully. You can now login.'
                });
            }
        }

        // 4. Create (or Recreate) Auth User with Correct ID
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            id: gymOwner.id, // FORCE the Auth ID to match the DB ID
            email: email,
            password: newPassword,
            email_confirm: true,
            user_metadata: {
                name: gymOwner.name,
                role: 'gym_owner',
                gym_name: gymOwner.gym_name
            }
        });

        if (createError) {
            return NextResponse.json({ error: `Failed to restore account: ${createError.message}` }, { status: 500 });
        }

        // 5. Ensure DB knows the Auth ID (redundant if we forced it, but good for safety)
        if (gymOwner.auth_user_id !== gymOwner.id) {
            await db.gymOwners.update(gymOwner.id, { auth_user_id: userData.user.id });
        }

        return NextResponse.json({
            success: true,
            message: 'Account repaired successfully! You can now login with your new password.',
            authId: userData.user.id
        });

    } catch (error: any) {
        console.error('Repair error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
