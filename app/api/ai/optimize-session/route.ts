import { NextResponse } from 'next/server';
import { generateGroqResponse, GroqModels } from '@/lib/groq';

export async function POST(req: Request) {
    try {
        const { duration, calories, setsCompleted, distance, heartRate } = await req.json();

        // Construct context
        const prompt = `
        You are an elite fitness coach watching a client workout LIVE.
        Analyze their current session stats and give ONE short, punchy piece of advice.
        
        Current Stats:
        - Duration: ${Math.floor(duration / 60)} mins
        - Calories Burned: ${calories}
        - Sets Completed: ${setsCompleted}
        - Distance (GPS): ${distance ? (distance / 1000).toFixed(2) + 'km' : 'N/A'}
        
        Rules:
        1. If pace is slow, motivate them.
        2. If volume is high, remind them to hydrate/rest.
        3. If it's a mix (Hybrid), suggest a finisher.
        4. Max 15 words. Use emojis.
        `;

        const response = await generateGroqResponse(prompt, false, GroqModels.LLAMA_3_1_8B);

        return NextResponse.json({ success: true, advice: response.trim().replace(/^"|"$/g, '') });

    } catch (error) {
        console.error("Optimizer Error:", error);
        return NextResponse.json({ success: true, advice: "Keep pushing! You're doing great! 🔥" });
    }
}
