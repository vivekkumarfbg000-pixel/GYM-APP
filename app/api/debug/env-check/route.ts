import { NextResponse } from 'next/server';

export async function GET() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return NextResponse.json({
        envState: {
            NEXT_PUBLIC_SUPABASE_URL: url ? 'Defined' : 'Missing',
            SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey ? `Defined (${serviceRoleKey.substring(0, 5)}...)` : 'Missing',
            SUPABASE_SERVICE_KEY: serviceKey ? `Defined (${serviceKey.substring(0, 5)}...)` : 'Missing',
        },
        nodeEnv: process.env.NODE_ENV
    });
}
