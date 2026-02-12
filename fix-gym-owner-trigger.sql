-- FIX: Prevent Gym Owners from being inserted into 'members' table
-- This fixes the "Database error saving new user" during owner signup

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- 1. CHECK ROLE: If the user is a 'gym_owner', DO NOT insert into members
  IF (new.raw_user_meta_data->>'role' = 'gym_owner') THEN
    RETURN new; -- Exit successfully without doing anything
  END IF;

  -- 2. For everyone else (members), proceed with insert
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
