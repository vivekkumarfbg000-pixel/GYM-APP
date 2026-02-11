# 📱 Testing the Member Mobile App (Final Verified Version)

The app is now **Production Ready** for core features. 

## ⚠️ Prerequisites (CRITICAL)
Before testing, you MUST run the following SQL script in your Supabase SQL Editor:
1.  **`fix-connectivity-security.sql`**: This applies the fixes for Authentication, Challenge Progress, and Dashboard Security.

---

## 1. Access the App
Open this URL on your mobile phone (or browser simulating mobile):
👉 **http://localhost:3000/mobile/login**

*(Note: If testing on real phone, use your PC's IP address, e.g., `192.168.1.5:3000`)*

## 2. Test Registration & Login (FIXED) 🔐
**Feature:** New users can register and login immediately (Supabase Auth is now integrated).

1.  **Register:**
    -   Go to `/mobile/register`.
    -   Sign up with a new email (e.g., `tester1@gymflow.com`).
    -   **Result:** You will see "Approval Pending".
2.  **Approve (as Owner):**
    -   Go to `http://localhost:3000/dashboard/members` (Desktop).
    -   Click **"Pending"** tab -> Click **"Approve"**.
3.  **Login:**
    -   Go back to `/mobile/login`.
    -   Login with `tester1@gymflow.com`.
    -   **Result:** Success! You are redirected to the dashboard.

## 3. Test Full Workout Cycle 🏃
1.  **Start:** Click **"Start Run"** -> Play Button.
2.  **Track:** Move around to generate distance.
3.  **Save:** Click Stop -> Save Workout.
4.  **Verify:** Dashboard updates total distance and calories.

## 4. Test Challenge Automation (NEW) 🏆
**Feature:** Workouts now automatically update your challenge progress.

1.  **Join:** Go to **Community** -> **Challenges** -> Join "30-Day Runner".
2.  **Workout:** Go to **Home** -> Start Outdoor Run -> Run for >100 meters -> Save.
3.  **Verify:** Go back to **Community** -> **Challenges**.
    -   **Result:** The "30-Day Runner" progress bar should have increased! 

## 5. Test AI Diet Coach 🥗
1.  Go to **Coach** tab.
2.  Type: *"Give me a high protein vegetarian breakfast idea."*
3.  **Result:** AI responds with a context-aware answer.
4.  **Persistence:** Refresh the page. Your chat history should still be there.

## 6. Test Payments (Demo Mode) 💳
1.  Go to **Profile** (Top Right Avatar) -> **Membership**.
2.  Click **"Pay Now"** (or Renew).
3.  Select **"Credit Card"**.
4.  **Result:** Payment succeeds immediately (Mock).
5.  **Verify:** Membership status changes to `Active` and validity extends by 1 month.

---
## 7. Check Owner Dashboard 📊
1.  Switch to Desktop: `http://localhost:3000/dashboard`
2.  **New Members:** Your new `tester1` account should appear in "Recent Signups".
3.  **Revenue:** The mock payment you just made should increase the "Total Revenue" stat.

## 💡 Troubleshooting
-   **"Login Failed"**: Ensure you ran `fix-connectivity-security.sql` and that you **Approved** the member in the dashboard.
-   **"Save Failed"**: Check internet connection for Supabase access.

