// Seed script to populate Supabase with sample data
import { supabase } from './lib/supabase';
import { mockMembers } from './lib/mock-data';

async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...\n');

    try {
        // Seed Members (first 10 from mock data)
        console.log('📝 Seeding members...');
        const membersToSeed = mockMembers.slice(0, 10).map(m => ({
            name: m.name,
            email: m.email,
            phone: m.phone,
            membership_type: m.membershipType,
            membership_end_date: m.membershipEndDate || null,
            join_date: m.joinDate,
            segment: m.segment,
            engagement_score: m.engagementScore,
            churn_risk: m.churnRisk,
            check_in_frequency: m.checkInFrequency,
            last_check_in: m.lastCheckIn,
            total_revenue: m.totalRevenue,
            pt_sessions: m.ptSessions || 0
        }));

        const { data: members, error: membersError } = await supabase
            .from('members')
            .insert(membersToSeed)
            .select();

        if (membersError) {
            console.error('❌ Error seeding members:', membersError.message);
        } else {
            console.log(`✅ Seeded ${members?.length || 0} members`);
        }

        // Seed Campaigns
        console.log('\n📢 Seeding campaigns...');
        const campaigns = [
            {
                name: 'January Retention Campaign',
                segment: 'At-Risk',
                message_template: 'Hi {name}! 👋 We\'ve missed seeing you at the gym...',
                status: 'draft',
                response_rate: 0,
                revenue: 0
            },
            {
                name: 'Elite Member Upsell',
                segment: 'Elite',
                message_template: 'Hey {name}! 🌟 Exclusive PT offer just for you...',
                status: 'active',
                response_rate: 18.5,
                revenue: 45000,
                sent_date: new Date().toISOString().split('T')[0]
            }
        ];

        const { data: campaignsData, error: campaignsError } = await supabase
            .from('campaigns')
            .insert(campaigns)
            .select();

        if (campaignsError) {
            console.error('❌ Error seeding campaigns:', campaignsError.message);
        } else {
            console.log(`✅ Seeded ${campaignsData?.length || 0} campaigns`);
        }

        // Seed Attendance (if we have members)
        if (members && members.length > 0) {
            console.log('\n📊 Seeding attendance records...');
            const attendanceRecords = members.slice(0, 5).map((member, index) => ({
                member_id: member.id,
                check_in: new Date(Date.now() - (index * 60 * 60 * 1000)).toISOString(),
                check_out: index < 3 ? new Date(Date.now() - (index * 60 * 60 * 1000) + (75 * 60 * 1000)).toISOString() : null,
                duration: index < 3 ? 75 : null
            }));

            const { data: attendance, error: attendanceError } = await supabase
                .from('attendance')
                .insert(attendanceRecords)
                .select();

            if (attendanceError) {
                console.error('❌ Error seeding attendance:', attendanceError.message);
            } else {
                console.log(`✅ Seeded ${attendance?.length || 0} attendance records`);
            }
        }

        console.log('\n🎉 Database seeding complete!\n');
        console.log('📍 Visit http://localhost:3000/dashboard/members to see your data');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Run seeding
seedDatabase();
