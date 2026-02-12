const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        envVars[match[1]] = value;
    }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase Credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const emailsToCheck = ['vivekkumarfbg000@gmail.com']; // targeted fix

async function fixBrokenSignup() {
    console.log('🔍 Checking for broken signup states...');

    for (const email of emailsToCheck) {
        console.log(`\nChecking ${email}...`);

        // 1. Check Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!authUser) {
            console.log('✅ Status: No Auth User found. You should be able to Signup normally.');
            continue;
        }

        console.log(`⚠️  Auth User Found: ${authUser.id}`);

        // 2. Check DB
        // We use a raw query or just fetch via REST if we had a client, but here we only have Admin Auth client?
        // Actually supabaseAdmin can query DB too if RLS allows or if we use Service Key (which bypasses RLS).
        // Service Key bypasses RLS, so we can check 'gym_owners'.

        const { data: gymOwner, error: dbError } = await supabaseAdmin
            .from('gym_owners')
            .select('*')
            .eq('email', email)
            .single();

        if (gymOwner) {
            console.log('✅ Status: Gym Owner DB Record Found. Account seems healthy.');
            console.log('If you cannot login, it might be a password issue.');
        } else {
            console.log('❌ Status: ORPHAN ACCOUNT DETECTED!');
            console.log('   - Exists in Auth');
            console.log('   - MISSING in Database');
            console.log('   -> This prevents Signup (already exists) AND Login (access denied).');

            console.log('🛠️  Fixing... Deleting Auth User so you can retry Signup.');

            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            if (deleteError) {
                console.error('   ❌ Failed to delete:', deleteError.message);
            } else {
                console.log('   ✅ Auth User Deleted Successfully.');
                console.log('   👉 PLEASE TRY SIGNING UP AGAIN NOW.');
            }
        }
    }
}

fixBrokenSignup();
