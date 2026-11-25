-- Revoke anonymous / public RPC execution on trigger & auth-only functions
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on function public.place_bid(text, integer) from public, anon;
grant execute on function public.place_bid(text, integer) to authenticated;

revoke all on function public.lock_deal(text) from public, anon;
grant execute on function public.lock_deal(text) to authenticated;
