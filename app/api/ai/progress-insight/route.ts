import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { memberId } = await req.json();

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        // 1. Fetch last 14 days of workouts
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

        const { data: workouts, error } = await supabase
            .from('ai_workouts') // Using ai_workouts table as it stores the Gym logs
            .select('*')
            .eq('member_id', memberId)
            .gte('created_at', twoWeeksAgo)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!workouts || workouts.length < 2) {
            return NextResponse.json({
                success: true,
                insight: {
                    title: "Let's Get Started!",
                    message: "Log a few more workouts to unlock personal AI coaching insights.",
                    trend: 'neutral'
                }
            });
        }

        // 2. Prepare context for AI
        const workoutSummary = workouts.map(w => ({
            date: new Date(w.created_at).toLocaleDateString(),
            goal: w.goal,
            duration: w.duration,
            volume: w.total_volume || 'N/A' // Assuming volume is calculated/stored
        }));

        const prompt = `
        Analyze these recent gym workouts for a user:
        ${JSON.stringify(workoutSummary)}

        Compare this week's performance to last week (if data exists).
        Generate a concise, motivating "Coach's Insight" (max 2 sentences).
        
        Return JSON format:
        {
            "title": "Short Header (e.g., 'Volume Increased', 'Consistent Effort')",
            "message": "The insight message.",
            "trend": "up" | "down" | "neutral",
            "metric": "Key stat (e.g., '+15% Volume', '3 Day Streak')"
        }
        `;

        // 3. Generate Insight using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let insightData;
        try {
            // Clean markdown code blocks if present
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            insightData = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse AI response", text);
            // Fallback
            insightData = {
                title: "Keep Going!",
                message: "You're consistent! Keep tracking to see detailed trends.",
                trend: "neutral"
            };
        }

        return NextResponse.json({ success: true, insight: insightData });

    } catch (error) {
        console.error('AI Insight Error:', error);
        return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
    }
}
