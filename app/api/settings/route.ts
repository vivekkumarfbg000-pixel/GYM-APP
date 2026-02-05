import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
    try {
        let settings = await db.settings.get();

        // If no settings exist yet, return a safe default object (frontend should handle this)
        if (!settings) {
            settings = {
                gym_name: 'My Gym',
                notif_churn_alerts: true
            };
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const updated = await db.settings.update(body);
        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
