import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all members or search/filter
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const segment = searchParams.get('segment');

        let query = supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply segment filter
        if (segment && segment !== 'all') {
            query = query.eq('segment', segment);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching members:', error);
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
        console.error('Unexpected error in GET /api/members:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.membership_type) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and membership type are required' },
                { status: 400 }
            );
        }

        // Prepare member data
        const memberData = {
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            membership_type: body.membership_type,
            membership_end_date: body.membership_end_date || null,
            segment: body.segment || 'Regular',
            engagement_score: body.engagement_score || 50,
            churn_risk: body.churn_risk || 30,
            check_in_frequency: body.check_in_frequency || 0,
            total_revenue: body.total_revenue || 0,
            pt_sessions: body.pt_sessions || 0
        };

        const { data, error } = await supabase
            .from('members')
            .insert([memberData])
            .select()
            .single();

        if (error) {
            console.error('Error creating member:', error);

            // Handle unique constraint violations
            if (error.code === '23505') {
                return NextResponse.json(
                    { success: false, error: 'A member with this email already exists' },
                    { status: 409 }
                );
            }

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
        console.error('Unexpected error in POST /api/members:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Update member
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Member ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating member:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error: any) {
        console.error('Unexpected error in PATCH /api/members:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete member
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Member ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting member:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error: any) {
        console.error('Unexpected error in DELETE /api/members:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
