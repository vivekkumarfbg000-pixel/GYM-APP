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
        let authUpdateError = null;
        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                memberId,
                { password: finalPassword }
            );
            authUpdateError = error;
        } catch (e) {
            // unexpected error
        }

        // AUTO-REPAIR: If Admin says "User not found" (Auth user missing), create it!
        if (authUpdateError && authUpdateError.message.includes('User not found')) {
            console.log(`Auto-repairing missing Auth User for member ${memberId}`);

            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                id: memberId, // Force ID to match DB
                email: member.email,
                password: finalPassword,
                email_confirm: true,
                user_metadata: {
                    name: member.name,
                    role: 'member',
                    gym_owner_id: gymOwnerId
                }
            });

            if (createError) {
                console.error('Failed to auto-repair auth user:', createError);
                return NextResponse.json({
                    success: false,
                    error: `Critical Error: Account is corrupted and auto-repair failed. ${createError.message}`
                }, { status: 500 });
            }
        } else if (authUpdateError) {
            // Other errors (e.g. rate limit, validation)
            console.error('Auth update error:', authUpdateError);
            return NextResponse.json({
                success: false,
                error: `Failed to update auth user: ${authUpdateError.message}`
            }, { status: 500 });
        }

        // 6. Update member password in members table (for reference/display if needed)
        const { error: dbError } = await supabaseAdmin
            .from('members')
            .update({ password: finalPassword })
            .eq('id', memberId);

        if (dbError) {
            console.error('DB update error:', dbError);
        }

        return NextResponse.json({
            success: true,
            newPassword: finalPassword,
            message: `Password reset successful for ${member.name}. Login restored.`
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
