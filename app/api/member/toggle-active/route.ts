import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { memberId, isActive, gymOwnerId } = body;

        // 1. Validate input
        if (!memberId || !gymOwnerId || typeof isActive !== 'boolean') {
            return NextResponse.json({
                success: false,
                error: 'Member ID, Gym Owner ID, and active status are required'
            }, { status: 400 });
        }

        // 2. Get member and verify they belong to this gym owner
        const members = await db.members.getAll();
        const member = members.find(m => m.id === memberId);

        if (!member) {
            return NextResponse.json({
                success: false,
                error: 'Member not found'
            }, { status: 404 });
        }

        // 3. Verify gym owner owns this member
        if (member.gym_owner_id !== gymOwnerId) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized: You can only manage your own members'
            }, { status: 403 });
        }

        // 4. Update member active status
        const updateData: any = {
            is_active: isActive
        };

        // If deactivating, also unapprove to require re-approval
        if (!isActive) {
            updateData.approved = false;
            updateData.status = 'Inactive';
        } else {
            // If reactivating, set to pending for gym owner review
            updateData.status = 'Pending';
        }

        await db.members.update(memberId, updateData);

        return NextResponse.json({
            success: true,
            member: {
                id: memberId,
                is_active: isActive,
                status: updateData.status
            },
            message: `Member ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error: any) {
        console.error('Toggle active error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update member status'
        }, { status: 500 });
    }
}
