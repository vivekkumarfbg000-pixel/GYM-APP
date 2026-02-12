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
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const targetEmail = 'vivekkumarfbg000@gmail.com';

async function debugLogin() {
    console.log(`\n🔍 Deep Debug for: ${targetEmail}\n`);

    // 1. Get Auth User
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());

    if (!authUser) {
        console.log('❌ Auth User: NOT FOUND');
        return;
    }
    console.log(`✅ Auth User: FOUND`);
    console.log(`   - ID: ${authUser.id}`);
    console.log(`   - Email: ${authUser.email}`);
    console.log(`   - Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   - Role: ${authUser.user_metadata?.role}`);

    // 2. Get DB Record (Gym Owner)
    // Try exact match first
    let { data: dbUserExact, error: dbError } = await supabaseAdmin
        .from('gym_owners')
        .select('*')
        .eq('email', targetEmail) // Exact match
        .maybeSingle();

    if (dbUserExact) {
        console.log(`\n✅ DB Record (Exact Match): FOUND`);
    } else {
        console.log(`\n⚠️ DB Record (Exact Match): NOT FOUND`);

        // Try case-insensitive
        const { data: dbUserIlike } = await supabaseAdmin
            .from('gym_owners')
            .select('*')
            .ilike('email', targetEmail)
            .maybeSingle();

        if (dbUserIlike) {
            console.log(`✅ DB Record (Case-Insensitive): FOUND`);
            console.log(`   ⚠️ Actual Email in DB: "${dbUserIlike.email}" (Casing Mismatch!)`);
            dbUserExact = dbUserIlike; // Use this for further checks
        } else {
            console.log(`❌ DB Record: NOT FOUND AT ALL`);
            return;
        }
    }

    if (dbUserExact) {
        console.log(`   - ID: ${dbUserExact.id}`);
        console.log(`   - Auth User ID: ${dbUserExact.auth_user_id}`);
        console.log(`   - Gym Name: ${dbUserExact.gym_name}`);
        console.log(`   - Gym Password: ${dbUserExact.gym_password}`);

        // 3. Compare IDs
        if (dbUserExact.auth_user_id !== authUser.id) {
            console.log(`\n❌ CRITICAL: ID MISMATCH`);
            console.log(`   Auth ID: ${authUser.id}`);
            console.log(`   DB Ref : ${dbUserExact.auth_user_id}`);
            console.log(`   -> This effectively breaks the link between Auth and Data.`);

            // Fix it?
            console.log(`\n🛠️  Attempting to FIX ID Mismatch...`);
            const { error: updateError } = await supabaseAdmin
                .from('gym_owners')
                .update({ auth_user_id: authUser.id })
                .eq('id', dbUserExact.id);

            if (updateError) console.error('   Failed to update:', updateError.message);
            else console.log('   ✅ Fixed! IDs are now synced.');
        } else {
            console.log(`\n✅ IDs Match. Link is healthy.`);
        }
    }
}

debugLogin();
