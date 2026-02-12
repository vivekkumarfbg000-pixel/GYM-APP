import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, newPassword, gymOwnerId } = body;

        // 1. Validate input
        if (!memberId || !gymOwnerId) {
            return NextResponse.json({
                success: false,
                error: 'Member ID and Gym Owner ID are required'
            }, { status: 400 });
        }

        // 2. Get member and verify they belong to this gym owner
        // Use getById instead of getAll for performance
        const member = await db.members.getById(memberId);

        if (!member) {
            return NextResponse.json({
                success: false,
                error: 'Member not found'
            }, { status: 404 });
        }

        // 3. Verify gym owner owns this member
        if (member.gym_owner_id !== gymOwnerId) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized: You can only reset passwords for your own members'
            }, { status: 403 });
        }

        // 4. Generate password if not provided
        const finalPassword = newPassword || generateSecurePassword();

        // 5. Update Supabase Auth User (Critical for login to work)
        // We need the service role key to update other users' passwords
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Try to update auth user
        // Note: member.id in members table SHOULD match auth.users.id
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            memberId,
            { password: finalPassword }
        );

        if (authError) {
            console.error('Auth update error:', authError);
            return NextResponse.json({
                success: false,
                error: `Failed to update auth user: ${authError.message}`
            }, { status: 500 });
        }

        // 6. Update member password in members table (for reference/display if needed)
        // Use the admin client here too if RLS blocks the anon client
        const { error: dbError } = await supabaseAdmin
            .from('members')
            .update({ password: finalPassword })
            .eq('id', memberId);

        if (dbError) {
            console.error('DB update error:', dbError);
            // Verify if it's just RLS or something else, but we continue since auth is updated
        }

        return NextResponse.json({
            success: true,
            newPassword: finalPassword,
            message: `Password reset successful for ${member.name}`
        });

    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to reset password'
        }, { status: 500 });
    }
}

// Generate a secure random password
function generateSecurePassword(length: number = 10): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    const randomBytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }

    return password;
}
