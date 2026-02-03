-- Classes Table
create table if not exists public.classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  trainer text not null,
  start_time timestamp with time zone not null,
  duration integer not null, -- minutes
  capacity integer default 20,
  attendees integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Equipment Table
create table if not exists public.equipment (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  serial_number text,
  status text check (status in ('operational', 'maintenance', 'repair', 'out_of_order')) default 'operational',
  last_service date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Enable for production security)
alter table public.classes enable row level security;
alter table public.equipment enable row level security;

-- Drop existing policies to avoid errors on re-run
drop policy if exists "Enable all for authenticated headers" on public.classes;
drop policy if exists "Enable all for authenticated headers" on public.equipment;

create policy "Enable all for authenticated headers" on public.classes for all using (true) with check (true);
create policy "Enable all for authenticated headers" on public.equipment for all using (true) with check (true);
