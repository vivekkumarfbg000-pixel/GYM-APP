import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';
import { google } from '@ai-sdk/google'; // Or GoogleGenerativeAI directly

// We'll use a simple heuristic for the demo speed, or Gemini if we want detailed "reasons"
// For a "Predictive" dashboard, calculating scores for ALL members can be slow with LLM.
// Strategy: Calculate Risk Score based on logic, then use LLM to generate "Recovery Plan" for high risk ones on demand.
// Or: Batch analyze top 5 worst members.

export async function POST(req: Request) {
    try {
        // 1. Fetch all members
        const members = await db.members.getAll();

        if (!members || members.length === 0) {
            return NextResponse.json({ message: "No members to analyze" });
        }

        const updates = [];

        // 2. Simple Heuristic Analysis (Mocking "AI" for speed/stability)
        // In production, this would be a Python ML model or Batch LLM job
        for (const member of members) {
            const lastCheckIn = member.last_check_in ? new Date(member.last_check_in) : new Date(member.join_date);
            const daysSinceLast = Math.floor((new Date().getTime() - lastCheckIn.getTime()) / (1000 * 3600 * 24));

            let risk = 10; // Base risk

            // Factor 1: Recency
            if (daysSinceLast > 30) risk += 60;
            else if (daysSinceLast > 14) risk += 30;
            else if (daysSinceLast > 7) risk += 10;

            // Factor 2: Frequency (Mocked as check_in_frequency in DB)
            if (member.check_in_frequency < 2) risk += 20;

            // Factor 3: Tenure (New joins are volatile)
            const joinDate = new Date(member.join_date);
            const daysTenure = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24));
            if (daysTenure < 30) risk += 10;

            // Cap
            risk = Math.min(risk, 98);

            // Update DB if changed significantly (optimization)
            // For demo, we just update all.
            const { error } = await supabase
                .from('members')
                .update({ churn_risk: risk })
                .eq('id', member.id);

            if (error) console.error("Failed to update risk", member.id);
        }

        return NextResponse.json({ success: true, message: `Analyzed ${members.length} members` });

    } catch (error) {
        console.error("Churn Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze churn" }, { status: 500 });
    }
}
