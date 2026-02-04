import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
    try {
        // Trigger AI Generation (Motivational Quote)
        // For production: Use gemini-1.5-flash
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt: "Generate a short, high-energy motivational quote for gym goers. Add 2-3 emojis. Plain text only.",
        });

        // Post as "AI Coach"
        // In a real app, 'ai_coach_id' would be a fixed system member. 
        // For now, we'll find a member named 'AI Coach' or create one, or just use a placeholder ID if foreign key constraints allow (or pick the first admin).

        // MVP: Just insert with a specific 'type' = 'ai' and a dummy member_id (or user's ID if triggered by user for fun)
        // Let's assume we pass a 'triggerMemberId' to attribute the action, but display as AI.
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

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
