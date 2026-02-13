import { NextResponse } from 'next/server';
import { generateGroqResponse, GroqModels } from '@/lib/groq';
import { products } from '@/lib/mock-data'; // Currently using mock inventory

export async function POST(req: Request) {
    try {
        const { goal, gender, level } = await req.json();

        // Prepare context for AI
        // We send a summarized inventory list to save tokens
        const inventorySummary = products.map(p => `${p.id}: ${p.name} (${p.category}) - $${p.price}`).join('\n');

        const prompt = `
        Act as a gym store expert. Recommend 3 products for a user with these stats:
        - Goal: ${goal || 'General Fitness'}
        - Level: ${level || 'Intermediate'}
        
        Available Inventory:
        ${inventorySummary}

        Return strictly valid JSON:
        {
            "recommendations": [
                { "id": "matched_product_id", "reason": "Why this helps their goal" }
            ]
        }
        `;

        try {
            const aiResponse = await generateGroqResponse(prompt, true, GroqModels.LLAMA_3_1_8B); // Fast model
            const result = JSON.parse(aiResponse);

            // Re-hydrate the full product objects
            const recommendedProducts = result.recommendations.map((rec: any) => {
                const product = products.find(p => p.id === rec.id);
                return product ? { ...product, reason: rec.reason } : null;
            }).filter(Boolean);

            return NextResponse.json({ success: true, data: recommendedProducts });

        } catch (groqError) {
            console.error("Groq Rec Error:", groqError);
            // Fallback: Just return top 3 products
            return NextResponse.json({ success: true, data: products.slice(0, 3) });
        }

    } catch (error) {
        console.error("Recommendation API Error:", error);
        return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
    }
}
