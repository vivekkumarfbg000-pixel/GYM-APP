import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

// GET: Fetch all campaigns
export async function GET() {
    try {
        const campaigns = await db.campaigns.getAll();
        return NextResponse.json({ success: true, data: campaigns });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

// POST: Create a new draft campaign
export async function POST(req: Request) {
    try {
        const { name, segment, message_template, status } = await req.json();

        if (!name || !segment || !message_template) {
            return NextResponse.json({ success: false, error: 'Missing Required Fields' }, { status: 400 });
        }

        const campaign = await db.campaigns.create({
            name,
            segment,
            message_template,
            status: status || 'draft',
            revenue: 0,
            response_rate: 0
        });

        return NextResponse.json({ success: true, data: campaign });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
    }
}

// PATCH: Launch or Pause Campaign (Update Status)
export async function PATCH(req: Request) {
    try {
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: 'Missing ID or Status' }, { status: 400 });
        }

        const updates: any = { status };

        // If launching, set sent_date
        if (status === 'active') {
            updates.sent_date = new Date().toISOString();

            // SIMULATION: In a real app, we'd trigger an Email/WhatsApp API here.
            // For now, we will simulate the "Revenue" and "Response Rate" calculation 
            // based on the segment size to show immediate value in the dashboard.

            // 1. Count members in segment
            const { count } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .eq('segment', 'At-Risk'); // Simplified: In real app use dynamic segment query

            // 2. Simulate Metrics (Random for demo effect, or based on count)
            const fakeResponseRate = (Math.random() * 10 + 5).toFixed(2); // 5-15%
            const fakeRevenue = Math.floor(Math.random() * 50000) + 10000; // 10k-60k

            updates.response_rate = parseFloat(fakeResponseRate);
            updates.revenue = fakeRevenue;
        }

        const campaign = await db.campaigns.update(id, updates);

        return NextResponse.json({ success: true, data: campaign });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
    }
}

// DELETE: Remove a campaign
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        await db.campaigns.delete(id);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete campaign' }, { status: 500 });
    }
}
