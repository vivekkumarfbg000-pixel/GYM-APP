import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET: Fetch active packages
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get('gymId');

    try {
        const packages = await db.pt.getPackages(gymId || undefined);
        return NextResponse.json({ success: true, data: packages });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
