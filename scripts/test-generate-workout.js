const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Config from environment (hardcoded for script reliability based on previous findings)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cumljmacxnkgeoewhlks.supabase.co';
const SUPABASE_SERVICE_LOC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_LOC_KEY);

async function testGenerateWorkout() {
    console.log("1. Fetching a valid member ID...");
    const { data: member, error } = await supabase
        .from('members')
        .select('id, name')
        .limit(1)
        .single();

    if (error || !member) {
        console.error("❌ Failed to fetch member:", error);
        return;
    }

    console.log(`✅ Found member: ${member.name} (${member.id})`);

    console.log("\n2. Testing AI Workout Generation API...");
    try {
        const response = await fetch('http://localhost:3000/api/ai/generate-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: member.id,
                goal: 'Strength & Hypertrophy',
                duration: 60
            })
        });

        console.log(`Status Code: ${response.status}`);
        const data = await response.json();

        if (data.success) {
            console.log("✅ Success! Workout generated.");
            console.log("Workout ID:", data.data.id);
            console.log("AI Notes:", data.data.ai_notes);
            console.log("Exercises:", data.data.plan_data.length);
        } else {
            console.error("❌ API Error:", data.error);
        }

    } catch (error) {
        console.error("❌ Request Failed:", error);
    }
}

testGenerateWorkout();
