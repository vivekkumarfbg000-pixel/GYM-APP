import { NextResponse } from 'next/server';
import { generateGroqResponse, GroqModels } from '@/lib/groq';

const FALLBACK_RESPONSES: Record<string, string> = {
    default: "I'm having trouble connecting to my brain (API Error), but I'm still here! I can help with general workout and diet advice. What do you need?",
    workout: "Since I'm offline, here's a general tip: For hypertrophy, aim for 8-12 reps near failure. For strength, 1-5 reps with heavy weight. Make sure to warm up!",
    diet: "I can't generate a custom plan right now, but a balanced plate usually looks like: 1/2 veggies, 1/4 lean protein, 1/4 complex carbs. Drink plenty of water!",
};

export async function POST(req: Request) {
    try {
        const { message, context } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            console.warn("Missing GROQ_API_KEY");
            return NextResponse.json({
                response: FALLBACK_RESPONSES.default
            });
        }

        try {
            // Construct prompt with context
            const prompt = `
            You are FitGenie, an expert AI fitness coach for GymFlow.
            User Context: ${JSON.stringify(context || {})}
            User Message: "${message}"
            
            Keep response concise, encouraging, and actionable. Max 3 sentences.
            `;

            const text = await generateGroqResponse(prompt, false, GroqModels.LLAMA_3_3_70B);

            return NextResponse.json({ response: text });

        } catch (apiError: any) {
            console.error("Groq API Error:", apiError.message);

            // Smart Fallback
            const lowerMsg = message.toLowerCase();
            let fallback = FALLBACK_RESPONSES.default;
            if (lowerMsg.includes('workout') || lowerMsg.includes('exercise') || lowerMsg.includes('training')) {
                fallback = FALLBACK_RESPONSES.workout;
            } else if (lowerMsg.includes('diet') || lowerMsg.includes('food') || lowerMsg.includes('nutrition')) {
                fallback = FALLBACK_RESPONSES.diet;
            }

            return NextResponse.json({ response: fallback });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
