import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { message, memberId } = await req.json();

        if (!message || !memberId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch recent history for context (last 10 messages)
        const history = await db.dietChats.getHistory(memberId);

        // Format history for Gemini
        // Note: Gemini SDK has a specific chat history format, but for simplicity in this stateless API 
        // we can just append context to the prompt or use the chat model if we maintained state.
        // Here we'll append the last few messages to the system prompt to keep it simple and robust.

        const recentContext = history?.slice(-5).map(h => `${h.role === 'user' ? 'Member' : 'Coach'}: ${h.content}`).join('\n') || "";

        // 2. Prepare the System Prompt
        const systemPrompt = `You are an expert AI Nutrition Coach for a gym in India.
        Your name is "GymFlow Coach".
        
        Traits:
        - Friendly, encouraging, and knowledgeable about Indian vegetarian and non-vegetarian diets.
        - You specifically understand Indian food calories (e.g., Dal, Roti, Paneer, Chicken Curry).
        - Keep answers concise (under 100 words) unless asked for a full plan.
        - Use emojis occasionally.
        
        Context (Last few messages):
        ${recentContext}
        
        Current Question: ${message}
        
        Answer as the Coach:`;

        let reply = "";

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not set. Using mock response.");
            reply = "I'm currently in demo mode (API Key missing). But if I were real, I'd suggest a high-protein breakfast like Moong Dal Chilla or 3 Boiled Eggs! 🥚";
        } else {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            reply = response.text();
        }

        // 3. Save to Database (User Message)
        await db.dietChats.create({
            member_id: memberId,
            role: 'user',
            content: message
        });

        // 4. Save to Database (AI Reply)
        await db.dietChats.create({
            member_id: memberId,
            role: 'assistant',
            content: reply
        });

        return NextResponse.json({ success: true, reply });

    } catch (error) {
        console.error('Diet Chat Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process chat' },
            { status: 500 }
        );
    }
}
