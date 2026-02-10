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

        // Validate required fields (now including password and gym_owner_id)
        if (!body.name || !body.email || !body.membership_type || !body.password || !body.gym_owner_id) {
            return NextResponse.json(
                { success: false, error: 'Name, email, membership type, password, and gym owner ID are required' },
                { status: 400 }
            );
        }

        // Check if member with this email already exists
        const { data: existing } = await supabase
            .from('members')
            .select('email')
            .eq('email', body.email)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'A member with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password for secure storage
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);

        // Prepare member data
        const memberData = {
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            password: hashedPassword, // Store hashed password
            gym_owner_id: body.gym_owner_id, // Link to gym owner
            membership_type: body.membership_type,
            membership_end_date: body.membership_end_date || null,
            segment: body.segment || 'New',
            engagement_score: body.engagement_score || 50,
            churn_risk: body.churn_risk || 30,
            check_in_frequency: body.check_in_frequency || 0,
            total_revenue: body.total_revenue || 0,
            pt_sessions: body.pt_sessions || 0,
            status: 'Active', // New members are active by default
            approved: true, // Auto-approved since gym owner creates them
            role: 'member',
            join_date: new Date().toISOString()
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

        // Return success with member data (excluding password)
        const { password: _, ...memberWithoutPassword } = data as any;

        // Send welcome notifications (non-blocking)
        try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            const { sendWelcomeWhatsApp } = await import('@/lib/whatsapp');

            // Get gym name (use default or fetch from gym_owner)
            const gymName = process.env.GYM_NAME || 'GymFlow AI';

            // Send email notification
            const emailResult = await sendWelcomeEmail({
                memberEmail: body.email,
                memberName: body.name,
                password: body.password, // Plain password (before hashing)
                gymName
            });

            // Send WhatsApp notification if phone number provided
            if (body.phone) {
                const whatsappResult = await sendWelcomeWhatsApp({
                    phoneNumber: body.phone,
                    memberName: body.name,
                    email: body.email,
                    password: body.password,
                    gymName
                });
            }

            // Log notification results but don't fail member creation
            console.log('Welcome notifications sent:', {
                email: emailResult.success,
                whatsapp: body.phone ? 'attempted' : 'skipped'
            });
        } catch (notifError) {
            // Log but don't fail the member creation
            console.warn('Failed to send welcome notifications:', notifError);
        }

        return NextResponse.json({
            success: true,
            data: memberWithoutPassword,
            message: 'Member created successfully. Welcome notifications sent.'
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
