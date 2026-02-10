import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
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

        // 3. Check if user with this email already exists
        const existing = await db.members.search(email);

        if (existing && existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Email already registered'
            }, { status: 400 });
        }

        // 4. Hash password for secure storage
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. Create new member linked to gym owner
        const data = await db.members.create({
            name,
            email,
            phone: phone || null,
            age: age || null,
            gym_owner_id: gymOwner.id,
            role: 'member',
            status: 'Pending', // Visual status
            approved: false,   // Logic status - awaiting gym owner approval
            join_date: new Date().toISOString(),
            membership_type: 'Pending', // Will be set by gym owner upon approval
            segment: 'New', // New members start in 'New' segment
            password: hashedPassword // Securely hashed password
        } as any); // Using 'as any' because password is not in DbMember type definition

        return NextResponse.json({
            success: true,
            data,
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
