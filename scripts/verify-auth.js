const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://cumljmacxnkgeoewhlks.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'place-holder-key'; // From .env.local
const BASE_URL = 'http://localhost:3000';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyAuthFlow() {
    console.log('🚀 Starting Auth Flow Verification (Admin Mode)...');

    try {
        // Step 1: Ensure Gym Owner Exists (via Admin API)
        const adminEmail = 'uat_admin@test.com';
        const adminPassword = 'password123';

        console.log(`\n1️⃣  Ensuring Gym Owner (${adminEmail}) exists...`);

        let gymOwnerUserId;
        // Check if user exists
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === adminEmail);

        if (existingUser) {
            gymOwnerUserId = existingUser.id;
            console.log('   User exists. ID:', gymOwnerUserId);
        } else {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true
            });
            if (createError) throw new Error(`Failed to create admin user: ${createError.message}`);
            gymOwnerUserId = newUser.user.id;
            console.log('   User created. ID:', gymOwnerUserId);
        }

        // Check if gym_owners record exists
        const { data: output } = await supabaseAdmin
            .from('gym_owners')
            .select('id')
            .eq('id', gymOwnerUserId) // Assuming gym_owners.id IS the auth.user.id (usual pattern)
            // Wait, usually gym_owners.id is a UUID PK, and it has an 'owner_id' or matches auth.uid?
            // Let's check schema. Usually profile tables use auth.uid as PK or have a FK.
            // I'll assume for now it needs a record.
            .maybeSingle();

        // Actually, let's Insert/Upsert gym_owners record to be safe
        console.log('   Upserting gym_owners profile...');
        const { error: upsertError } = await supabaseAdmin
            .from('gym_owners')
            .upsert({
                id: gymOwnerUserId, // Assuming 1:1 mapping with auth ID
                email: adminEmail,
                name: 'UAT Admin Gym',
                gym_name: 'UAT Gym',
                gym_password: 'gympassword',
                metric_system: 'metric',
                currency: 'USD'
            })
            .select()
            .single();

        if (upsertError) throw new Error(`Failed to upsert gym_owners: ${upsertError.message}`);

        const gymOwnerId = gymOwnerUserId; // Using the ID we verified
        console.log('✅ Gym Owner Profile Verified.');

        // Step 3: Create New Member via API
        const testMemberEmail = `uat_test_${Date.now()}@example.com`;
        const testMemberPassword = 'password123';

        console.log(`\n3️⃣  Creating New Member (${testMemberEmail})...`);
        const createRes = await fetch(`${BASE_URL}/api/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'UAT Test Member',
                email: testMemberEmail,
                password: testMemberPassword,
                membership_type: 'Basic Monthly',
                gym_owner_id: gymOwnerId,
                phone: '555-0100'
            })
        });

        const createData = await createRes.json();
        if (!createData.success) throw new Error(`Member Creation Failed: ${createData.error}`);
        const memberId = createData.data.id;
        console.log('✅ Member Created. ID:', memberId);

        // Step 4: Login as Member via API
        console.log('\n4️⃣  Logging in as New Member...');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testMemberEmail,
                password: testMemberPassword
            })
        });

        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error(`Member Login Failed: ${loginData.error}`);
        console.log('✅ Member Login Successful.');
        console.log('   User:', loginData.user.name);
        console.log('   Redirect:', loginData.redirect);

        // Step 5: Verify Member Profile Access
        console.log('\n5️⃣  Verifying Member Profile Access...');
        const profileRes = await fetch(`${BASE_URL}/api/member/profile?memberId=${loginData.user.id}`);
        const profileData = await profileRes.json();

        if (!profileData.success) throw new Error(`Profile Fetch Failed: ${profileData.error}`);
        if (profileData.data.email !== testMemberEmail) throw new Error('Profile Email Mismatch');

        console.log('✅ Profile Verified.');
        console.log('🎉 All Auth Flows Verified Successfully!');

    } catch (error) {
        console.error('\n❌ Verification Failed:');
        console.error(error.message);
        process.exit(1);
    }
}

verifyAuthFlow();
