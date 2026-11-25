# Supabase Production Setup — Trade Fresh

## 1. Create Project & Configure `.env`
1. Create a new project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` in `c:\Users\smart\tradeFresh\.env`:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
   ADMIN_INVITE_CODE=TF-ADMIN-2026
   AUTH_HMAC_SECRET=replace-with-random-64-char-hex
   ALLOWED_ORIGIN=http://localhost:5173,http://localhost:4000
   PORT=4000
   ```

## 2. Run Database Schema & Seed SQL
1. Open **SQL Editor** in your Supabase Dashboard.
2. Paste and execute [supabase/migrations/001_initial_schema.sql](file:///c:/Users/smart/tradeFresh/supabase/migrations/001_initial_schema.sql).
   - Creates `profiles`, `site_settings`, `lots`, `bids`, `lot-images` Storage bucket, RLS policies, privilege-escalation protection triggers, and atomic RPCs (`place_bid`, `lock_deal`).
3. Paste and execute [supabase/seed.sql](file:///c:/Users/smart/tradeFresh/supabase/seed.sql) to populate initial mandi lots and homepage settings.

## 3. Provision Your First Admin (Trader) Account
Either:
- Register on `/auth` under the **Admin (Trader)** tab using your `ADMIN_INVITE_CODE` (default in `.env.example`: `TF-ADMIN-2026`), **OR**
- Register a normal user on `/auth` and promote them in SQL Editor:
  ```sql
  update public.profiles set role = 'admin' where email = 'trader@yourdomain.com';
  ```

## 4. Run Locally / Build for Production
```bash
npm run dev      # Express 5 security API (4000) + Vite client (5173)
npm run build    # Type-check + Vite production bundle
npm start        # Express 5 serving API + compiled dist/
```
