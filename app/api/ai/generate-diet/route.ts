import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/supabase';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { memberId, stats } = await req.json(); // stats: { weight, height, goal, dietType, allergies }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const planJson = JSON.parse(text);

        // Store in DB
        const savedPlan = await db.dietPlans.create({
            member_id: memberId,
            goal: stats.goal,
            diet_type: stats.dietType,
            calories_target: planJson.calories_target,
            plan_data: planJson,
            status: 'active'
        });

        return NextResponse.json({ success: true, plan: savedPlan });

    } catch (error) {
        console.error("AI Diet Gen Error:", error);
        return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
    }
}
