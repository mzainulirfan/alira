-- ============================================================
-- Dashboard quick actions configuration
-- ============================================================

alter table public.pam_app_settings
add column if not exists quick_actions jsonb not null
default '["meter-readings", "payment-new", "customers"]'::jsonb;
