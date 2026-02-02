# 🏃 GymFlow AI - Member Mobile App Feature Plan

## 📱 Overview

Add a **member-facing mobile app/portal** where gym members can:
- ✅ Login via gym owner's invitation
- 🏃 Track outdoor workouts with GPS
- 🥗 Ask AI for diet advice
- 🤖 Get personalized AI instructor guidance
- 📊 View their own stats and progress

---

## 🎯 Feature Breakdown

### 1. **Member Authentication & Onboarding**

#### User Flow:
```
Gym Owner                          Member
    │                                 │
    ├─ Create member in dashboard     │
    ├─ System sends invite link ──────┤
    │                                 │
    │                           ├─ Click link
    │                           ├─ Set password
    │                           ├─ Complete profile
    │                           └─ Access member app
```

#### Implementation:
- **Invite System:**
  - Gym owner creates member → Auto-generate invite link
  - Email/WhatsApp invite with magic link
  - One-time use token
  
- **Member Profile Setup:**
  - Password creation
  - Fitness goals (weight loss, muscle gain, endurance)
  - Current stats (height, weight, age)
  - Dietary preferences (veg, non-veg, vegan, allergies)
  - Experience level (beginner, intermediate, advanced)

**Database Schema:**
```sql
-- Add to members table
ALTER TABLE members ADD COLUMN password_hash TEXT;
ALTER TABLE members ADD COLUMN invite_token TEXT UNIQUE;
ALTER TABLE members ADD COLUMN invite_expires_at TIMESTAMP;
ALTER TABLE members ADD COLUMN onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN fitness_goal TEXT; -- weight_loss, muscle_gain, endurance, flexibility
ALTER TABLE members ADD COLUMN height_cm INTEGER;
ALTER TABLE members ADD COLUMN weight_kg DECIMAL;
ALTER TABLE members ADD COLUMN age INTEGER;
ALTER TABLE members ADD COLUMN dietary_preference TEXT; -- veg, non_veg, vegan
ALTER TABLE members ADD COLUMN allergies TEXT[];
ALTER TABLE members ADD COLUMN experience_level TEXT; -- beginner, intermediate, advanced
```

---

### 2. **GPS Workout Tracking** 🏃

#### Features:
- **Outdoor Run/Cycling Tracking:**
  - Real-time GPS tracking
  - Distance, pace, duration
  - Route mapping
  - Calories burned
  - Elevation gain/loss

- **Workout Types:**
  - Running
  - Cycling
  - Walking
  - Hiking

#### User Flow:
```
1. Member opens app → "Start Workout"
2. Select type (Run/Cycle/Walk)
3. GPS starts tracking
4. Real-time stats displayed
5. "End Workout" → Save to database
6. View workout summary
```

#### Mobile UI Components:
- **Start Screen:**
  - Workout type selector
  - Weather info
  - Motivational quote
  
- **Active Tracking:**
  - Live map with route
  - Current pace, distance, time
  - Heart rate monitor (if connected)
  - Pause/Resume/Stop buttons
  
- **Summary Screen:**
  - Total stats
  - Route replay
  - Share to social media
  - Save notes

**Database Schema:**
```sql
CREATE TABLE outdoor_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL, -- running, cycling, walking, hiking
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    distance_km DECIMAL,
    avg_pace DECIMAL, -- minutes per km
    max_pace DECIMAL,
    calories_burned INTEGER,
    elevation_gain INTEGER, -- meters
    elevation_loss INTEGER,
    gps_route JSONB, -- array of {lat, lng, timestamp, elevation}
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    weather TEXT, -- sunny, rainy, cloudy
    temperature INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outdoor_workouts_member ON outdoor_workouts(member_id);
CREATE INDEX idx_outdoor_workouts_date ON outdoor_workouts(start_time);
```

**API Routes:**
```typescript
// POST /api/member/workouts - Start workout
// PATCH /api/member/workouts/:id - Update GPS points during workout
// POST /api/member/workouts/:id/complete - End workout
// GET /api/member/workouts - Get member's workout history
// GET /api/member/workouts/:id - Get single workout details
```

**GPS Implementation:**
```typescript
// Use browser Geolocation API
navigator.geolocation.watchPosition((position) => {
    // Send update to server
    const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
        elevation: position.coords.altitude,
        accuracy: position.coords.accuracy
    };
    // Update real-time
});
```

---

### 3. **AI Diet Coach** 🥗

