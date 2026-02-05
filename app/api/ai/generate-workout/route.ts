import { NextRequest, NextResponse } from 'next/server';
import { supabase, db } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memberId, goal, duration = 45 } = body;

        if (!memberId) {
            return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
        }

        console.log(`Generating workout for ${memberId} with goal ${goal}...`);

        // 1. Fetch Member Profile for context (optional, but good for personalization)
        const { data: member } = await supabase.from('members').select('*').eq('id', memberId).single();
        const userContext = member ? `User is ${member.segment} fitness level.` : "User is intermediate.";

        // 2. Prompt Engineering
        const prompt = `
            Act as an elite personal trainer. Create a structured ${duration}-minute workout plan for a client with the goal: "${goal}".
            Context: ${userContext}.
            
            Return the response ONLY as a valid JSON object with the following structure:
            {
                "ai_notes": "A brief, encouraging comment about the focus of this session (max 20 words).",
                "risk_level": "low" | "medium" | "high",
                "plan_data": [
                    { "name": "Exercise Name", "sets": number, "reps": "string rep range", "rest": number_in_seconds, "met": number_estimate }
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON.
        `;

        // 3. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON (Handle potential markdown wrapping)
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let aiPlan;

        try {
            aiPlan = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json({ success: false, error: 'AI generation failed format check' }, { status: 500 });
        }

        // 5. Save to Database using existing DB helper
        const newWorkout = await db.workouts.create({
            member_id: memberId,
            goal: goal || 'General Fitness',
            duration: duration,
            risk_level: aiPlan.risk_level || 'low',
            status: 'pending', // Pending trainer review simulation
            ai_notes: aiPlan.ai_notes,
            plan_data: aiPlan.plan_data
        });

        return NextResponse.json({
            success: true,
            data: newWorkout
        });

    } catch (error: any) {
        console.error('Error in AI generation:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
