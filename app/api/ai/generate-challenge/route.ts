import { NextResponse } from 'next/server';
import { generateGroqResponse, GroqModels } from '@/lib/groq';

// In-memory cache for demo (In production, store in DB 'challenges' table)
let dailyChallenge = {
    date: '',
    data: null as any
};

export async function GET() {
    const today = new Date().toDateString();

    // Serve cached challenge if it's the same day
    if (dailyChallenge.date === today && dailyChallenge.data) {
        return NextResponse.json({ success: true, fromCache: true, data: dailyChallenge.data });
    }

    try {
        const prompt = `
        Generate a fun, short "Daily Gym Challenge" for today.
        It should be accessible to most fitness levels but scalable.
        Example: "100 Burpees for Time" or "Plank as long as you can".

        Return JSON:
        {
            "title": "Challenge Name",
            "description": "Brief description of the workout",
            "difficulty": "Beginner" | "Intermediate" | "Advanced",
            "emoji": "🔥"
        }
        `;

        const response = await generateGroqResponse(prompt, true, GroqModels.LLAMA_3_1_8B);
        const data = JSON.parse(response);

        // Update Cache
        dailyChallenge = {
            date: today,
            data
        };

        return NextResponse.json({ success: true, fromCache: false, data });

    } catch (error) {
        console.error("Challenge Gen Error:", error);
        return NextResponse.json({
            success: true,
            data: {
                title: "Max Plank Hold",
                description: "Hold a plank for as long as possible. Post your time!",
                difficulty: "Intermediate",
                emoji: "⏱️"
            }
        });
    }
}