#### Features:
- **Ask AI About Diet:**
  - "What should I eat for breakfast?"
  - "Suggest a high-protein meal"
  - "Calories in chicken breast?"
  - "Meal plan for muscle gain"
  
- **Personalized Responses:**
  - Based on member's goals
  - Considers dietary preferences
  - Respects allergies
  - Suggests local Indian foods

- **Meal Logging:**
  - Photo-based meal tracking
  - AI identifies food and calories
  - Daily nutrition summary

#### AI Integration:
```typescript
// Use OpenAI GPT-4
const systemPrompt = `
You are a fitness nutrition expert helping gym members.
Member Profile:
- Goal: ${member.fitness_goal}
- Diet: ${member.dietary_preference}
- Allergies: ${member.allergies.join(', ')}
- Experience: ${member.experience_level}

Provide specific, actionable diet advice.
Focus on Indian foods when possible.
Keep responses concise and friendly.
`;

// Sample Interactions:
User: "What should I eat after gym?"
AI: "Great question! For post-workout recovery:
- Protein shake with banana (30g protein)
- OR Paneer bhurji (2 eggs + 100g paneer)
- OR Chicken breast with rice (150g chicken)

This helps muscle recovery! 💪"
```

**Database Schema:**
```sql
CREATE TABLE diet_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    ai_model TEXT DEFAULT 'gpt-4',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    meal_type TEXT, -- breakfast, lunch, dinner, snack
    photo_url TEXT,
    ai_detected_foods JSONB, -- {food: string, calories: number}[]
    total_calories INTEGER,
    protein_g INTEGER,
    carbs_g INTEGER,
    fats_g INTEGER,
    logged_at TIMESTAMP DEFAULT NOW()
);
```

**API Routes:**
```typescript
// POST /api/member/diet/ask - Ask AI question
// GET /api/member/diet/history - Get chat history
// POST /api/member/meals - Log meal
// GET /api/member/meals - Get meal history
// GET /api/member/nutrition/summary - Daily/weekly summary
```

**UI Components:**
```
Diet Chat Screen:
┌────────────────────────┐
│ 🥗 AI Diet Coach       │
├────────────────────────┤
│                        │
│ [User bubble]          │
│ "What's a good pre-    │
│  workout snack?"       │
│                        │
│          [AI bubble]   │
│     "Try a banana with │
│      peanut butter! 🍌│
│      Quick carbs +     │
│      protein = energy" │
│                        │
├────────────────────────┤
│ [Type question...]  📤 │
└────────────────────────┘
```

---

### 4. **Personalized AI Instructor** 🤖

#### Features:
- **Workout Recommendations:**
  - Daily workout plans
  - Exercise form tips
  - Rest day suggestions
  
- **Progress Tracking:**
  - Weight progression
  - Strength gains
  - Endurance improvements

- **Adaptive Training:**
  - Adjusts based on performance
  - Injury prevention
  - Plateau detection

#### AI Capabilities:
```typescript
// Workout Plan Generator
const generateWorkoutPlan = async (member: Member) => {
    const context = `
    Member: ${member.name}
    Goal: ${member.fitness_goal}
    Experience: ${member.experience_level}
    Recent workouts: ${recentWorkouts}
    Last gym visit: ${member.last_check_in}
    
    Generate a personalized workout for today.
    Include exercises, sets, reps, rest time.
    Consider muscle recovery and fatigue.
    `;
    
    // GPT-4 generates:
    return {
        focus: "Upper Body Strength",
        exercises: [
            {
                name: "Bench Press",
                sets: 4,
                reps: "8-10",
                rest: "90 seconds",
                tips: "Keep shoulder blades retracted"
            },
            // ... more exercises
        ],
        estimated_duration: 45,
        calories_target: 350
    };
};
```

**Database Schema:**
```sql
CREATE TABLE ai_workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    focus_area TEXT, -- upper_body, lower_body, cardio, full_body
    exercises JSONB, -- [{name, sets, reps, weight, rest, tips}]
    estimated_duration INTEGER, -- minutes
    calories_target INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES ai_workout_plans(id),
    exercise_name TEXT NOT NULL,
    sets_completed INTEGER,
    reps JSONB, -- [12, 10, 8] per set
    weight_kg DECIMAL,
    difficulty_rating INTEGER, -- 1-10
    form_notes TEXT,
    logged_at TIMESTAMP DEFAULT NOW()
);
```

