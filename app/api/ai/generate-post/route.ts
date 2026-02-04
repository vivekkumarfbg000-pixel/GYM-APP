import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
    try {
        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.length < 20) {
            console.error('GEMINI_API_KEY is not properly configured');
            return NextResponse.json({
                error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.'
            }, { status: 500 });
        }

        // Initialize Google provider explicitly to ensure API key is passed correctly
        const google = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        // Trigger AI Generation (Motivational Quote)
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: "Generate a short, high-energy motivational quote for gym goers. Add 2-3 emojis. Plain text only.",
        });

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
