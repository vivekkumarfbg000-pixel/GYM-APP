import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, gymPassword } = body;

        if (!email || !gymPassword) {
            return NextResponse.json({ error: 'Email and Gym Password required' }, { status: 400 });
        }

        // 1. Check DB for Gym Owner
        const gymOwner = await db.gymOwners.getByEmail(email);

        if (!gymOwner) {
            return NextResponse.json({
                exists: false,
                message: 'No Gym Owner found with this email'
            }, { status: 404 });
        }

        // 2. Verify Gym Password match
        // Note: In a real app we might hash this, but based on signup it seems to be stored plain text or check implementation
        // app/api/gym-owner/signup/route.ts stores it directly.
        if (gymOwner.gym_password !== gymPassword) {
            return NextResponse.json({
                exists: true,
                verified: false,
                message: 'Gym Password does not match'
            }, { status: 403 });
        }

        // 3. Check Supabase Auth
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

        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

        return NextResponse.json({
            exists: true,
            verified: true,
            gymOwner: {
                id: gymOwner.id,
                name: gymOwner.name,
                gymName: gymOwner.gym_name
            },
            auth: {
                exists: !!authUser,
                id: authUser?.id || null,
                matchesDbId: authUser ? authUser.id === gymOwner.id : false
            },
            status: !!authUser ? 'Healthy' : 'Broken (Missing Auth User)',
            canRepair: !authUser // Can only repair if Auth is missing
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
