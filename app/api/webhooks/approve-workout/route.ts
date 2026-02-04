import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // In a real scenario, this URL comes from process.env.N8N_WEBHOOK_URL
        // For now, we mock it or use a placeholder if the user hasn't set it 
        // to avoid crashing if the env var is missing.
        const n8nUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nUrl) {
            console.log("Simulating N8N Trigger:", body);
            return NextResponse.json({
                success: true,
                message: "Simulator: Workflow triggered (No N8N_WEBHOOK_URL set)",
                data: body
            });
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`N8N responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Webhook trigger failed:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to trigger workflow' },
            { status: 500 }
        );
    }
}
