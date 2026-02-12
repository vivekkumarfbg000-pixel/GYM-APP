const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetPassword() {
    try {
        console.log('\n🔐 Admin Password Reset Tool\n');

        // 1. List recent users to help
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 10 });
        if (listError) throw listError;

        console.log('Recent Users:');
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email} (${u.user_metadata?.role || 'No Role'})`);
        });
        console.log('');

        const emailInput = await question('Enter Email to reset (or number from list): ');
        let targetEmail = emailInput.trim();

        // Handle number selection
        if (/^\d+$/.test(targetEmail)) {
            const index = parseInt(targetEmail) - 1;
            if (users[index]) {
                targetEmail = users[index].email;
            }
        }

        if (!targetEmail) {
            console.error('Invalid email.');
            process.exit(1);
        }

        const newPassword = await question('Enter New Password: ');
        if (!newPassword) {
            console.error('Password cannot be empty.');
            process.exit(1);
        }

        console.log(`\nReseting password for ${targetEmail}...`);

        // Find User ID
        const { data: { users: searchUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const user = searchUsers.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        // Update Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) throw updateError;

        console.log('✅ Password updated successfully!');

        // Also update Gym Owner gym_password if it's an owner (optional, to keep them in sync if desired, but confusing if disparate)
        // Let's NOT sync them automatically to avoid confusion unless requested. The Gym Password is technically distinct.

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

resetPassword();
