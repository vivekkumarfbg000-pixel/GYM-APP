const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn("⚠️ Could not read .env.local");
}

async function testGemini() {
    console.log("1. Checking API Key...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing in .env.local");
        return;
    }
    console.log("✅ API Key found.");

    console.log("2. Testing Model Connection...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

    try {
        for (const modelName of models) {
            try {
                console.log(`Attempting to generate with '${modelName}'...`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text());
                return; // Exit on first success
            } catch (e) {
                console.log(`❌ Failed with ${modelName}: ${e.message.split(' ')[0]}...`);
            }
        }
        console.error("❌ All models failed.");
    } catch (error) {
        console.error("❌ Unexpected Error:", error.message);
    }
}

testGemini();
