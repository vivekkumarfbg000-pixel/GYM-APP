import { NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

// This route would normally be secured with a CRON_SECRET header
export async function POST(req: Request) {
    try {
        console.log("Starting Churn Analysis...");

        // 1. Fetch all members
        const members = await db.members.getAll();

        if (!members || members.length === 0) {
            return NextResponse.json({ message: "No members to analyze" });
        }

        let updatedCount = 0;
        const now = new Date();

        // 2. Analyze each member
        for (const member of members) {
            let riskScore = 0;
            const riskFactors: string[] = [];
            const lastCheckIn = member.last_check_in ? new Date(member.last_check_in) : null;

            // Factor 1: Attendance Recency
            if (!lastCheckIn) {
                riskScore += 70;
                riskFactors.push("Never checked in");
            } else {
                const daysSinceLast = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceLast > 30) {
                    riskScore += 80;
                    riskFactors.push("Absent > 30 days");
                } else if (daysSinceLast > 14) {
                    riskScore += 40;
                    riskFactors.push("Absent > 14 days");
                } else if (daysSinceLast > 7) {
                    riskScore += 10;
                    riskFactors.push("Absent > 1 week");
                }
            }

            // Factor 2: Membership Expiry (Simulated)
            // if (member.expiring_soon) riskScore += 20;

            // Cap score
            riskScore = Math.min(100, riskScore);

            // 3. Update Database if changed
            if (member.churn_risk !== riskScore) {
                await supabase.from('members').update({
                    churn_risk: riskScore,
                    risk_factors: riskFactors, // Using the new JSONB column
                    last_risk_update: now.toISOString()
                }).eq('id', member.id);
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            analyzed: members.length,
            updated: updatedCount,
            message: "Churn analysis completed successfully"
        });

    } catch (error) {
        console.error("Churn Analysis Failed:", error);
        return NextResponse.json(
            { success: false, error: 'Analysis failed' },
            { status: 500 }
        );
    }
}
