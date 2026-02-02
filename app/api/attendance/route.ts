import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch attendance records (today by default, or filter by date)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const memberId = searchParams.get('member_id');

        let query = supabase
            .from('attendance')
            .select(`
                *,
                members (
                    id,
                    name,
                    email,
                    segment
                )
            `)
            .order('check_in', { ascending: false });

        // Filter by date (default to today)
        if (date) {
            query = query.gte('check_in', `${date}T00:00:00`)
                .lte('check_in', `${date}T23:59:59`);
        } else {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            query = query.gte('check_in', `${today}T00:00:00`)
                .lte('check_in', `${today}T23:59:59`);
        }

        // Filter by member
        if (memberId) {
            query = query.eq('member_id', memberId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching attendance:', error);
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
        console.error('Unexpected error in GET /api/attendance:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Check-in member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.member_id) {
            return NextResponse.json(
                { success: false, error: 'Member ID is required' },
                { status: 400 }
            );
        }

        // Check if member exists
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, name')
            .eq('id', body.member_id)
            .single();

        if (memberError || !member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        // Check if member already checked in today (and not checked out)
        const today = new Date().toISOString().split('T')[0];
        const { data: existingCheckIn } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', body.member_id)
            .gte('check_in', `${today}T00:00:00`)
            .is('check_out', null)
            .single();

        if (existingCheckIn) {
            return NextResponse.json(
                { success: false, error: 'Member is already checked in' },
                { status: 409 }
            );
        }

        // Create check-in record
        const attendanceData = {
            member_id: body.member_id,
            check_in: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('attendance')
            .insert([attendanceData])
            .select(`
                *,
                members (
                    id,
                    name,
                    email,
                    segment
                )
            `)
            .single();

        if (error) {
            console.error('Error creating check-in:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Update member's last_check_in and check_in_frequency
        await supabase
            .from('members')
            .update({ last_check_in: new Date().toISOString() })
            .eq('id', body.member_id);

        return NextResponse.json({
            success: true,
            data: data
        }, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error in POST /api/attendance:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Check-out member
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Attendance record ID is required' },
                { status: 400 }
            );
        }

        // Get the check-in record
        const { data: record, error: fetchError } = await supabase
            .from('attendance')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !record) {
            return NextResponse.json(
                { success: false, error: 'Attendance record not found' },
                { status: 404 }
            );
        }

        if (record.check_out) {
            return NextResponse.json(
                { success: false, error: 'Member already checked out' },
                { status: 409 }
            );
        }

        // Calculate duration in minutes
        const checkInTime = new Date(record.check_in);
        const checkOutTime = new Date();
        const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000);

        // Update check-out and duration
        const { data, error } = await supabase
            .from('attendance')
            .update({
                check_out: checkOutTime.toISOString(),
                duration: duration
            })
            .eq('id', id)
            .select(`
                *,
                members (
                    id,
                    name,
                    email,
                    segment
                )
            `)
            .single();

        if (error) {
            console.error('Error updating check-out:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error: any) {
        console.error('Unexpected error in PATCH /api/attendance:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