**API Routes:**
```typescript
// GET /api/member/workout/today - Get AI-generated workout for today
// POST /api/member/workout/log - Log completed exercise
// POST /api/member/workout/complete - Mark workout done
// GET /api/member/progress - Get progress analytics
// POST /api/member/ai/ask - Ask AI trainer question
```

**UI Screens:**

```
Today's Workout:
┌────────────────────────────┐
│ 💪 Upper Body Strength     │
│ Est. 45 min | 350 cal      │
├────────────────────────────┤
│ 1. Bench Press             │
│    4 sets × 8-10 reps      │
│    Rest: 90s               │
│    💡 Keep shoulders back  │
│    [Start] [Skip]          │
├────────────────────────────┤
│ 2. Dumbbell Rows           │
│    3 sets × 12 reps        │
│    ...                     │
└────────────────────────────┘

Active Exercise:
┌────────────────────────────┐
│ Bench Press - Set 1/4      │
├────────────────────────────┤
│ Target: 8-10 reps          │
│ Last time: 60kg × 10       │
│                            │
│ Weight: [60] kg            │
│ Reps: [___]                │
│                            │
│ [Complete Set]             │
│                            │
│ Timer: 01:23 ⏱️            │
└────────────────────────────┘
```

---

### 5. **Member Dashboard & Analytics** 📊

#### Features:
- **Overview:**
  - Weekly workout streak
  - Total workouts this month
  - Calories burned
  - Distance covered
  
- **Progress Charts:**
  - Weight tracking
  - Strength progression
  - Workout frequency
  
- **Achievements:**
  - Badges (10 workouts, 100km, etc.)
  - Milestones
  - Leaderboard (optional)

