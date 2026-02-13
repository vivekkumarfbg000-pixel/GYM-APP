import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

// We'll use a simple heuristic for the demo speed, or Gemini if we want detailed "reasons"
// For a "Predictive" dashboard, calculating scores for ALL members can be slow with LLM.
// Strategy: Calculate Risk Score based on logic, then use LLM to generate "Recovery Plan" for high risk ones on demand.
// Or: Batch analyze top 5 worst members.

import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';
import { generateGroqResponse, GroqModels } from '@/lib/groq';

export async function POST(req: Request) {
    try {
        // 1. Fetch all members
        const members = await db.members.getAll();

        if (!members || members.length === 0) {
            return NextResponse.json({ message: "No members to analyze" });
        }

        // 2. Identify At-Risk Members (Initial Filter)
        // We still filter first to avoid sending 1000s of users to LLM at once (cost/speed)
        const atRiskMembers = members.filter(m => {
            const lastCheckIn = m.last_check_in ? new Date(m.last_check_in) : new Date(m.join_date);
            const daysSinceLast = Math.floor((new Date().getTime() - lastCheckIn.getTime()) / (1000 * 3600 * 24));
            return daysSinceLast > 14; // Anyone absent for 2 weeks +
        });

        if (atRiskMembers.length === 0) {
            return NextResponse.json({ success: true, message: "No at-risk members found." });
        }

        // Limit to top 5 for this demo run
        const membersToAnalyze = atRiskMembers.slice(0, 5);

        // 3. AI Analysis Loop
        const analyzed = [];
        for (const member of membersToAnalyze) {
            const prompt = `
            Analyze this gym member's churn risk and suggest a retention offer.
            Data:
            - Name: ${member.name}
            - Days Absent: ${Math.floor((new Date().getTime() - (member.last_check_in ? new Date(member.last_check_in).getTime() : new Date(member.join_date).getTime())) / (1000 * 3600 * 24))}
            - Join Date: ${member.join_date}
            - Avg Visits/Week: ${member.check_in_frequency || 0}
            
            Return JSON only:
            {
                "risk_score": 1-100,
                "reason": "1 sentence explanation",
                "offer": "Specific retention offer (e.g. Free PT, 10% off)"
            }
            `;

            try {
                const response = await generateGroqResponse(prompt, true, GroqModels.LLAMA_3_3_70B);
                const result = JSON.parse(response);

                // Update DB
                await supabase
                    .from('members')
                    .update({
                        churn_risk: result.risk_score,
                        ai_notes: `${result.reason} | Suggest: ${result.offer}`
                    })
                    .eq('id', member.id);

                analyzed.push({ name: member.name, ...result });

            } catch (e) {
                console.error(`Failed to analyze member ${member.id}`, e);
            }
        }

        return NextResponse.json({ success: true, analyzed });

    } catch (error) {
        console.error("Churn Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze churn" }, { status: 500 });
    }
}
