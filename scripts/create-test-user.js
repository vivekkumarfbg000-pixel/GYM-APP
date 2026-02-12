
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.local')));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    const email = 'e2e_test_owner@example.com';
    const password = 'TestPassword123!';
    const name = 'E2E Test Owner';
    const gymName = 'E2E Gym';
    const gymPassword = 'E2EGYM123';

    console.log(`Creating test user: ${email}`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            name,
            role: 'gym_owner',
            gym_name: gymName
        }
    });

    if (authError) {
        console.log('Auth user creation note:', authError.message);
        // If user exists, we might need to reset password or just proceed
        if (authError.message.includes('already registered')) {
            console.log('User already exists, updating password...');
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users.users.find(u => u.email === email);
            if (existingUser) {
                await supabase.auth.admin.updateUserById(existingUser.id, { password: password });
                console.log('Password updated.');
                return { email, password, userId: existingUser.id };
            }
        }
        return null; // Should have returned above if existing
    }

    const userId = authData.user.id;
    console.log(`Auth user created: ${userId}`);

    // 2. Check/Create DB Record
    const { data: existingOwner } = await supabase
        .from('gym_owners')
        .select('*')
        .eq('email', email)
        .single();

    if (!existingOwner) {
        const { error: dbError } = await supabase
            .from('gym_owners')
            .insert([{
                id: userId,
                auth_user_id: userId,
                name,
                email,
                gym_name: gymName,
                gym_password: gymPassword
            }]);

        if (dbError) {
            console.error('DB creation failed:', dbError);
        } else {
            console.log('DB record created.');
        }
    } else {
        console.log('DB record already exists.');
    }

    return { email, password, userId };
}

createTestUser();
