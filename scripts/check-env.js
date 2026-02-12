
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env.local file NOT FOUND at:', envPath);
        process.exit(1);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env.local file found.');

    // Simple parser to check specific keys
    const lines = content.split('\n');
    let hasUrl = false;
    let hasServiceRole = false;
    let hasServiceKey = false;

    lines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) hasUrl = true;
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) hasServiceRole = true;
        if (line.startsWith('SUPABASE_SERVICE_KEY=')) hasServiceKey = true;
    });

    console.log('--- File Content Check ---');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? 'Present' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', hasServiceRole ? 'Present' : 'MISSING');
    console.log('SUPABASE_SERVICE_KEY:', hasServiceKey ? 'Present' : 'MISSING');

} catch (err) {
    console.error('Error reading .env.local:', err);
}
