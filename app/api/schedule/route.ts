import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch classes (defaults to today + future)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date'); // Optional date filter YYYY-MM-DD

        let query = supabase
            .from('classes')
            .select('*')
            .order('start_time', { ascending: true });

        if (date) {
            // Filter for specific day (00:00 to 23:59)
            const start = `${date}T00:00:00`;
            const end = `${date}T23:59:59`;
            query = query.gte('start_time', start).lte('start_time', end);
        } else {
            // Default: Show upcoming from now
            // query = query.gte('start_time', new Date().toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new class
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.start_time || !body.trainer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('classes')
            .insert([{
                name: body.name,
                trainer: body.trainer,
                start_time: body.start_time,
                duration: body.duration || 60,
                capacity: body.capacity || 20,
                attendees: 0 // Start empty
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove class
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
