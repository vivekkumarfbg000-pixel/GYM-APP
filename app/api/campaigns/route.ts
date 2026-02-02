import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all campaigns or filter by status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply status filter
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching campaigns:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error: any) {
        console.error('Unexpected error in GET /api/campaigns:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.segment || !body.message_template) {
            return NextResponse.json(
                { success: false, error: 'Name, segment, and message template are required' },
                { status: 400 }
            );
        }

        // Prepare campaign data
        const campaignData = {
            name: body.name,
            segment: body.segment,
            message_template: body.message_template,
            status: body.status || 'draft',
            response_rate: body.response_rate || 0,
            revenue: body.revenue || 0,
            sent_date: body.sent_date || null
        };

        const { data, error } = await supabase
            .from('campaigns')
            .insert([campaignData])
            .select()
            .single();

        if (error) {
            console.error('Error creating campaign:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        }, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error in POST /api/campaigns:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update campaign (status, metrics, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        // If launching (status -> active), set sent_date
        if (updates.status === 'active' && !updates.sent_date) {
            updates.sent_date = new Date().toISOString().split('T')[0];
        }

        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating campaign:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error: any) {
        console.error('Unexpected error in PATCH /api/campaigns:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete campaign
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting campaign:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Campaign deleted successfully'
        });
    } catch (error: any) {
        console.error('Unexpected error in DELETE /api/campaigns:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
