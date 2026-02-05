import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
    try {
        const leads = await db.leads.getAll();
        return NextResponse.json(leads || []);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, source } = body;

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const newLead = await db.leads.create({
            name, phone, email, source,
            stage: 'New Lead',
            score: 50, // Default starting score
            value: 0
        });

        return NextResponse.json(newLead);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
