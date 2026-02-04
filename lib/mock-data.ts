// Mock data for prototype demo
export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    membershipType: string;
    membershipEndDate: string;
    engagementScore: number;
    churnRisk: number;
    checkInFrequency: number; // per week
    lastCheckIn: string;
    segment: 'Elite' | 'At-Risk' | 'Social' | 'Early Bird' | 'PT Ready' | 'Regular';
    avatar?: string;
    totalRevenue: number;
    approved?: boolean;
    status?: string; // Active, Pending, Rejected
}

export interface ChurnAlert {
    memberId: string;
    memberName: string;
    riskScore: number;
    riskFactors: string[];
    suggestedAction: string;
    potentialRevenueLoss: number;
}

export interface Campaign {
    id: string;
    name: string;
    segment: string;
    messageTemplate: string;
    responseRate: number;
    revenue: number;
    status: 'draft' | 'active' | 'completed';
    sentDate?: string;
}

// Generate realistic member data
export const mockMembers: Member[] = [
    {
        id: '1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 98765 43210',
        joinDate: '2023-01-15',
        membershipType: 'Premium Annual',
        membershipEndDate: '2026-01-15',
        engagementScore: 92,
        churnRisk: 12,
        checkInFrequency: 5.2,
        lastCheckIn: '2026-01-28T09:30:00',
        segment: 'Elite',
        totalRevenue: 35000,
    },
    {
        id: '2',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 87654 32109',
        joinDate: '2025-10-01',
        membershipType: 'Basic Monthly',
        membershipEndDate: '2026-02-01',
        engagementScore: 45,
        churnRisk: 78,
        checkInFrequency: 1.5,
        lastCheckIn: '2026-01-15T18:00:00',
        segment: 'At-Risk',
        totalRevenue: 8997,
    },
    {
        id: '3',
        name: 'Amit Kumar',
        email: 'amit.k@email.com',
        phone: '+91 76543 21098',
        joinDate: '2024-05-20',
        membershipType: 'Standard Quarterly',
        membershipEndDate: '2026-02-20',
        engagementScore: 88,
        churnRisk: 18,
        checkInFrequency: 4.8,
        lastCheckIn: '2026-01-28T07:15:00',
        segment: 'Early Bird',
        totalRevenue: 21000,
    },
    {
        id: '4',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        phone: '+91 65432 10987',
        joinDate: '2025-11-10',
        membershipType: 'Premium Monthly',
        membershipEndDate: '2026-02-10',
        engagementScore: 72,
        churnRisk: 35,
        checkInFrequency: 3.2,
        lastCheckIn: '2026-01-27T17:30:00',
        segment: 'PT Ready',
        totalRevenue: 11997,
    },
    {
        id: '5',
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '+91 54321 09876',
        joinDate: '2023-08-05',
        membershipType: 'Premium Annual',
        membershipEndDate: '2026-08-05',
        engagementScore: 95,
        churnRisk: 8,
        checkInFrequency: 5.8,
        lastCheckIn: '2026-01-28T18:45:00',
        segment: 'Elite',
        totalRevenue: 42000,
    },
    {
        id: '6',
        name: 'Neha Gupta',
        email: 'neha.gupta@email.com',
        phone: '+91 43210 98765',
        joinDate: '2025-12-01',
        membershipType: 'Basic Monthly',
        membershipEndDate: '2026-02-01',
        engagementScore: 38,
        churnRisk: 82,
        checkInFrequency: 1.0,
        lastCheckIn: '2026-01-20T12:00:00',
        segment: 'At-Risk',
        totalRevenue: 5998,
    },
    {
        id: '7',
        name: 'Arjun Nair',
        email: 'arjun.nair@email.com',
        phone: '+91 32109 87654',
        joinDate: '2024-03-12',
        membershipType: 'Standard Quarterly',
        membershipEndDate: '2026-03-12',
        engagementScore: 78,
        churnRisk: 25,
        checkInFrequency: 3.8,
        lastCheckIn: '2026-01-28T19:00:00',
        segment: 'Social',
        totalRevenue: 24000,
    },
    {
        id: '8',
        name: 'Kavya Iyer',
        email: 'kavya.iyer@email.com',
        phone: '+91 21098 76543',
        joinDate: '2025-09-15',
        membershipType: 'Premium Monthly',
        membershipEndDate: '2026-02-15',
        engagementScore: 82,
        churnRisk: 22,
        checkInFrequency: 4.2,
        lastCheckIn: '2026-01-28T06:30:00',
        segment: 'Regular',
        totalRevenue: 19995,
    },
];

