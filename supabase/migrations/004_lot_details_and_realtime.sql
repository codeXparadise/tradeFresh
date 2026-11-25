-- Migration 004: Rich Lot Metadata (title, description, tags), Vendor-only Bid Guard & Realtime Full Identity
alter table public.lots
  add column if not exists title text not null default '',
  add column if not exists description text not null default '',
  add column if not exists tags text[] not null default '{}'::text[];

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

  if v_profile.role <> 'user' then
    raise exception 'Only vendor accounts can place bids. Admins manage ask prices and deal locks.';
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

alter table public.lots replica identity full;
alter table public.bids replica identity full;
alter table public.notifications replica identity full;
alter table public.site_settings replica identity full;
