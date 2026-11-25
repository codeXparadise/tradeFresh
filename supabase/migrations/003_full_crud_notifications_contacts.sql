-- 003: Lot metadata (title, description, tags, shipping), notifications columns, and contact inquiries

alter table public.lots
  add column if not exists shipping_carrier text not null default '',
  add column if not exists vehicle_number text not null default '';

update public.lots set
  title = case id
    when 'lot-tomato-01' then 'Vine-Ripened Nashik Roma Tomatoes'
    when 'lot-onion-02' then 'Cured Lasalgaon Red Rabi Onions'
    when 'lot-okra-03' then 'Tender Baramati Green Okra'
    when 'lot-potato-04' then 'Washed Malwa Chipsona Potatoes'
    when 'lot-capsicum-05' then 'Polyhouse Kolar Green Capsicum'
    else produce || ' · ' || origin
  end,
  description = case id
    when 'lot-tomato-01' then 'Daylight-graded firm red tomatoes packed in 25 kg ventilated crates for regional mandi dispatch.'
    when 'lot-onion-02' then 'Dry-skin cured red onions packed in 50 kg mesh sacks ready for wholesale yard loading.'
    when 'lot-okra-03' then 'Early-morning snapped tender pods graded for zero-bruise retail and hotel supply.'
    when 'lot-potato-04' then 'Washed 60+ mm processing-grade tubers packed in breathable jute bags.'
    when 'lot-capsicum-05' then 'Glossy thick-walled polyhouse peppers packed in ventilated corrugated cartons.'
    else 'Direct farm-sourced vegetable lot graded by Trade Fresh desk.'
  end,
  tags = case id
    when 'lot-tomato-01' then array['Daylight QC', 'Ventilated Crates', 'Nashik FPO']
    when 'lot-onion-02' then array['Dry Cured', 'Mesh Sacks', 'Lasalgaon']
    when 'lot-okra-03' then array['Snap Tested', 'Cold Ready', 'Morning Harvest']
    when 'lot-potato-04' then array['Washed', '60mm+', 'Chipsona']
    when 'lot-capsicum-05' then array['Polyhouse', 'Export Grade', 'Kolar']
    else array['Farm Direct']
  end
where title = '';

alter table public.notifications
  add column if not exists recipient_role text not null default 'all',
  add column if not exists kind text not null default 'info';

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

create policy "contact_public_insert"
  on public.contact_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "contact_admin_select"
  on public.contact_inquiries for select
  to authenticated
  using (public.is_admin());