// Generate churn alerts from at-risk members
export const mockChurnAlerts: ChurnAlert[] = mockMembers
    .filter(m => m.churnRisk > 60)
    .map(member => ({
        memberId: member.id,
        memberName: member.name,
        riskScore: member.churnRisk,
        riskFactors: [
            `Check-ins dropped ${Math.floor(Math.random() * 40 + 40)}% vs last month`,
            `Last visit ${Math.floor(Math.random() * 10 + 5)} days ago`,
            member.membershipEndDate < '2026-03-01' ? 'Membership expires soon' : '',
        ].filter(Boolean),
        suggestedAction:
            member.churnRisk > 75
                ? 'Send personalized retention offer (15% discount)'
                : 'Schedule check-in call with staff',
        potentialRevenueLoss: member.totalRevenue * 0.6,
    }));

// Mock campaigns
export const mockCampaigns: Campaign[] = [
    {
        id: '1',
        name: 'Early Bird Special',
        segment: 'Early Bird',
        messageTemplate: 'Hi {name}! We noticed you love our morning sessions. Get 20% off on PT packages booked before 8 AM!',
        responseRate: 15.5,
        revenue: 85000,
        status: 'completed',
        sentDate: '2026-01-15',
    },
    {
        id: '2',
        name: 'Retention Campaign - At Risk',
        segment: 'At-Risk',
        messageTemplate: 'Hey {name}, we miss seeing you! Come back with this exclusive 25% renewal discount.',
        responseRate: 12.3,
        revenue: 120000,
        status: 'active',
        sentDate: '2026-01-25',
    },
    {
        id: '3',
        name: 'PT Upsell - Ready Members',
        segment: 'PT Ready',
        messageTemplate: 'Ready to take your fitness to the next level? Get a FREE PT consultation this week!',
        responseRate: 0,
        revenue: 0,
        status: 'draft',
    },
];

// Revenue metrics
export const mockRevenueMetrics = {
    mrr: 289950, // Monthly Recurring Revenue
    churnRate: 8.5, // Percentage
    avgLTV: 28500, // Average Lifetime Value
    atRiskRevenue: mockChurnAlerts.reduce((sum, alert) => sum + alert.potentialRevenueLoss, 0),
    totalMembers: mockMembers.length * 25, // Simulate 200 members
    activeMembers: mockMembers.length * 22,
    newMembersThisMonth: 12,
    churnedMembersThisMonth: 5,
};

// Revenue trend data (last 6 months)
export const revenueHistory = [
    { month: 'Aug', revenue: 245000, churn: 12, newMembers: 8 },
    { month: 'Sep', revenue: 252000, churn: 10, newMembers: 10 },
    { month: 'Oct', revenue: 268000, churn: 9, newMembers: 14 },
    { month: 'Nov', revenue: 275000, churn: 8, newMembers: 11 },
    { month: 'Dec', revenue: 282000, churn: 7, newMembers: 13 },
    { month: 'Jan', revenue: 289950, churn: 5, newMembers: 12 },
];

