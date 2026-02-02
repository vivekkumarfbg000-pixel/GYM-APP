-- Seed Sample Data for GymFlow AI
-- Run this in Supabase SQL Editor

-- Insert Sample Members
INSERT INTO members (name, email, phone, membership_type, membership_end_date, segment, engagement_score, churn_risk, check_in_frequency, total_revenue, pt_sessions) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0101', 'Premium Annual', '2026-12-31', 'Elite', 92, 5, 5.2, 12000, 24),
('Sarah Johnson', 'sarah.j@example.com', '+1-555-0102', 'Basic Monthly', '2026-03-15', 'At-Risk', 35, 85, 0.8, 2400, 0),
('Mike Chen', 'mike.chen@example.com', '+1-555-0103', 'Premium Monthly', '2026-04-01', 'Regular', 68, 25, 3.5, 4500, 8),
('Emily Davis', 'emily.davis@example.com', '+1-555-0104', 'Premium Annual', '2026-11-20', 'Elite', 88, 8, 4.8, 10800, 20),
('James Wilson', 'james.w@example.com', '+1-555-0105', 'Basic Monthly', '2026-02-28', 'At-Risk', 28, 92, 0.5, 1800, 0),
('Lisa Anderson', 'lisa.a@example.com', '+1-555-0106', 'Premium Monthly', '2026-05-10', 'Social', 75, 18, 4.2, 5400, 12),
('David Martinez', 'david.m@example.com', '+1-555-0107', 'Basic Monthly', '2026-03-20', 'Regular', 55, 35, 2.8, 3200, 4),
('Jennifer Taylor', 'jennifer.t@example.com', '+1-555-0108', 'Premium Annual', '2027-01-15', 'Elite', 95, 3, 5.5, 13500, 28),
('Robert Brown', 'robert.b@example.com', '+1-555-0109', 'Premium Monthly', '2026-04-05', 'PT Ready', 82, 12, 4.5, 6800, 16),
('Maria Garcia', 'maria.g@example.com', '+1-555-0110', 'Basic Monthly', '2026-02-25', 'At-Risk', 22, 95, 0.3, 1500, 0);

-- Insert Sample Campaigns
INSERT INTO campaigns (name, segment, message_template, status, response_rate, revenue, sent_date) VALUES
('January Retention Drive', 'At-Risk', 'Hi {name}! 👋 We''ve missed seeing you at the gym. Your fitness journey matters to us! Come back this week and get 25% off your next renewal. Let''s crush those goals together! 💪', 'active', 18.5, 45000, CURRENT_DATE - INTERVAL '5 days'),
('Elite Member VIP Offer', 'Elite', 'Hey {name}! 🌟 You''re crushing it! As one of our top members, we''d love to offer you an exclusive 20% off on personal training packages. Ready to take it to the next level?', 'completed', 32.8, 125000, CURRENT_DATE - INTERVAL '15 days'),
('PT Consultation Campaign', 'PT Ready', 'Hi {name}! We noticed you''ve been super consistent with your workouts. How about a FREE PT consultation this week? Let''s create a personalized plan just for you! 💪', 'draft', 0, 0, NULL),
('Social Fitness Challenge', 'Social', 'Hey {name}! 🎉 Join us for our new group fitness challenge! Team up with friends, stay motivated, and win exciting prizes. Sign up today!', 'draft', 0, 0, NULL);

-- Insert Sample Attendance Records (for today)
INSERT INTO attendance (member_id, check_in, check_out, duration)
SELECT 
    m.id,
    CURRENT_TIMESTAMP - (random() * INTERVAL '8 hours'),
    CASE 
        WHEN random() > 0.3 THEN CURRENT_TIMESTAMP - (random() * INTERVAL '6 hours')
        ELSE NULL
    END,
    CASE 
        WHEN random() > 0.3 THEN 60 + (random() * 60)::INTEGER
        ELSE NULL
    END
FROM members m
WHERE m.segment IN ('Elite', 'Regular', 'Social', 'PT Ready')
LIMIT 8;

-- Update member last_check_in for those with attendance
UPDATE members m
SET last_check_in = (
    SELECT MAX(check_in)
    FROM attendance a
    WHERE a.member_id = m.id
)
WHERE EXISTS (
    SELECT 1 FROM attendance a WHERE a.member_id = m.id
);
