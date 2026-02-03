import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simulation Mode Brain (Fallback when no API key)
function getSimulatedResponse(message: string): string {
    const msg = message.toLowerCase();

    // 1. Proteins
    if (msg.includes('protein') || msg.includes('chicken') || msg.includes('egg')) {
        return "For high protein options, try:\n\n• **Chicken Breast**: ~31g protein per 100g\n• **Eggs**: ~6g protein per egg\n• **Paneer**: ~18g protein per 100g\n• **Soya Chunks**: ~52g protein per 100g (Veg King! 👑)\n\nAim for 1.6g - 2.2g of protein per kg of your body weight for muscle gain! 💪";
    }

    // 2. Weight Loss
    if (msg.includes('loose weight') || msg.includes('fat') || msg.includes('lose weight')) {
        return "To lose weight effectively:\n\n1. **Calorie Deficit**: Eat 300-500 calories less than your TDEE.\n2. **High Protein**: Keeps you full longer.\n3. **Water**: Drink 3-4 liters daily.\n4. **Avoid**: Sugary drinks and fried snacks.\n\nTry starting your day with warm water + lemon! 🍋";
    }

    // 3. Muscle Gain
    if (msg.includes('muscle') || msg.includes('gain') || msg.includes('bulk')) {
        return "Muscle building cheat sheet:\n\n1. **Lift Heavy**: Progressive overload is key.\n2. **Eat Big**: Surplus of ~300 calories.\n3. **Protein**: Every meal should have protein.\n4. **Sleep**: 7-9 hours (muscles grow when you sleep, not when you lift!). 😴";
    }

    // 4. Indian Food
    if (msg.includes('indian') || msg.includes('roti') || msg.includes('rice') || msg.includes('dal')) {
        return "Indian diet hacks:\n\n• **Roti vs Rice**: Both are fine! Just control portion size.\n• **Dal**: Good but high carb. Combine with paneer/curd for complete protein.\n• **Oil**: Measure your oil (ghee/oil) when cooking.\n• **Snacks**: Swap samosa for roasted chana or makhana! 🥜";
    }

    // Default
    return "That's a great question about nutrition! 🥗\n\nI can help you with:\n- Protein sources\n- Weight loss tips\n- Muscle gain strategies\n- Indian food recommendations\n\nJust ask me anything!";
}

export async function POST(request: Request) {
    try {
        const { message, memberId } = await request.json();

        // 1. Check for Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Use Smart Simulation
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake network delay for realism
            const reply = getSimulatedResponse(message);
            return NextResponse.json({ success: true, reply, mode: 'simulation' });
        }

        // 2. Call Gemini AI
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const systemPrompt = `You are an expert fitness nutritionist for GymFlow AI, helping Indian gym members.
- Answer in under 100 words
- Use friendly emojis
- Focus on Indian context (dal, roti, paneer, etc.)
- Be motivating and practical
- Use bullet points for clarity`;

            const prompt = `${systemPrompt}\n\nUser Question: ${message}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const reply = response.text();

            return NextResponse.json({ success: true, reply, mode: 'gemini' });

        } catch (apiError) {
            console.error('Gemini API Error:', apiError);
            // Fallback to simulation if API fails
            return NextResponse.json({
                success: true,
                reply: getSimulatedResponse(message),
                mode: 'fallback'
            });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
