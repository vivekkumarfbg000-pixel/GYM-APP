import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/supabase';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Check environment configuration
        const envConfigured = !!(supabaseUrl && supabaseKey);
        const isPlaceholder = supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key';

        // Try to create client and check connection
        let connectionStatus = 'unknown';
        let authStatus = 'unknown';
        let gymOwnersCount = 0;
        let error = null;

        if (envConfigured && !isPlaceholder) {
            try {
                const supabase = createClient(supabaseUrl!, supabaseKey!);

                // Check auth status
                const { data: authData, error: authError } = await supabase.auth.getSession();
                authStatus = authError ? `error: ${authError.message}` : (authData.session ? 'authenticated' : 'not authenticated');

                // Try to fetch gym owners count
                const gymOwners = await db.gymOwners.getAll();
                gymOwnersCount = gymOwners?.length || 0;
                connectionStatus = 'connected';
            } catch (err: any) {
                connectionStatus = 'error';
                error = err.message;
            }
        } else {
            connectionStatus = isPlaceholder ? 'placeholder credentials' : 'not configured';
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: {
                configured: envConfigured,
                isPlaceholder,
                supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'not set',
                hasAnonKey: !!supabaseKey,
            },
            connection: {
                status: connectionStatus,
                error,
            },
            auth: {
                status: authStatus,
            },
            database: {
                gymOwnersCount,
            },
            recommendations: getRecommendations(envConfigured, isPlaceholder, connectionStatus, gymOwnersCount)
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            error: err.message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

function getRecommendations(configured: boolean, placeholder: boolean, status: string, count: number): string[] {
    const recommendations: string[] = [];

    if (!configured) {
        recommendations.push('⚠️ Environment variables not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }

    if (placeholder) {
        recommendations.push('⚠️ Using placeholder Supabase credentials. Update with your actual Supabase project credentials.');
    }

    if (status === 'error') {
        recommendations.push('❌ Database connection failed. Check your Supabase credentials and network connection.');
    }

    if (count === 0 && status === 'connected') {
        recommendations.push('ℹ️ No gym owners found in database. Try signing up a new account at /signup');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ Everything looks good! You have ' + count + ' gym owner(s) in the database.');
    }

    return recommendations;
}
