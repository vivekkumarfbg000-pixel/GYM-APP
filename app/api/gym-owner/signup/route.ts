import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

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

        // 4. Create gym owner in database
        const gymOwner = await db.gymOwners.create({
            name,
            email,
            phone: phone || null,
            age: age || null,
            gym_name: gymName || null,
            gym_password: gymPassword,
            auth_user_id: authUserId || null
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
