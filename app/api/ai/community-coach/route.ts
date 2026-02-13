import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const { postId, memberId } = await req.json();

        // 1. Fetch Post Content
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('content, type')
            .eq('id', postId)
            .single();

        if (fetchError || !post) throw new Error("Post not found");

        // 2. Generate AI Commentary
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an enthusiastic, motivating gym coach AI. Analyze the user's workout post and provide a short, specific, technical or motivational comment (max 2 sentences). Include emojis. If they achieved a PR, celebrate it. If they struggled, encourage them."
                },
                {
                    role: "user",
                    content: `User Post: "${post.content}"`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150
        });

        const aiComment = completion.choices[0]?.message?.content || "Keep pushing! 💪";

        // 3. Save AI Analysis/Comment to DB (as a comment from 'AI Coach')
        // We'll insert it as a regular comment but from a system user or just mark it visually in UI
        // For this implementation, we'll follow the plan and update the 'ai_analysis' column on the post AND add a visible comment.

        // Update post with analysis (for caching/displaying in a special slot)
        await supabase
            .from('posts')
            .update({ ai_analysis: aiComment })
            .eq('id', postId);

        // Optional: Also add as a comment so it appears in the thread
        /*
        await supabase.from('post_comments').insert({
            post_id: postId,
            member_id: '00000000-0000-0000-0000-000000000000', // Placeholder or use a real system bot ID
            content: `🤖 Coach: ${aiComment}`
        });
        */

        return NextResponse.json({ success: true, analysis: aiComment });

    } catch (error: any) {
        console.error("AI Coach Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