// Recent activity feed
export const recentActivity = [
    { type: 'check-in', member: 'Rahul Sharma', action: 'Checked in', time: '5 min ago', icon: '✅' },
    { type: 'signup', member: 'Ananya Desai', action: 'New member joined', time: '12 min ago', icon: '🎉' },
    { type: 'pt-booking', member: 'Vikram Singh', action: 'Booked PT session', time: '23 min ago', icon: '💪' },
    { type: 'campaign-response', member: 'Sneha Reddy', action: 'Responded to retention offer', time: '45 min ago', icon: '📧' },
    { type: 'renewal', member: 'Amit Kumar', action: 'Renewed premium membership', time: '1 hour ago', icon: '🔄' },
    { type: 'check-in', member: 'Kavya Iyer', action: 'Checked in', time: '1 hour ago', icon: '✅' },
    { type: 'churn', member: 'Rohan Patel', action: 'Membership expired', time: '2 hours ago', icon: '⚠️' },
    { type: 'pt-booking', member: 'Priya Gupta', action: 'Booked PT consultation', time: '3 hours ago', icon: '💪' },
];

// Upcoming renewals
export const upcomingRenewals = [
    { id: '1', name: 'Neha Gupta', expiresIn: 3, membershipType: 'Basic Monthly', riskLevel: 'high', value: 2999 },
    { id: '2', name: 'Priya Patel', expiresIn: 5, membershipType: 'Basic Monthly', riskLevel: 'high', value: 2999 },
    { id: '3', name: 'Sneha Reddy', expiresIn: 12, membershipType: 'Premium Monthly', riskLevel: 'medium', value: 5999 },
    { id: '4', name: 'Arjun Nair', expiresIn: 15, membershipType: 'Standard Quarterly', riskLevel: 'low', value: 7999 },
    { id: '5', name: 'Kavya Iyer', expiresIn: 18, membershipType: 'Premium Monthly', riskLevel: 'low', value: 5999 },
    { id: '6', name: 'Amit Kumar', expiresIn: 22, membershipType: 'Standard Quarterly', riskLevel: 'low', value: 7999 },
];

// Class utilization heatmap data
export const classUtilization = [
    { day: 'Mon', '6AM': 85, '7AM': 92, '8AM': 78, '9AM': 45, '5PM': 88, '6PM': 95, '7PM': 82, '8PM': 65 },
    { day: 'Tue', '6AM': 82, '7AM': 88, '8AM': 75, '9AM': 42, '5PM': 90, '6PM': 92, '7PM': 85, '8PM': 68 },
    { day: 'Wed', '6AM': 88, '7AM': 95, '8AM': 80, '9AM': 48, '5PM': 85, '6PM': 90, '7PM': 80, '8PM': 62 },
    { day: 'Thu', '6AM': 80, '7AM': 85, '8AM': 72, '9AM': 40, '5PM': 92, '6PM': 88, '7PM': 78, '8PM': 70 },
    { day: 'Fri', '6AM': 78, '7AM': 82, '8AM': 68, '9AM': 35, '5PM': 95, '6PM': 98, '7PM': 90, '8PM': 75 },
    { day: 'Sat', '6AM': 45, '7AM': 65, '8AM': 88, '9AM': 92, '10AM': 85, '11AM': 78, '12PM': 70, '5PM': 60 },
    { day: 'Sun', '6AM': 35, '7AM': 55, '8AM': 75, '9AM': 85, '10AM': 80, '11AM': 72, '12PM': 65, '5PM': 50 },
];

// Product Sales & E-commerce Data
export interface Product {
    id: string;
    name: string;
    category: 'Supplements' | 'Merchandise' | 'Accessories' | 'Beverages';
    price: number;
    cost: number;
    stock: number;
    lowStockThreshold: number;
    image?: string;
    description: string;
    monthlySales: number;
    revenue: number;
}

