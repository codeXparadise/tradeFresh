-- Migration 005: Custom Categories, Optional Subcategories, Custom Grades & Catalog Config

-- Allow admin-created custom categories & quality grades on lots
alter table public.lots drop constraint if exists lots_produce_check;
alter table public.lots drop constraint if exists lots_grade_check;

alter table public.lots
  add column if not exists sub_category text not null default '';

-- Store dynamic taxonomy (categories, subcategories toggle, custom grades, hero slides)
alter table public.site_settings
  add column if not exists catalog_config jsonb not null default '{}'::jsonb;
