const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Env Vars manually to avoid dev dependency issues
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
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase Credentials in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// We also need a client to simulate the Member App login (using Anon Key)
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
    console.log('🚀 Starting Full Member Flow Verification...');

    try {
        // --- STEP 1: Create Gym Owner (Setup) ---
        console.log('\n1️⃣  Creating Test Gym Owner...');
        const ownerEmail = `test_owner_${Date.now()}@example.com`;
        const ownerPassword = 'ownerPass123!';
        const gymPassword = `GYM${Math.floor(Math.random() * 10000)}`;

        // Create Auth User
        const { data: ownerAuth, error: ownerAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: ownerEmail,
            password: ownerPassword,
            email_confirm: true,
            user_metadata: { name: 'Test Owner', role: 'gym_owner', gym_name: 'Test Gym' }
        });
        if (ownerAuthError) throw new Error(`Owner Auth Failed: ${ownerAuthError.message}`);

        const ownerId = ownerAuth.user.id;
        console.log(`   Owner Auth Created: ${ownerId}`);

        // Create DB Record (Simulating /api/gym-owner/signup)
        const { error: ownerDbError } = await supabaseAdmin
            .from('gym_owners')
            .insert([{
                id: ownerId,
                name: 'Test Owner',
                email: ownerEmail,
                gym_name: 'Test Gym',
                gym_password: gymPassword,
                auth_user_id: ownerId
            }]);

        if (ownerDbError) throw new Error(`Owner DB Failed: ${ownerDbError.message}`);
        console.log(`   Owner DB Record Created. Gym Password: ${gymPassword}`);


        // --- STEP 2: Create Member (Simulating /api/members) ---
        console.log('\n2️⃣  Creating Test Member (via Gym Dashboard)...');
        const memberEmail = `test_member_${Date.now()}@example.com`;
        const memberPassword = 'memberPass123!';

        // Create Auth User
        const { data: memberAuth, error: memberAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: memberEmail,
            password: memberPassword,
            email_confirm: true,
            user_metadata: {
                name: 'Test Member',
                role: 'member',
                gym_owner_id: ownerId
            }
        });
        if (memberAuthError) throw new Error(`Member Auth Failed: ${memberAuthError.message}`);

        const memberId = memberAuth.user.id;
        console.log(`   Member Auth Created: ${memberId}`);

        // Check if Member was auto-created by a Trigger
        const { data: existingMember } = await supabaseAdmin
            .from('members')
            .select('*')
            .eq('id', memberId)
            .maybeSingle();

        if (existingMember) {
            console.log('   ⚠️ Member record ALREADY EXISTS (Trigger verified). Updating instead of Inserting...');

            const { error: updateError } = await supabaseAdmin
                .from('members')
                .update({
                    name: 'Test Member',
                    // email: memberEmail, // Likely already set
                    password: 'hashed_placeholder',
                    gym_owner_id: ownerId,
                    membership_type: 'Basic Test',
                    status: 'Active',
                    role: 'member',
                    join_date: new Date().toISOString()
                })
                .eq('id', memberId);

            if (updateError) throw new Error(`Member Update Failed: ${updateError.message}`);
            console.log('   Member Record Updated.');
        } else {
            console.log('   No auto-created record found. Proceeding with Insert...');
            // Create DB Record
            const { error: memberDbError } = await supabaseAdmin
                .from('members')
                .insert([{
                    id: memberId,
                    name: 'Test Member',
                    email: memberEmail,
                    password: 'hashed_placeholder', // API hashes it, here we just need a string
                    gym_owner_id: ownerId,
                    membership_type: 'Basic Test',
                    status: 'Active',
                    role: 'member',
                    join_date: new Date().toISOString()
                }]);

            if (memberDbError) throw new Error(`Member DB Failed: ${memberDbError.message}`);
            console.log('   Member DB Record Created.');
        }


        // --- STEP 3: Verify Member Login (Simulating Mobile App) ---
        console.log('\n3️⃣  Verifying Member Login (Client Side)...');

        const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
            email: memberEmail,
            password: memberPassword
        });

        if (loginError) throw new Error(`Login Failed: ${loginError.message}`);
        if (!loginData.user) throw new Error('Login succeeded but no user returned');

        console.log('✅ Login Successful!');
        console.log('   Role:', loginData.user.user_metadata.role);

        // Verify Role Check
        if (loginData.user.user_metadata.role !== 'member') {
            throw new Error(`Incorrect Role: ${loginData.user.user_metadata.role}`);
        }

        // --- STEP 4: Fetch Own Profile (RLS Test) ---
        console.log('\n4️⃣  Fetching Member Profile (RLS Check)...');
        // We use the authenticated client (User context)
        // Oops, createsClient with anon key + signIn doesn't strictly persist session in node unless configured.
        // But `signInWithPassword` returns a session. We can use that access token.

        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${loginData.session.access_token}`
                }
            }
        });

        const { data: profile, error: profileError } = await userClient
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();

        if (profileError) throw new Error(`Profile Fetch Failed: ${profileError.message}`);
        if (!profile) throw new Error('Profile not found');
        if (profile.email !== memberEmail) throw new Error('Profile email mismatch');

        console.log('✅ Profile Fetched Successfully!');
        console.log('   Member Name:', profile.name);

        console.log('\n🎉 ALL TESTS PASSED: Gym Owner -> Member Creation -> Member Login flow is valid.');

        // Cleanup (Optional)
        console.log('\n🧹 Cleaning up test users...');
        await supabaseAdmin.auth.admin.deleteUser(memberId);
        await supabaseAdmin.auth.admin.deleteUser(ownerId);
        // DB records should cascade delete if FK set up correctly, otherwise they might remain.
        // We'll leave them or manually delete if needed, but for now it's fine.

    } catch (err) {
        console.error('\n❌ Test Failed:', err.message);
        process.exit(1);
    }
}

runTest();
