import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { streamGroqResponse, GroqModels } from '@/lib/groq';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { message, memberId } = await req.json();

        if (!message || !memberId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        logger.info('Diet chat request', { messageLength: message.length }, memberId);

        // 1. Fetch recent history for context
        const history = await db.dietChats.getHistory(memberId);

        // Format history for context
        const recentContext = history?.slice(-5)
            .map(h => `${h.role === 'user' ? 'Member' : 'Coach'}: ${h.content}`)
            .join('\n') || "";

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

        // 3. Save user message to database
        await db.dietChats.create({
            member_id: memberId,
            role: 'user',
            content: message
        });

        // 4. Create streaming response
        const encoder = new TextEncoder();
        let fullResponse = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    logger.info('Starting Groq stream', { model: GroqModels.LLAMA_3_3_70B });

                    // Stream from Groq
                    for await (const chunk of streamGroqResponse(systemPrompt, GroqModels.LLAMA_3_3_70B)) {
                        fullResponse += chunk;

                        // Send chunk to client
                        const data = JSON.stringify({ chunk });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }

                    // Save complete response to database
                    await db.dietChats.create({
                        member_id: memberId,
                        role: 'assistant',
                        content: fullResponse
                    });

                    logger.info('Stream completed', { responseLength: fullResponse.length }, memberId);

                    // Send completion signal
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();

                } catch (error: any) {
                    logger.error('Streaming error', error, { memberId });

                    // Send error to client
                    const errorData = JSON.stringify({
                        error: error.message || 'Streaming failed'
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // Disable nginx buffering
            },
        });

    } catch (error: any) {
        logger.error('Diet chat error', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process chat' },
            { status: 500 }
        );
    }
}
