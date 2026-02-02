# 🌱 Database Seeding Guide

## Quick Start - Add Sample Data

You have 2 options to populate your database with sample data:

### Option 1: SQL Script (Recommended - Instant)

1. **Open Supabase Dashboard**
   - Go to: https://cumljmacxnkgeoewhlks.supabase.co
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Seed Script**
   - Click **New Query**
   - Open `seed-data.sql` in your code editor
   - Copy the entire SQL script
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Verify**
   - You should see: "Success. X rows returned" or similar
   - Refresh your Members page: http://localhost:3000/dashboard/members
   - You'll see 10 members!

**What Gets Created:**
- ✅ 10 Sample Members (different segments: Elite, At-Risk, Regular, etc.)
- ✅ 4 Sample Campaigns (Active, Completed, Draft)
- ✅ 8 Attendance records for today

---

### Option 2: Manual Entry (For Testing Individual Features)

Use the UI to test CRUD operations:

**Add a Member:**
1. Go to Members page
2. Click "Add Member"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1-555-0100
   - Membership: Premium Monthly
   - Segment: Elite
4. Click "Add Member"

**Create a Campaign:**
1. Go to Campaigns page
2. Click "Create Campaign"
3. Fill in:
   - Name: Test Campaign
   - Segment: At-Risk
4. Click "Generate AI Message"
5. Review and create

---

## Sample Data Details

### Members by Segment:
- **Elite** (4 members) - High engagement, low churn risk
- **At-Risk** (3 members) - Low engagement, high churn risk
- **Regular** (2 members) - Medium engagement
- **Social** (1 member) - Group fitness enthusiast

### Campaigns:
1. **Active Campaign** - January Retention (18.5% response, ₹45K revenue)
2. **Completed Campaign** - Elite VIP Offer (32.8% response, ₹125K revenue)
3. **Draft Campaigns** (2) - Ready to launch

### Attendance:
- 8 recent check-ins for today
- Mix of active sessions and completed visits
- Automatic duration calculations

---

## Verification Steps

After seeding:

1. **Members Page** - Should show 10 members
   - Try search: "John"
   - Try filter: "Elite" segment
   - Try delete and re-seed

2. **Campaigns Page**
   - **Active Tab**: 1 campaign
   - **Drafts Tab**: 2 campaigns
   - **Completed Tab**: 1 campaign
   - Try launching a draft campaign

3. **Attendance Page** (when updated)
   - Will show today's 8 check-ins
   - Live capacity metrics
   - Check-out functionality

---

## Troubleshooting

**"Duplicate key value violates unique constraint"**
- Email already exists
- Run: `DELETE FROM members;` then try again

**"No rows returned"**
- Check you're in the correct Supabase project
- Verify tables exist: `SELECT * FROM members LIMIT 1;`

**Empty pages after seeding**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify API is running on localhost:3000

---

## Next Steps

Once you have sample data:
1. ✅ Test Members CRUD - Create, search, delete
2. ✅ Test Campaigns - Create, launch, pause
3. ⏳ Test Attendance - After I update that page
4. 🚀 Ready for production with real data!

---

**Need Help?** Let me know if the seeding doesn't work or if you want me to create different sample data!
