-- Create table for Victoria leads in the BNV Supabase project
create table if not exists public.victoria_leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  phone text,
  social text,
  niche text,
  amount numeric default 0,
  status text default 'Зареєстровано',
  is_free boolean default true,
  order_id text,
  sheet_id text,
  target_sheet text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  page_path text,
  page_url text,
  visitor_uuid uuid,
  raw_payload jsonb
);

-- Indexing for rapid queries, visitor search, and stitching
create index if not exists victoria_leads_visitor_uuid_idx on public.victoria_leads (visitor_uuid);
create index if not exists victoria_leads_phone_idx on public.victoria_leads (phone);
create index if not exists victoria_leads_order_id_idx on public.victoria_leads (order_id);

-- Enable Row Level Security (RLS)
alter table public.victoria_leads enable row level security;

-- Create policy to allow anonymous inserts (safe for clients using anon key)
create policy "Allow anonymous inserts" on public.victoria_leads
  for insert to anon with check (true);

-- Create policy to allow all actions for authenticated users (service role)
create policy "Allow all actions for authenticated" on public.victoria_leads
  for all to authenticated using (true);
