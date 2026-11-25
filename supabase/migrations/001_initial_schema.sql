-- Trade Fresh Production Schema (PostgreSQL / Supabase)
-- Run this in your Supabase SQL Editor before running seed.sql

create extension if not exists pgcrypto;

-- 1. Profiles table (linked 1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  company_name text not null default '',
  vendor_code text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Admin-controlled dynamic homepage & site configuration
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  announcement_text text not null default 'Live Nashik & Lasalgaon morning arrivals open for vendor bidding.',
  hero_headline text not null default 'Fresh produce, decided by bids.',
  hero_subheadline text not null default 'Farm-sourced vegetable lots graded by the trader, priced with a clear ask, and locked to the highest vendor bid.',
  hero_cta_primary text not null default 'Browse live lots',
  hero_cta_secondary text not null default 'Sign in / Register',
  hero_image_url text not null default '/images/hero-harvest.jpg',
  updated_at timestamptz not null default now()
);

-- 3. Produce trading lots
create table if not exists public.lots (
  id text primary key,
  lot_code text unique not null,
  produce text not null check (produce in ('Tomato', 'Onion', 'Potato', 'Okra', 'Capsicum')),
  grade text not null check (grade in ('Grade A', 'Grade B')),
  quantity_kg integer not null check (quantity_kg > 0),
  origin text not null,
  farm_name text not null,
  harvest_date text not null,
  ask_price_per_kg integer not null check (ask_price_per_kg > 0),
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'qc_pending', 'locked', 'dispatched', 'delivered')),
  image_url text not null default '/images/produce-tomato.jpg',
  featured_on_home boolean not null default true,
  winning_vendor_id text,
  winning_bid_per_kg integer,
  quality_report jsonb not null default '{}'::jsonb,
  delivery_address text not null,
  trader_contact jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4. Vendor bids
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  lot_id text not null references public.lots(id) on delete cascade,
  bidder_id uuid references public.profiles(id) on delete set null,
  vendor_label text not null,
  amount_per_kg integer not null check (amount_per_kg > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_bids_lot_amount on public.bids (lot_id, amount_per_kg desc);
create index if not exists idx_lots_status_ends on public.lots (status, ends_at);

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger: auto-create profile on auth.users signup (always defaults role to 'user')
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_code text;
begin
  generated_code := 'Vendor #' || upper(substr(replace(new.id::text, '-', ''), 1, 4));
  insert into public.profiles (id, email, full_name, company_name, vendor_code, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    generated_code,
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: prevent client-side privilege escalation on profiles.role
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('request.jwt.claim.role', true), '') in ('anon', 'authenticated') then
    raise exception 'Role changes require server authorization.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Enable Row-Level Security
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.lots enable row level security;
alter table public.bids enable row level security;

-- Profiles RLS
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Site Settings RLS
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Lots RLS
drop policy if exists "lots_public_read" on public.lots;
create policy "lots_public_read"
  on public.lots for select
  using (true);

drop policy if exists "lots_admin_write" on public.lots;
create policy "lots_admin_write"
  on public.lots for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bids RLS (reads allowed for authenticated users and public desk transparency; writes only via atomic RPC)
drop policy if exists "bids_read_all" on public.bids;
create policy "bids_read_all"
  on public.bids for select
  using (true);

-- Atomic Bid Placement RPC (prevents race conditions & enforces strictly > current highest bid)
create or replace function public.place_bid(p_lot_id text, p_amount_per_kg integer)
returns public.bids
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot public.lots;
  v_profile public.profiles;
  v_current_high integer;
  v_inserted public.bids;
begin
  if auth.uid() is null then
    raise exception 'Authentication required to place a bid.';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Profile not found.';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'Lot not found.';
  end if;

  if v_lot.status <> 'open' or v_lot.ends_at <= now() then
    raise exception 'Bidding is closed on this lot.';
  end if;

  select coalesce(max(amount_per_kg), 0) into v_current_high
  from public.bids where lot_id = p_lot_id;

  if p_amount_per_kg is null or p_amount_per_kg <= v_current_high then
    raise exception 'Bid must be higher than current highest bid (₹%/kg).', v_current_high;
  end if;

  insert into public.bids (lot_id, bidder_id, vendor_label, amount_per_kg)
  values (
    p_lot_id,
    auth.uid(),
    coalesce(nullif(v_profile.vendor_code, ''), 'Vendor #' || upper(substr(auth.uid()::text, 1, 4))),
    p_amount_per_kg
  )
  returning * into v_inserted;

  return v_inserted;
end;
$$;

-- Admin-only RPC: Lock Deal on Highest Bidder
create or replace function public.lock_deal(p_lot_id text)
returns public.lots
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot public.lots;
  v_top public.bids;
  v_now text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  v_timeline jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin privileges required.';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'Lot not found.';
  end if;
  if v_lot.status <> 'open' then
    raise exception 'Lot is already locked.';
  end if;

  select * into v_top from public.bids
  where lot_id = p_lot_id
  order by amount_per_kg desc, created_at asc
  limit 1;

  if not found then
    raise exception 'Cannot lock deal before any bid is placed.';
  end if;

  select jsonb_agg(
    case
      when elem->>'key' = 'locked' then
        jsonb_set(
          jsonb_set(elem, '{completedAt}', to_jsonb(v_now)),
          '{statusLine}',
          to_jsonb('Locked to ' || v_top.vendor_label || ' at ₹' || v_top.amount_per_kg || '/kg')
        )
      else elem
    end
  ) into v_timeline
  from jsonb_array_elements(v_lot.timeline) as elem;

  update public.lots
  set status = 'qc_pending',
      winning_vendor_id = v_top.vendor_label,
      winning_bid_per_kg = v_top.amount_per_kg,
      timeline = coalesce(v_timeline, v_lot.timeline)
  where id = p_lot_id
  returning * into v_lot;

  return v_lot;
end;
$$;

revoke all on function public.place_bid(text, integer) from public;
grant execute on function public.place_bid(text, integer) to authenticated;

revoke all on function public.lock_deal(text) from public;
grant execute on function public.lock_deal(text) to authenticated;

-- Storage Bucket for Produce Lot Photos
insert into storage.buckets (id, name, public)
values ('lot-images', 'lot-images', true)
on conflict (id) do nothing;

drop policy if exists "lot_images_public_read" on storage.objects;
create policy "lot_images_public_read"
  on storage.objects for select
  using (bucket_id = 'lot-images');

drop policy if exists "lot_images_admin_insert" on storage.objects;
create policy "lot_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'lot-images' and public.is_admin());

drop policy if exists "lot_images_admin_update" on storage.objects;
create policy "lot_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'lot-images' and public.is_admin())
  with check (bucket_id = 'lot-images' and public.is_admin());

drop policy if exists "lot_images_admin_delete" on storage.objects;
create policy "lot_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'lot-images' and public.is_admin());

-- Enable Realtime on core trading tables
alter publication supabase_realtime add table public.lots;
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.site_settings;
