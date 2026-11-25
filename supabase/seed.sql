-- Trade Fresh Seed Data (run after 001_initial_schema.sql)

insert into public.site_settings (
  id,
  announcement_text,
  hero_headline,
  hero_subheadline,
  hero_cta_primary,
  hero_cta_secondary,
  hero_image_url
)
values (
  1,
  'Live Nashik & Lasalgaon morning arrivals open for vendor bidding.',
  'Fresh produce, decided by bids.',
  'Farm-sourced vegetable lots graded by the trader, priced with a clear ask, and locked to the highest vendor bid.',
  'Browse live lots',
  'Sign in / Register',
  '/images/hero-harvest.jpg'
)
on conflict (id) do update set
  announcement_text = excluded.announcement_text,
  hero_headline = excluded.hero_headline,
  hero_subheadline = excluded.hero_subheadline,
  hero_cta_primary = excluded.hero_cta_primary,
  hero_cta_secondary = excluded.hero_cta_secondary,
  hero_image_url = excluded.hero_image_url;

insert into public.lots (
  id, lot_code, produce, grade, quantity_kg, origin, farm_name, harvest_date,
  ask_price_per_kg, ends_at, status, image_url, featured_on_home,
  winning_vendor_id, winning_bid_per_kg, quality_report, delivery_address, trader_contact, timeline
)
values
(
  'lot-tomato-01',
  'TF-1042',
  'Tomato',
  'Grade A',
  800,
  'Nashik',
  'Sahyadri FPO · Plot 14',
  'Today, 05:30 AM',
  20,
  now() + interval '2 hours 14 minutes',
  'open',
  '/images/produce-tomato.jpg',
  true,
  null,
  null,
  '{"grade":"Grade A","moisturePct":93.4,"sizeGrading":"55–65 mm uniform","defectPct":1.8,"testedBy":"R. Deshmukh (Desk QC)","testedAt":"Today, 08:15 AM","outcome":"pass","photoNote":"Crate sample #1042-A verified under daylight bench"}'::jsonb,
  'Plot 18, Vashi APMC Vegetable Market, Navi Mumbai',
  '{"name":"Raghav Deshmukh","phone":"+91 98204 51190","hub":"Nashik Aggregation Yard"}'::jsonb,
  '[{"key":"locked","label":"Deal locked","completedAt":null,"statusLine":"Awaiting highest bid lock by trader"},{"key":"quality_checked","label":"Quality checked","completedAt":null,"statusLine":"Final pre-dispatch moisture and crate audit pending"},{"key":"dispatched","label":"Dispatched","completedAt":null,"statusLine":"Reefer van assignment queued"},{"key":"delivered","label":"Delivered","completedAt":null,"statusLine":"Pending vendor gate receipt"}]'::jsonb
),
(
  'lot-onion-02',
  'TF-1043',
  'Onion',
  'Grade B',
  1500,
  'Lasalgaon',
  'Godavari Growers Co-op',
  'Yesterday, 04:00 PM',
  18,
  now() + interval '45 minutes',
  'open',
  '/images/produce-onion.jpg',
  true,
  null,
  null,
  '{"grade":"Grade B","moisturePct":86.2,"sizeGrading":"45–55 mm cured","defectPct":3.4,"testedBy":"R. Deshmukh (Desk QC)","testedAt":"Today, 07:40 AM","outcome":"pass","photoNote":"Mesh sack lot #1043 dry-skin verified"}'::jsonb,
  'Unit 7, Azadpur Wholesale Yard, New Delhi',
  '{"name":"Raghav Deshmukh","phone":"+91 98204 51190","hub":"Lasalgaon Sorting Shed"}'::jsonb,
  '[{"key":"locked","label":"Deal locked","completedAt":null,"statusLine":"Awaiting highest bid lock by trader"},{"key":"quality_checked","label":"Quality checked","completedAt":null,"statusLine":"Final dispatch inspection pending"},{"key":"dispatched","label":"Dispatched","completedAt":null,"statusLine":"Transport queued"},{"key":"delivered","label":"Delivered","completedAt":null,"statusLine":"Pending vendor receipt"}]'::jsonb
),
(
  'lot-okra-03',
  'TF-1044',
  'Okra',
  'Grade A',
  300,
  'Pune',
  'Baramati Fresh Collective',
  'Today, 06:00 AM',
  35,
  now() + interval '4 hours 30 minutes',
  'open',
  '/images/produce-okra.jpg',
  true,
  null,
  null,
  '{"grade":"Grade A","moisturePct":89.1,"sizeGrading":"80–100 mm tender","defectPct":1.2,"testedBy":"A. Kulkarni (Desk QC)","testedAt":"Today, 09:05 AM","outcome":"pass","photoNote":"Ventilated crate sample #1044-B passed snap test"}'::jsonb,
  'Bay 12, Gultekdi Market Yard, Pune',
  '{"name":"Raghav Deshmukh","phone":"+91 98204 51190","hub":"Pune Cold Hub"}'::jsonb,
  '[{"key":"locked","label":"Deal locked","completedAt":null,"statusLine":"Awaiting highest bid lock by trader"},{"key":"quality_checked","label":"Quality checked","completedAt":null,"statusLine":"Pre-dispatch QC pending"},{"key":"dispatched","label":"Dispatched","completedAt":null,"statusLine":"Transport queued"},{"key":"delivered","label":"Delivered","completedAt":null,"statusLine":"Pending vendor receipt"}]'::jsonb
),
(
  'lot-potato-04',
  'TF-1045',
  'Potato',
  'Grade A',
  2000,
  'Indore',
  'Malwa Agro Farms',
  'Yesterday, 02:30 PM',
  16,
  now() + interval '3 hours 10 minutes',
  'open',
  '/images/produce-potato.jpg',
  false,
  null,
  null,
  '{"grade":"Grade A","moisturePct":78.5,"sizeGrading":"60+ mm washed","defectPct":1.9,"testedBy":"R. Deshmukh (Desk QC)","testedAt":"Today, 08:50 AM","outcome":"pass","photoNote":"Washed Chipsona batch #1045 inspected"}'::jsonb,
  'Gate 4, Devi Ahilya Mandi, Indore',
  '{"name":"Raghav Deshmukh","phone":"+91 98204 51190","hub":"Indore Aggregation Yard"}'::jsonb,
  '[{"key":"locked","label":"Deal locked","completedAt":null,"statusLine":"Awaiting highest bid lock"},{"key":"quality_checked","label":"Quality checked","completedAt":null,"statusLine":"Pre-dispatch audit pending"},{"key":"dispatched","label":"Dispatched","completedAt":null,"statusLine":"Transport queued"},{"key":"delivered","label":"Delivered","completedAt":null,"statusLine":"Pending vendor receipt"}]'::jsonb
),
(
  'lot-capsicum-05',
  'TF-1046',
  'Capsicum',
  'Grade A',
  450,
  'Kolar',
  'Nandi Polyhouse Growers',
  'Today, 05:00 AM',
  42,
  now() + interval '1 hour 50 minutes',
  'open',
  '/images/produce-capsicum.jpg',
  false,
  null,
  null,
  '{"grade":"Grade A","moisturePct":91.0,"sizeGrading":"150–180 g glossy green","defectPct":0.9,"testedBy":"A. Kulkarni (Desk QC)","testedAt":"Today, 09:20 AM","outcome":"pass","photoNote":"Corrugated carton lot #1046-C cold-chain ready"}'::jsonb,
  'Shop 29, Yeshwanthpur APMC, Bengaluru',
  '{"name":"Raghav Deshmukh","phone":"+91 98204 51190","hub":"Kolar Packhouse"}'::jsonb,
  '[{"key":"locked","label":"Deal locked","completedAt":null,"statusLine":"Awaiting highest bid lock"},{"key":"quality_checked","label":"Quality checked","completedAt":null,"statusLine":"Pre-dispatch audit pending"},{"key":"dispatched","label":"Dispatched","completedAt":null,"statusLine":"Transport queued"},{"key":"delivered","label":"Delivered","completedAt":null,"statusLine":"Pending vendor receipt"}]'::jsonb
)
on conflict (id) do nothing;

insert into public.bids (lot_id, vendor_label, amount_per_kg)
values
  ('lot-tomato-01', 'Vendor #B-14', 22),
  ('lot-tomato-01', 'Vendor #K-08', 21),
  ('lot-tomato-01', 'Vendor #M-22', 20),
  ('lot-onion-02', 'Vendor #S-19', 17),
  ('lot-okra-03', 'Vendor #B-14', 38),
  ('lot-potato-04', 'Vendor #M-22', 18),
  ('lot-capsicum-05', 'Vendor #K-08', 44);
