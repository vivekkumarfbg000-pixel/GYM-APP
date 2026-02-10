import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate AI response using Groq's fast inference
 * @param prompt - The prompt to send to the AI
 * @param jsonMode - Whether to enforce JSON output
 * @param model - Groq model to use (default: llama-3.3-70b-versatile)
 * @returns AI generated response
 */
export async function generateGroqResponse(
    prompt: string,
    jsonMode: boolean = false,
    model: string = "llama-3.3-70b-versatile"
): Promise<string> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: false,
            response_format: jsonMode ? { type: "json_object" } : undefined,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("Groq API Error:", error);
        throw new Error(`Groq API Error: ${error.message}`);
    }
}

/**
 * Generate AI response with streaming support
 * @param prompt - The prompt to send to the AI
 * @param model - Groq model to use
 * @returns Async iterator for streaming response
 */
export async function* streamGroqResponse(
    prompt: string,
    model: string = "llama-3.3-70b-versatile"
) {
    try {
        const stream = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 2048,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                yield content;
            }
        }
    } catch (error: any) {
        console.error("Groq Streaming Error:", error);
        throw new Error(`Groq Streaming Error: ${error.message}`);
    }
}

/**
 * Available Groq models
 */
export const GroqModels = {
    // Fastest models
    LLAMA_3_3_70B: "llama-3.3-70b-versatile", // Best balance of speed and quality
    LLAMA_3_1_8B: "llama-3.1-8b-instant", // Fastest, good for simple tasks

    // Specialized models
    MIXTRAL_8X7B: "mixtral-8x7b-32768", // Large context window
    GEMMA_2_9B: "gemma2-9b-it", // Smaller, efficient
} as const;

export default groq;