export const products: Product[] = [
    {
        id: 'p1',
        name: 'Whey Protein Isolate 2kg',
        category: 'Supplements',
        price: 3499,
        cost: 2100,
        stock: 45,
        lowStockThreshold: 20,
        description: 'Premium whey protein for muscle recovery',
        monthlySales: 32,
        revenue: 111968
    },
    {
        id: 'p2',
        name: 'Pre-Workout Energy Boost',
        category: 'Supplements',
        price: 1999,
        cost: 1200,
        stock: 28,
        lowStockThreshold: 15,
        description: 'High-energy pre-workout formula',
        monthlySales: 24,
        revenue: 47976
    },
    {
        id: 'p3',
        name: 'BCAA Recovery Powder',
        category: 'Supplements',
        price: 1799,
        cost: 1050,
        description: 'Branch chain amino acids for recovery',
        stock: 15,
        lowStockThreshold: 20,
        monthlySales: 18,
        revenue: 32382
    },
    {
        id: 'p4',
        name: 'Gym T-Shirt (Branded)',
        category: 'Merchandise',
        price: 799,
        cost: 250,
        stock: 65,
        lowStockThreshold: 30,
        description: 'Premium cotton gym t-shirt',
        monthlySales: 28,
        revenue: 22372
    },
    {
        id: 'p5',
        name: 'Shaker Bottle',
        category: 'Accessories',
        price: 399,
        cost: 150,
        stock: 42,
        lowStockThreshold: 25,
        description: '700ml leak-proof shaker',
        monthlySales: 35,
        revenue: 13965
    },
    {
        id: 'p6',
        name: 'Resistance Bands Set',
        category: 'Accessories',
        price: 1299,
        cost: 600,
        stock: 22,
        lowStockThreshold: 15,
        description: 'Set of 5 resistance bands',
        monthlySales: 15,
        revenue: 19485
    },
    {
        id: 'p7',
        name: 'Protein Bar (Box of 12)',
        category: 'Supplements',
        price: 899,
        cost: 500,
        stock: 8,
        lowStockThreshold: 20,
        description: 'High-protein snack bars',
        monthlySales: 42,
        revenue: 37758
    },
    {
        id: 'p8',
        name: 'Energy Drink (Pack of 6)',
        category: 'Beverages',
        price: 499,
        cost: 280,
        stock: 55,
        lowStockThreshold: 30,
        description: 'Sugar-free energy drinks',
        monthlySales: 48,
        revenue: 23952
    },
    {
        id: 'p9',
        name: 'Gym Bag (Premium)',
        category: 'Merchandise',
        price: 2499,
        cost: 1200,
        stock: 18,
        lowStockThreshold: 10,
        description: 'Spacious gym duffle bag',
        monthlySales: 8,
        revenue: 19992
    },
    {
        id: 'p10',
        name: 'Hand Grip Strengthener',
        category: 'Accessories',
        price: 599,
        cost: 250,
        stock: 32,
        lowStockThreshold: 20,
        description: 'Adjustable grip trainer',
        monthlySales: 22,
        revenue: 13178
    },
];

// Recent sales transactions
export const recentSales = [
    { id: 's1', product: 'Whey Protein Isolate 2kg', member: 'Rahul Sharma', amount: 3499, time: '15 min ago', method: 'UPI' },
    { id: 's2', product: 'Gym T-Shirt (Branded)', member: 'Priya Patel', amount: 799, time: '32 min ago', method: 'Cash' },
    { id: 's3', product: 'Pre-Workout Energy Boost', member: 'Amit Kumar', amount: 1999, time: '1 hour ago', method: 'Card' },
    { id: 's4', product: 'Shaker Bottle', member: 'Sneha Reddy', amount: 399, time: '2 hours ago', method: 'UPI' },
    { id: 's5', product: 'Protein Bar (Box of 12)', member: 'Vikram Singh', amount: 899, time: '3 hours ago', method: 'Cash' },
];

// Product sales summary
export const productSalesMetrics = {
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    totalProfit: products.reduce((sum, p) => sum + ((p.price - p.cost) * p.monthlySales), 0),
    itemsSold: products.reduce((sum, p) => sum + p.monthlySales, 0),
    lowStockItems: products.filter(p => p.stock <= p.lowStockThreshold).length,
    topSeller: products.sort((a, b) => b.revenue - a.revenue)[0],
};

