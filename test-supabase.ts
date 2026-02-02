// Test Supabase connection
import { supabase, isSupabaseConfigured } from './lib/supabase';

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    // Check if configured
    if (!isSupabaseConfigured()) {
        console.log('⚠️  Supabase is not configured. Using demo mode.');
        return;
    }

    try {
        // Test connection by checking tables
        const { data, error } = await supabase
            .from('members')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Connection failed:', error.message);
            console.log('\n📝 To fix:');
            console.log('1. Go to your Supabase project dashboard');
            console.log('2. Open SQL Editor');
            console.log('3. Run the SQL script from: supabase-schema.sql');
            console.log('4. Restart your dev server\n');
        } else {
            console.log('✅ Successfully connected to Supabase!');
            console.log('✅ Database tables are accessible\n');
        }
    } catch (err) {
        console.log('❌ Error testing connection:', err);
    }
}

testConnection();
