import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { generateGroqResponse } from '@/lib/groq';

export async function POST(req: Request) {
    try {
        const { memberId, stats } = await req.json(); // stats: { weight, height, goal, dietType, allergies }

        if (!process.env.GROQ_API_KEY) {
            console.error("❌ Groq API Key missing");
            return NextResponse.json({ error: "Server configuration error: AI Key missing" }, { status: 500 });
        }

        const prompt = `
        You are an expert nutritionist. Create a 7-day diet plan for a person with these stats:
        - Weight: ${stats.weight} kg
        - Height: ${stats.height} cm
        - Goal: ${stats.goal} (e.g. Weight Loss, Muscle Gain)
        - Diet Type: ${stats.dietType}
        - Allergies/Restrictions: ${stats.allergies || 'None'}

        Output strictly valid JSON with this structure:
        {
            "calories_target": 2000,
            "days": {
                "Monday": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "macros": "P: 150g, C: 200g, F: 60g" },
                "Tuesday": ... (all 7 days)
            },
            "shopping_list": ["item1", "item2"...]
        }
        Do not include markdown backticks. Just raw JSON.
        `;

        // Use shared utility
        const text = await generateGroqResponse(prompt, true); // true for JSON mode

        let planJson;
        try {
            // Cleanup just in case
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            planJson = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI JSON:", text);
            return NextResponse.json({ error: "AI generated invalid format" }, { status: 500 });
        }

        // Store in DB
        const savedPlan = await db.dietPlans.create({
            member_id: memberId,
            goal: stats.goal,
            diet_type: stats.dietType,
            calories_target: planJson.calories_target || 2000,
            plan_data: planJson,
            status: 'active'
        });

        return NextResponse.json({ success: true, plan: savedPlan });

    } catch (error: any) {
        console.error("AI Diet Gen Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate plan" }, { status: 500 });
    }
}