**Database Schema:**
```sql
CREATE TABLE member_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
    current_weight_kg DECIMAL,
    weight_goal_kg DECIMAL,
    total_workouts INTEGER DEFAULT 0,
    total_distance_km DECIMAL DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    achievement_type TEXT, -- first_workout, 10_workouts, 100km, etc.
    achievement_name TEXT,
    achievement_description TEXT,
    badge_icon TEXT,
    earned_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🏗️ Technical Architecture

### Frontend Structure:
```
app/
├── (auth)/
│   ├── member-login/
│   ├── member-signup/
│   └── member-onboarding/
├── member/
│   ├── layout.tsx              # Member app layout
│   ├── page.tsx                # Member dashboard
│   ├── workout/
│   │   ├── today/              # AI workout for today
│   │   ├── track/              # GPS tracking screen
│   │   └── history/            # Past workouts
│   ├── diet/
│   │   ├── chat/               # AI diet coach
│   │   ├── log-meal/           # Meal logging
│   │   └── nutrition/          # Nutrition summary
│   ├── ai-trainer/
│   │   ├── chat/               # Ask AI trainer
│   │   └── plans/              # Generated plans
│   ├── profile/                # Edit profile
│   └── stats/                  # Analytics & progress
```

### API Routes:
```
app/api/member/
├── auth/
│   ├── invite/route.ts         # Generate invite link
│   ├── signup/route.ts         # Member signup
│   └── login/route.ts          # Member login
├── workouts/
│   ├── route.ts                # CRUD outdoor workouts
│   ├── today/route.ts          # Get AI workout
│   └── log/route.ts            # Log gym exercises
├── diet/
│   ├── ask/route.ts            # AI diet questions
│   ├── meals/route.ts          # Meal logging
│   └── summary/route.ts        # Nutrition data
├── ai-trainer/
│   ├── ask/route.ts            # Ask questions
│   └── plan/route.ts           # Generate plan
└── stats/route.ts              # Get member stats
```

---

## 🎨 Mobile-First Design

### Design Principles:
- **Native App Feel:** Bottom navigation, gestures
- **One-Hand Use:** Important actions at thumb reach
- **Offline Support:** Cache workouts locally
- **Dark Mode:** Essential for gym environment

### Key Screens:

1. **Member Home:**
   - Today's workout summary
   - Quick actions (Start GPS, Ask AI, Log Meal)
   - Streak counter
   - Recent activity

2. **GPS Tracking:**
   - Full-screen map
   - Floating stats card
   - Large stop button
   - Motivational messages

3. **AI Chat:**
   - WhatsApp-like interface
   - Voice input option
   - Quick action buttons

4. **Profile:**
   - Progress photos
   - Stats overview
   - Settings

---

## 🔐 Security & Privacy

### Data Protection:
- **Member Data Isolation:**
  ```sql
  -- RLS Policy
  CREATE POLICY "Members can only see their own data"
  ON outdoor_workouts
  FOR SELECT
  USING (auth.uid() = member_id);
  ```

- **GPS Privacy:**
  - Don't store exact home/work locations
  - Option to hide routes from others
  - Anonymize shared workouts

- **AI Chat Privacy:**
  - Don't share conversations with gym owner
  - Optional data usage consent

---

## 📱 Mobile App vs PWA

### Option A: Progressive Web App (PWA)
**Pros:**
- No app store approval
- Works on iOS & Android
- Easy updates
- Lower development cost

**Cons:**
- Limited GPS background tracking
- Fewer native features
- Install friction

**Recommended for MVP**

### Option B: Native Apps (React Native)
**Pros:**
- Better GPS tracking
- Push notifications
- Better performance
- App store visibility

**Cons:**
- Higher development cost
- Separate codebases (or React Native)
- App store approval required

**Recommended for v2**

---

## 🚀 Implementation Phases

### Phase 1: Foundation (2 weeks)
- [ ] Member authentication system
- [ ] Invite link generation
- [ ] Member onboarding flow
- [ ] Basic member dashboard
- [ ] Database schema updates

### Phase 2: GPS Tracking (2 weeks)
- [ ] GPS workout tracking
- [ ] Real-time distance/pace calculation
- [ ] Route mapping with Mapbox/Google Maps
- [ ] Workout summary & history
- [ ] Calories estimation

### Phase 3: AI Features (3 weeks)
- [ ] OpenAI integration
- [ ] AI diet coach chat
- [ ] AI workout plan generator
- [ ] Exercise form tips
- [ ] Progress analytics

### Phase 4: Polish & Launch (1 week)
- [ ] Mobile-optimized UI
- [ ] PWA setup (manifest, service worker)
- [ ] Performance optimization
- [ ] Testing on real devices
- [ ] Launch to beta users

**Total: 8 weeks for MVP**

---

## 💰 Cost Estimates

### Development:
- Backend APIs: 40 hours @ ₹1,500/hr = ₹60,000
- Frontend (Mobile): 60 hours @ ₹1,500/hr = ₹90,000
- AI Integration: 20 hours @ ₹2,000/hr = ₹40,000
- Testing & QA: 10 hours @ ₹1,000/hr = ₹10,000

**Total Dev Cost: ₹2,00,000**

### Monthly Operating Costs:
- OpenAI API: ₹5,000-10,000 (depends on usage)
- Maps API: ₹2,000-5,000
- Additional Supabase: ₹2,000
- **Total: ₹9,000-17,000/month**

### Revenue Impact:
- Higher member retention (AI engagement)
- Upsell PT packages (AI recommendations)
- Premium member tier (+₹500/month)
- **Potential: +₹50,000-1,00,000/month per gym**

---

## 🎯 Success Metrics

### Member Engagement:
- Daily Active Users (DAU)
- Workouts logged per week
- AI chat interactions
- Member retention rate

### Business Impact:
- Reduced churn (target: -20%)
- Increased PT sales (target: +25%)
- Member satisfaction score
- App store rating (if native)

---

## 🔄 Integration with Gym Owner Dashboard

### Gym Owner View:
- See which members use the app
- Aggregate stats (not individual workouts)
- Member engagement scores
- AI usage analytics

### Member Privacy:
- Gym owner CANNOT see:
  - GPS routes
  - AI diet conversations
  - Personal photos
  - Detailed workout logs
  
- Gym owner CAN see:
  - App usage (yes/no)
  - General engagement level
  - Achievement badges
  - Opt-in shared stats

---

## 📝 Next Steps

1. **Review this plan** - Confirm features & scope
2. **Design mockups** - Create UI designs for key screens
3. **Database updates** - Run SQL migrations
4. **Start with auth** - Build member login/signup
5. **MVP GPS tracking** - Core workout feature
6. **Add AI gradually** - Start with diet coach

---

**Questions to Decide:**
1. PWA or Native app for MVP?
2. Which AI features are highest priority?
3. Budget for OpenAI API usage?
4. Timeline expectations?
5. Beta testing with which gym?

---

This is a **game-changing feature** that will significantly increase member retention and gym value! 🚀
