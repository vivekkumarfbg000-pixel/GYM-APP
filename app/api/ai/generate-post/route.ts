import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateGroqResponse, GroqModels } from '@/lib/groq';

export async function POST(req: Request) {
    try {
        // Check if API key is configured
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey.length < 20) {
            console.error('GROQ_API_KEY is not properly configured');
            return NextResponse.json({
                error: 'Groq API key is not configured. Please add GROQ_API_KEY to your .env.local file.'
            }, { status: 500 });
        }

        // Trigger AI Generation (Motivational Quote) using Groq
        const prompt = "Generate a short, high-energy motivational quote for gym goers. Add 2-3 emojis. Plain text only. Keep it under 50 words.";

        const text = await generateGroqResponse(prompt, false, GroqModels.LLAMA_3_1_8B); // Using faster 8B model for simple quotes

        // Post as "AI Coach"
        const { triggerMemberId } = await req.json();

        // Check if AI Coach exists, if not use triggerMemberId but post type='ai'
        const content = text.trim();

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                member_id: triggerMemberId, // Attributed to invoker for FK, but UI will show as AI based on type
                content,
                type: 'ai',
                image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' // Generic gym image
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('AI Post Generation Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate AI post',
            details: error.toString()
        }, { status: 500 });
    }
}
