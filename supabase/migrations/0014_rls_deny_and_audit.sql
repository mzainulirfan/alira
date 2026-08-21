-- 0014: RLS deny-by-default (defense in depth) + audit hardening
-- Semua tabel pam_* sudah ENABLE RLS di 0001, tapi tanpa policy (service_role bypass tetap jalan).
-- Tambah deny policy untuk anon/authenticated agar direct PostgREST via anon key tidak bocor jika
-- service_role leak atau RLS misconfig. Juga pastikan pam_expenses ikut.

-- Pastikan semua tabel audit ikut RLS
alter table public.pam_expenses enable row level security;
alter table public.pam_meter_reading_revisions enable row level security;

-- Helper: buat deny policy jika belum ada (anon + authenticated = no access)
do $$
declare
  t text;
  tables text[] := array[
    'pam_profiles',
    'pam_customers',
    'pam_meter_readings',
    'pam_meter_reading_revisions',
    'pam_tariffs',
    'pam_bills',
    'pam_payments',
    'pam_expenses',
    'pam_app_settings',
    'pam_customer_login_logs'
  ];
  pol text;
begin
  foreach t in array tables loop
    -- anon deny
    pol := 'deny_' || t || '_anon';
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=pol) then
      execute format('create policy %I on public.%I for all to anon using (false) with check (false)', pol, t);
    end if;
    -- authenticated deny (Supabase Auth tidak dipakai, jadi block)
    pol := 'deny_' || t || '_authenticated';
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=pol) then
      execute format('create policy %I on public.%I for all to authenticated using (false) with check (false)', pol, t);
    end if;
  end loop;
end $$;

-- Pastikan storage.objects juga tidak public untuk buckets sensitif (sudah di 0008: public=false)
-- Tambah revoke eksplisit untuk anon/authenticated pada tabel (jaga bila policy di-drop)
do $$
declare t text;
begin
  foreach t in array array['pam_profiles','pam_customers','pam_meter_readings','pam_meter_reading_revisions','pam_tariffs','pam_bills','pam_payments','pam_expenses','pam_app_settings','pam_customer_login_logs'] loop
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
