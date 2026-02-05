import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
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
        const members = await db.members.getAll();
        const member = members.find(m => m.id === memberId);

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

        // 5. Update member password
        await db.members.update(memberId, {
            password: finalPassword
        } as any);

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
