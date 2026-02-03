import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - List all equipment
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new equipment
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const { data, error } = await supabase
            .from('equipment')
            .insert([{
                name: body.name,
                serial_number: body.serial_number,
                status: body.status || 'operational',
                last_service: body.last_service || new Date().toISOString().split('T')[0],
                notes: body.notes
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update status or details
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { data, error } = await supabase
            .from('equipment')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
