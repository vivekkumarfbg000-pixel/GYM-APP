# GymFlow AI - Rapid Prototype

**AI-Powered Gym Management Platform for Revenue Optimization**

Transform gym revenue with intelligent churn prediction, automated member engagement, and AI-powered campaigns.

## 🚀 Quick Start

```bash
cd "c:\Users\vivek\Downloads\gym app\gymflow-ai"
npm run dev
```

Visit **http://localhost:3000** - you'll be redirected to the login page.

## ✨ Demo Features

### 1. **Revenue Intelligence Dashboard**
- Real-time churn risk alerts
- MRR, churn rate, and LTV metrics
- AI-powered member insights
- Automatic member segmentation

### 2. **Member Management**
- 200 demo members with realistic data
- AI segments: Elite, At-Risk, Social, Early Bird, PT Ready, Regular
- Engagement scoring and churn risk analysis
- Detailed member profiles with AI recommendations

### 3. **Campaign Manager**
- AI message generation for each segment
- Performance tracking and ROI predictions
- A/B testing capabilities
- Active campaign monitoring

## 🎯 Value Proposition

**The Problem**: Gyms lose 30-40% revenue due to churn, inefficient operations, and missed upselling opportunities.

**Our Solution**: 
- Predict churn before it happens (AI risk scoring)
- Automate member engagement (WhatsApp campaigns)
- Optimize PT scheduling and upselling
- Increase revenue by 25-40%

**Pricing**: ₹2,999-9,999/month depending on gym size
**ROI**: Save ₹6-20 Lakhs annually by reducing churn

## 📱 Tech Stack

- **Framework**: Next.js 14 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Demo Mode**: Mock data for realistic demonstrations

## 📂 Project Structure

```
gymflow-ai/
├── app/
│   ├── (auth)/login/          # Authentication flow
│   ├── (dashboard)/            # Main application
│   │   ├── page.tsx            # Revenue dashboard
│   │   ├── members/            # Member management
│   │   └── campaigns/          # Campaign manager
│   └── page.tsx                # Root redirect
├── components/ui/              # Reusable UI components
└── lib/
    └── mock-data.ts            # Demo data (200 members)
```

## 🎬 Demo Flow (5 Minutes)

1. **Login Page** (0:00-0:10)
   - Show GymFlow AI branding
   - Click "Sign In" to proceed

2. **Dashboard Impact** (0:10-1:30)
   - Critical churn alerts
   - Revenue metrics showing growth
   - AI insights and recommendations

3. **Member Deep Dive** (1:30-2:30)
   - View high-risk member (Priya Patel)
   - Show 78% churn risk with factors
   - AI intervention suggestions

4. **AI Campaign Generator** (2:30-4:00) ⭐ **HIGHLIGHT**
   - Select "At-Risk" segment (50 members)
   - Click "Generate with AI"
   - Show personalized message
   - Display revenue predictions (₹80K est.)

5. **Close with ROI** (4:00-5:00)
   - Calculate revenue saved
   - Show 10-25x ROI vs software cost

## 💡 Key Demo Talking Points

- **Churn Alerts**: "You're about to lose ₹4-5 Lakhs - here's who and why"
- **AI Messages**: "14% response rate vs 2% industry average"
- **Segmentation**: "AI categorizes all 200 members automatically"
- **ROI**: "Save 20 members = ₹6 Lakhs revenue saved, ₹72K software cost = ₹5.28L profit"

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📋 Next Steps

### Week 2 (Polish):
- [ ] Add animations and micro-interactions
- [ ] Create ROI calculator tool
- [ ] Improve mobile responsiveness
- [ ] Add export functionality
- [ ] Create demo video recording

### Production MVP:
- [ ] Supabase backend setup
- [ ] Real AI churn prediction model
- [ ] WhatsApp Business API integration
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Real authentication system

## 📖 Full Documentation

See [walkthrough.md](../../../.gemini/antigravity/brain/ec9151fe-b8a7-4a58-97bb-eede54b3bac9/walkthrough.md) for complete feature documentation and demo guide.

See [implementation_plan.md](../../../.gemini/antigravity/brain/ec9151fe-b8a7-4a58-97bb-eede54b3bac9/implementation_plan.md) for technical architecture and roadmap.

## 🎯 Current Status

✅ **Week 1 Complete** - Demo-ready prototype with core features
⏳ **Week 2** - Polish, animations, and enhancement phase
🔮 **Production MVP** - Awaiting market validation

---

**Built with ❤️ for gym owners who want to maximize revenue and minimize churn**
