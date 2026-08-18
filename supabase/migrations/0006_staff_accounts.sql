-- ============================================================
-- Individual staff accounts and roles
-- ============================================================

alter table public.pam_profiles
  add column if not exists username text,
  add column if not exists passcode_hash text,
  add column if not exists status text not null default 'active',
  add column if not exists must_change_passcode boolean not null default true,
  add column if not exists failed_attempts integer not null default 0,
  add column if not exists locked_until timestamptz,
  add column if not exists last_login_at timestamptz;

alter table public.pam_profiles
  drop constraint if exists pam_profiles_role_check;

update public.pam_profiles
set role = 'meter_reader'
where role = 'staff';

alter table public.pam_profiles
  add constraint pam_profiles_role_check
  check (role in ('admin', 'treasurer', 'meter_reader'));

alter table public.pam_profiles
  add constraint pam_profiles_status_check
  check (status in ('active', 'inactive'));

create unique index if not exists idx_pam_profiles_username_lower
  on public.pam_profiles (lower(username));

create index if not exists idx_pam_profiles_status_role
  on public.pam_profiles (status, role);

insert into public.pam_profiles (
  name,
  username,
  role,
  status,
  passcode_hash,
  must_change_passcode
)
select
  'Administrator',
  'admin',
  'admin',
  'active',
  passcode_hash,
  false
from public.pam_app_settings
where passcode_hash is not null
  and not exists (
    select 1
    from public.pam_profiles
    where lower(username) = 'admin'
  );
