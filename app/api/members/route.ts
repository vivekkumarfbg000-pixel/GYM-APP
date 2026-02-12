import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

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

        // 0. Initialize Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create User in Supabase Auth FIRST
        // This ensures they have a valid login. We use the returned ID for the database.
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: body.email,
            password: body.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name: body.name,
                role: 'member',
                gym_owner_id: body.gym_owner_id
            }
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return NextResponse.json(
                { success: false, error: `Auth Error: ${authError.message}` },
                { status: 400 } // Likely email already exists
            );
        }

        const newUserId = authData.user.id;

        // 2. Hash password for local DB storage (optional, but good for reference/legacy)
        // Note: The REAL authentication happens via Supabase Auth, but we keep this for consistency with existing schema
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);

        // 3. Prepare member data with the Auth ID
        const memberData = {
            id: newUserId, // CRITICAL: Link DB record to Auth User
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            password: hashedPassword,
            gym_owner_id: body.gym_owner_id,
            membership_type: body.membership_type,
            membership_end_date: body.membership_end_date || null,
            segment: body.segment || 'New',
            engagement_score: body.engagement_score || 50,
            churn_risk: body.churn_risk || 30,
            check_in_frequency: body.check_in_frequency || 0,
            total_revenue: body.total_revenue || 0,
            pt_sessions: body.pt_sessions || 0,
            status: 'Active',
            approved: true,
            role: 'member',
            join_date: new Date().toISOString()
        };

        // 4. Insert into Members Table (using Admin client to bypass any RLS that might block)
        const { data, error } = await supabaseAdmin
            .from('members')
            .insert([memberData])
            .select()
            .single();

        if (error) {
            console.error('Error creating member record:', error);

            // Cleanup: If DB insert fails, we should delete the Auth user to prevent "orphan" accounts
            await supabaseAdmin.auth.admin.deleteUser(newUserId);

            // Handle unique constraint violations
            if (error.code === '23505') {
                return NextResponse.json(
                    { success: false, error: 'A member with this email already exists in database' },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Return success with member data
        const { password: _, ...memberWithoutPassword } = data as any;

        // Send welcome notifications (non-blocking)
        try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            const { sendWelcomeWhatsApp } = await import('@/lib/whatsapp');

            const gymName = process.env.GYM_NAME || 'GymFlow AI';

            await sendWelcomeEmail({
                memberEmail: body.email,
                memberName: body.name,
                password: body.password,
                gymName
            });

            if (body.phone) {
                await sendWelcomeWhatsApp({
                    phoneNumber: body.phone,
                    memberName: body.name,
                    email: body.email,
                    password: body.password,
                    gymName
                });
            }
        } catch (notifError) {
            console.warn('Failed to send welcome notifications:', notifError);
        }

        return NextResponse.json({
            success: true,
            data: memberWithoutPassword,
            message: 'Member created successfully. Login Sync Active.'
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

        // Also delete from Auth if possible (requires Service Role)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Try to delete auth user first
        await supabaseAdmin.auth.admin.deleteUser(id);

        const { error } = await supabaseAdmin
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