// PT Scheduling & Trainer Management
export interface Trainer {
    id: string;
    name: string;
    specialization: string[];
    rating: number;
    sessionsCompleted: number;
    availability: string[];
    hourlyRate: number;
    commissionRate: number;
    image?: string;
}

export interface PTSession {
    id: string;
    trainerId: string;
    memberId: string;
    memberName: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    revenue: number;
}

export interface PTPackage {
    id: string;
    name: string;
    sessions: number;
    price: number;
    savings: number;
    validityDays: number;
}

export const trainers: Trainer[] = [
    {
        id: 't1',
        name: 'Rajesh Kumar',
        specialization: ['Strength Training', 'Weight Loss', 'Bodybuilding'],
        rating: 4.8,
        sessionsCompleted: 245,
        availability: ['Mon-Fri: 6AM-2PM', 'Sat: 7AM-12PM'],
        hourlyRate: 1500,
        commissionRate: 40,
    },
    {
        id: 't2',
        name: 'Priya Sharma',
        specialization: ['Yoga', 'Functional Training', 'Mobility'],
        rating: 4.9,
        sessionsCompleted: 312,
        availability: ['Mon-Sat: 5PM-9PM', 'Sun: 8AM-2PM'],
        hourlyRate: 1800,
        commissionRate: 45,
    },
    {
        id: 't3',
        name: 'Arjun Singh',
        specialization: ['CrossFit', 'HIIT', 'Athletic Performance'],
        rating: 4.7,
        sessionsCompleted: 189,
        availability: ['Mon-Fri: 5AM-10AM', 'Sat-Sun: 6AM-12PM'],
        hourlyRate: 1600,
        commissionRate: 42,
    },
];

export const ptSessions: PTSession[] = [
    { id: 'ps1', trainerId: 't1', memberId: '1', memberName: 'Rahul Sharma', date: '2026-01-29', time: '07:00 AM', status: 'scheduled', revenue: 1500 },
    { id: 'ps2', trainerId: 't2', memberId: '4', memberName: 'Sneha Reddy', date: '2026-01-29', time: '06:00 PM', status: 'scheduled', revenue: 1800 },
    { id: 'ps3', trainerId: 't1', memberId: '5', memberName: 'Vikram Singh', date: '2026-01-28', time: '08:00 AM', status: 'completed', revenue: 1500 },
    { id: 'ps4', trainerId: 't3', memberId: '3', memberName: 'Amit Kumar', date: '2026-01-28', time: '06:00 AM', status: 'completed', revenue: 1600 },
];

export const ptPackages: PTPackage[] = [
    { id: 'pkg1', name: 'Starter Pack', sessions: 5, price: 7000, savings: 500, validityDays: 30 },
    { id: 'pkg2', name: 'Fitness Enthusiast', sessions: 10, price: 13000, savings: 2000, validityDays: 60 },
    { id: 'pkg3', name: 'Transformation Package', sessions: 20, price: 24000, savings: 6000, validityDays: 90 },
    { id: 'pkg4', name: 'Elite Athlete', sessions: 30, price: 33000, savings: 12000, validityDays: 120 },
];

// Upsell Opportunities
export interface UpsellOpportunity {
    id: string;
    memberId: string;
    memberName: string;
    currentPlan: string;
    suggestedPlan: string;
    currentPrice: number;
    suggestedPrice: number;
    monthlyIncrease: number;
    annualIncrease: number;
    confidence: number;
    reasons: string[];
    status: 'pending' | 'sent' | 'converted' | 'rejected';
}

