import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this doesn't get cached

export async function GET(request: Request) {
    try {
        // 1. Initialize Admin Client to fetch ALL Auth Users
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

        // 2. Fetch ALL Auth Users (Handle pagination if > 50 users)
        let allAuthUsers: any[] = [];
        let page = 1;
        let hasMore = true;
        const perPage = 50;

        while (hasMore) {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
                page: page,
                perPage: perPage
            });

            if (error) throw error;

            if (!users || users.length === 0) {
                hasMore = false;
            } else {
                allAuthUsers = [...allAuthUsers, ...users];
                if (users.length < perPage) hasMore = false;
                page++;
            }
        }

        // Map for fast lookup
        const authUserMap = new Map(allAuthUsers.map(u => [u.id, u]));
        const authEmailMap = new Map(allAuthUsers.map(u => [u.email?.toLowerCase(), u]));

        // 3. Fetch All Systems Data
        const members = await db.members.getAll();
        const gymOwners = await db.gymOwners.getAll(); // We need to add getAll to gymOwners repo if missing

        // 4. Audit Members
        const memberAudit = members.map(member => {
            const byId = authUserMap.get(member.id);
            const byEmail = authEmailMap.get(member.email.toLowerCase());

            let status = 'HEALTHY';
            let issue = null;

            if (byId) {
                status = 'HEALTHY';
            } else if (byEmail) {
                status = 'ID_MISMATCH';
                issue = `Auth user exists but has different ID (${byEmail.id} vs DB ${member.id})`;
            } else {
                status = 'MISSING_AUTH';
                issue = 'No Supabase Auth user found for this email';
            }

            return {
                type: 'MEMBER',
                id: member.id,
                name: member.name,
                email: member.email,
                status,
                issue
            };
        });

        // 5. Audit Gym Owners
        // Check if DB helper exists, otherwise use raw query
        let gymOwnersList = gymOwners;
        if (!gymOwnersList) {
            const { data } = await supabaseAdmin.from('gym_owners').select('*');
            gymOwnersList = data || [];
        }

        const ownerAudit = gymOwnersList.map((owner: any) => {
            // Gym Owners might link via `id` OR `auth_user_id` column
            // We focus on the Primary Key `id` as the source of truth for Auth ID in 1:1 mapping
            const byId = authUserMap.get(owner.id);
            const byAuthIdCol = owner.auth_user_id ? authUserMap.get(owner.auth_user_id) : null;
            const byEmail = authEmailMap.get(owner.email.toLowerCase());

            let status = 'HEALTHY';
            let issue = null;

            if (byId) {
                status = 'HEALTHY';
            } else if (byAuthIdCol) {
                // If linked via auth_user_id column but PK is different, technically okay but complex
                status = 'HEALTHY_INDIRECT';
            } else if (byEmail) {
                status = 'ID_MISMATCH';
                issue = `Auth user exists but IDs don't match`;
            } else {
                status = 'MISSING_AUTH';
                issue = 'No Supabase Auth user found';
            }

            return {
                type: 'GYM_OWNER',
                id: owner.id,
                name: owner.name,
                email: owner.email,
                status,
                issue
            };
        });

        // 6. Summarize
        const brokenMembers = memberAudit.filter(m => m.status !== 'HEALTHY');
        const brokenOwners = ownerAudit.filter(o => o.status !== 'HEALTHY' && o.status !== 'HEALTHY_INDIRECT');

        return NextResponse.json({
            summary: {
                totalAuthUsers: allAuthUsers.length,
                totalMembers: members.length,
                totalGymOwners: gymOwnersList.length,
                brokenMembers: brokenMembers.length,
                brokenOwners: brokenOwners.length
            },
            brokenAccounts: {
                members: brokenMembers,
                owners: brokenOwners
            },
            // fullReport: memberAudit.concat(ownerAudit) // Uncomment if full dump needed
        });

    } catch (error: any) {
        console.error('Audit failed:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
