-- Payments & Subscriptions Modules

-- 1. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'failed'
  payment_method TEXT DEFAULT 'card', -- 'card', 'upi', 'cash'
  transaction_id TEXT, -- Mock Stripe ID
  description TEXT, -- 'Monthly Membership', 'Personal Training'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invoice_url TEXT -- Optional mock URL
);

-- 2. Update Members with Membership Details
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'active', -- 'active', 'expired', 'due'
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMPTZ;

-- 3. Seed some payment history
INSERT INTO public.payments (member_id, amount, status, description, created_at)
SELECT id, 2500.00, 'completed', 'Monthly Membership', NOW() - INTERVAL '30 days'
FROM public.members
WHERE role = 'member'
LIMIT 5;
