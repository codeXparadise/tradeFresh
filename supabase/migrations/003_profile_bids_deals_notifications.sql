-- Migration 003: Profile details, Bid read status, Notifications & Enhanced Deal Lock
alter table public.profiles
  add column if not exists phone text not null default '',
  add column if not exists address text not null default '',
  add column if not exists city text not null default '',
  add column if not exists gst_number text not null default '',
  add column if not exists account_status text not null default 'active' check (account_status in ('active', 'deleted'));

alter table public.bids
  add column if not exists is_read boolean not null default false;

create policy "bids_admin_update_read"
  on public.bids for update
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vendor_code text not null default '',
  lot_id text references public.lots(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_admin_insert"
  on public.notifications for insert
  with check (public.is_admin());

create or replace function public.lock_deal(p_lot_id text)
returns public.lots
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot public.lots;
  v_top public.bids;
  v_winner_profile public.profiles;
  v_now text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  v_timeline jsonb;
  v_delivery_addr text;
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

  v_delivery_addr := v_lot.delivery_address;
  if v_top.bidder_id is not null then
    select * into v_winner_profile from public.profiles where id = v_top.bidder_id;
    if found and length(trim(v_winner_profile.address)) > 0 then
      v_delivery_addr := trim(v_winner_profile.address) ||
        case when length(trim(v_winner_profile.city)) > 0 then ', ' || trim(v_winner_profile.city) else '' end;
    end if;
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
      delivery_address = v_delivery_addr,
      timeline = coalesce(v_timeline, v_lot.timeline)
  where id = p_lot_id
  returning * into v_lot;

  if v_top.bidder_id is not null then
    insert into public.notifications (user_id, vendor_code, lot_id, title, message)
    values (
      v_top.bidder_id,
      v_top.vendor_label,
      v_lot.id,
      'Deal locked: ' || v_lot.produce || ' (' || v_lot.lot_code || ')',
      'Your winning bid of ₹' || v_top.amount_per_kg || '/kg for ' || v_lot.quantity_kg || ' kg has been locked by the trader.'
    );
  end if;

  return v_lot;
end;
$$;

alter publication supabase_realtime add table public.notifications;
