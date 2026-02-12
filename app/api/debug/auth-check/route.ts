import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    try {
        // 1. Check Public Member Table
        const members = await db.members.getAll(); // Inefficient but fine for debug
        // Case insensitive search
        const member = members.find(m => m.email.toLowerCase() === email.toLowerCase());

        // 2. Check Supabase Auth (admin)
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

        let authUser = null;
        if (!authError && users) {
            authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        }

        const results = {
            email,
            database: {
                exists: !!member,
                id: member?.id || null,
                name: member?.name || null,
                gymOwnerId: member?.gym_owner_id || null
            },
            auth: {
                exists: !!authUser,
                id: authUser?.id || null,
                emailVerified: authUser?.email_confirmed_at || null,
                lastSignIn: authUser?.last_sign_in_at || null
            },
            status: {
                idsMatch: member?.id === authUser?.id,
                canLogin: !!authUser && !!member && (member.id === authUser.id)
            },
            env: {
                // Check if keys are loaded (don't reveal values)
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        };

        return NextResponse.json(results);

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