export const upsellOpportunities: UpsellOpportunity[] = [
    {
        id: 'u1',
        memberId: '3',
        memberName: 'Amit Kumar',
        currentPlan: 'Standard Quarterly',
        suggestedPlan: 'Premium Annual',
        currentPrice: 7999,
        suggestedPrice: 15999,
        monthlyIncrease: 667,
        annualIncrease: 8000,
        confidence: 87,
        reasons: [
            'Consistent 4.8 check-ins/week (high engagement)',
            'Attends 3+ group classes weekly',
            'Member for 18+ months (loyal)',
            'Similar members upgraded with 75% success'
        ],
        status: 'pending'
    },
    {
        id: 'u2',
        memberId: '7',
        memberName: 'Arjun Nair',
        currentPlan: 'Standard Quarterly',
        suggestedPlan: 'Premium Monthly',
        currentPrice: 7999,
        suggestedPrice: 5999,
        monthlyIncrease: 2333,
        annualIncrease: 28000,
        confidence: 82,
        reasons: [
            'Social butterfly - 78% engagement in group activities',
            'Arrives early for classes (dedicated)',
            'Asks about PT services frequently',
            'Current plan expires in 45 days'
        ],
        status: 'pending'
    },
    {
        id: 'u3',
        memberId: '8',
        memberName: 'Kavya Iyer',
        currentPlan: 'Premium Monthly',
        suggestedPlan: 'Premium Annual + PT Pack',
        currentPrice: 5999,
        suggestedPrice: 21999,
        monthlyIncrease: 1333,
        annualIncrease: 16000,
        confidence: 79,
        reasons: [
            'Elite engagement score (82/100)',
            'Early bird - 85% checkins before 8AM',
            'High LTV - ₹20K total revenue',
            'PT-ready profile match'
        ],
        status: 'sent'
    },
    {
        id: 'u4',
        memberId: '1',
        memberName: 'Rahul Sharma',
        currentPlan: 'Premium Annual',
        suggestedPlan: 'Premium Annual + Nutrition Plan',
        currentPrice: 15999,
        suggestedPrice: 19999,
        monthlyIncrease: 333,
        annualIncrease: 4000,
        confidence: 91,
        reasons: [
            'Elite member with 92/100 engagement',
            'Purchases supplements regularly',
            'Asks trainers about diet frequently',
            'Perfect nutrition plan candidate'
        ],
        status: 'pending'
    },
];

export const upsellMetrics = {
    totalOpportunities: upsellOpportunities.length,
    pendingValue: upsellOpportunities
        .filter(u => u.status === 'pending')
        .reduce((sum, u) => sum + u.annualIncrease, 0),
    conversionRate: 68, // 68% of sent offers convert
    avgIncreasePerMember: 14000,
    projectedAnnualRevenue: upsellOpportunities.reduce((sum, u) => sum + u.annualIncrease, 0),
};

// AI Workout Oversight Data
export interface PendingWorkout {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar?: string;
    generatedDate: string;
    goal: string;
    duration: number;
    exercises: number;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'modified';
    aiNotes: string;
}

export const mockPendingWorkouts: PendingWorkout[] = [
    {
        id: 'w1',
        memberId: '2',
        memberName: 'Priya Patel',
        generatedDate: '2026-02-04T08:30:00',
        goal: 'Weight Loss',
        duration: 45,
        exercises: 6,
        riskLevel: 'medium',
        status: 'pending',
        aiNotes: 'Increased intensity by 15% based on last week\'s performance. Caution: Knee injury history.',
    },
    {
        id: 'w2',
        memberId: '4',
        memberName: 'Sneha Reddy',
        generatedDate: '2026-02-04T09:15:00',
        goal: 'Strength',
        duration: 60,
        exercises: 8,
        riskLevel: 'low',
        status: 'pending',
        aiNotes: 'Standard progressive overload. No constraints detected.',
    },
    {
        id: 'w3',
        memberId: '6',
        memberName: 'Neha Gupta',
        generatedDate: '2026-02-03T18:45:00',
        goal: 'Cardio Endurance',
        duration: 30,
        exercises: 4,
        riskLevel: 'high',
        status: 'pending',
        aiNotes: 'High heart rate target. Review recommended for erratic check-in pattern.',
    },
];
