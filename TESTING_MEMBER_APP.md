# 📱 Testing the Member Mobile App (Polished Version)

The app now supports **real data saving**, **history tracking**, and a beautiful **summary screen**.

## 1. Access the App
Open this URL on your mobile phone (or browser simulating mobile):
👉 **http://localhost:3000/mobile/login**

*(Note: If testing on real phone, use your PC's IP address, e.g., `192.168.1.5:3000`)*

## 2. Login
- **Email:** `john.smith@example.com` (or any valid member email)
- This sets your session for saving data.

## 3. Test Full Workout Cycle 🏃
1. **Start:** Click **"Start Run"** on the home screen.
2. **Track:** 
   - Allow location permissions.
   - Click the Big Blue Play Button.
   - **Move around** to generate distance data.
3. **Finish:**
   - Click **Pause** (Yellow button).
   - Click **Stop** (Red Square).
4. **Summary Screen:** 
   - 🎉 See the "Great Job!" completion screen.
   - Review your stats (Distance, Pace, Calories).
   - Click **"Save Workout"**.
5. **Dashboard Updated:**
   - You will be redirected to the Dashboard.
   - **Stats Updated:** Total distance/calories will increase.
   - **History List:** The new workout will appear in "Recent History".

## 4. Key Features
- **💾 Real Persistence:** Workouts are saved to the `outdoor_workouts` table in Supabase.
- **📍 Route Replay:** The app saves the full array of GPS coordinates (ready for future route mapping).
- **📊 Aggregated Stats:** The dashboard calculates total lifetime stats dynamically.
- **📱 Native Feel:** Smooth transitions, haptic-like button styles.

## 5. Test AI Diet Coach 🥗
1. Go to **Dashboard** and click **"AI Trainer"** (Purple button) OR click **"Coach"** in bottom nav.
2. **First Interaction:** You'll see a welcome message.
3. **Ask a Question:**
   - Type: *"What is a good high protein breakfast?"*
   - Click Send.
   - Reply appears instantly! (Simulation Mode)
4. **Try Specific Keywords:**
   - *"How to lose weight"*
   - *"Indian food diet"*
   - *"Muscle gain tips"*
5. **Real AI Mode:**
   - To unlock GPT-4, add `OPENAI_API_KEY=sk-...` to your `.env.local` file.
   - The app automatically switches from Simulation to Real AI.

## 6. Test AI Instructor (Workout Generator) 🏋️‍♂️
1. Go to **Dashboard** and click **"Generate Workout"** (new purple full-width button).
2. See the welcome screen ("Ready to train?").
3. Click **"Generate Workout"**.
4. Wait 1.5s for the AI (Simulation).
5. **Result:** See a full workout plan (Squats, Pushups, etc).
6. Click **"Mark Complete"** to finish.

## 7. Check Owner Dashboard 📊
1. Switch to Desktop mode (or open in new tab): `http://localhost:3000/dashboard`
2. Scroll down below the top metrics.
3. **New Section:** "Mobile App Impact Stats".
   - 📱 **Mobile Adoption:** See active user count.
   - 🏃 **GPS Activity:** See workout tracking volume.
   - 🥗 **AI Diet Coach:** See query volume.

## 💡 Troubleshooting
- **"Save Failed"**: Check if your Supabase table `outdoor_workouts` exists (run the schema script if not).
- **"Not logged in"**: If save fails, try logging out and in again to reset the ID.
- **Map Empty**: OpenStreetMap requires internet access.

## 8. Test Membership Approval Flow 🔐
**New Feature:** Members cannot login until approved by Gym Owner.

### Step 1: Register New Member
1. Go to **http://localhost:3000/mobile/register**
2. Sign up with a new email (e.g., `newuser@test.com`).
3. You will see: **"Approval Pending"** screen.
4. Try logging in at `/mobile/login` -> It will block you.

### Step 2: Gym Owner Approval
1. Go to **Owner Dashboard**: `http://localhost:3000/dashboard/members`
2. Click **"Pending Approvals"** tab (top of list).
3. You will see `newuser@test.com`.
4. Click **"Approve"** (Green Button).

### Step 3: Verify Login
1. Go back to Mobile Login.
2. Login as `newuser@test.com` (use password).
3. **Success!** You are now in.

### 💡 Admin Login
To access the Owner Dashboard, you can (conceptually) use:
- **Email:** `admin@gymflow.com`
- **Password:** `admin123`
*(Note: Current dashboard is open for dev, but API protects data)*

## 9. Test Community & Gamification 🏆
**New Feature:** Interact with other gym members and compete.

### Step 1: Open Community Hub
1. In the mobile app, click the **"Community"** icon in the bottom bar (Users Icon).
2. You will land on the **Feed** tab.
3. You should see demo posts from other members.

### Step 2: Check Leaderboard
1. Click the **"Ranking"** tab.
2. See where you stand! (Demo data shows you at Rank 5).

### Step 3: Join a Challenge
1. Click the **"Challenges"** tab.
2. See "30-Day Runner" and "Iron Lifter".
3. Click "Join".

### 💡 Note on Data
**Real Data is now Active!** 📡
- Posts you create will be saved to the database.
- Challenges you join will be tracked permanently.
- **Requirement:** You MUST run the `gamification-schema.sql` script for this to work. If you see "Failed to load data", the table is missing.
