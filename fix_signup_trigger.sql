-- FIX SIGNUP ERROR: Handle New User Creation Properly

-- 1. Make membership_type optional by setting a default
ALTER TABLE public.members 
ALTER COLUMN membership_type SET DEFAULT 'Trial';

-- 2. Create or Replace the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.members (
    id, 
    email, 
    name, 
    membership_type, 
    role, 
    status,
    approved
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'), 
    COALESCE(new.raw_user_meta_data->>'membership_type', 'Trial'),
    'member',
    'Active',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Verification (Optional - check if logic works)
-- You can try signing up again after running this.
