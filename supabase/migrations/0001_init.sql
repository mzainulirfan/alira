-- ============================================================
-- PAM App - Initial Schema
-- Semua tabel diberi prefix `pam_` agar mudah dikenali dan
-- tidak bentrok dengan tabel internal Supabase (auth.*, storage.*)
-- ============================================================

-- ============================================================
-- pam_profiles
-- ============================================================
create table if not exists public.pam_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- pam_customers
-- ============================================================
create table if not exists public.pam_customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text not null unique,
  name text not null,
  phone text,
  address text,
  meter_number text,
  join_date date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- pam_meter_readings
-- ============================================================
create table if not exists public.pam_meter_readings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.pam_customers(id) on delete cascade,
  period date not null,
  previous_reading numeric not null default 0,
  current_reading numeric not null default 0,
  usage numeric not null default 0,
  photo_url text,
  recorded_by uuid,
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_id, period)
);

-- ============================================================
-- pam_tariffs
-- ============================================================
create table if not exists public.pam_tariffs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_per_m3 numeric not null default 0,
  monthly_fee numeric not null default 0,
  effective_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- pam_bills
-- ============================================================
create table if not exists public.pam_bills (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.pam_customers(id) on delete cascade,
  meter_reading_id uuid references public.pam_meter_readings(id) on delete set null,
  period date not null,
  usage numeric not null default 0,
  water_amount numeric not null default 0,
  monthly_fee numeric not null default 0,
  total_amount numeric not null default 0,
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'overdue', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, period)
);

-- ============================================================
-- pam_payments
-- ============================================================
create table if not exists public.pam_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.pam_bills(id) on delete cascade,
  customer_id uuid not null references public.pam_customers(id) on delete cascade,
  amount numeric not null default 0,
  payment_method text not null check (payment_method in ('cash', 'transfer')),
  payment_date timestamptz not null default now(),
  received_by uuid,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- pam_app_settings
-- ============================================================
create table if not exists public.pam_app_settings (
  id uuid primary key default gen_random_uuid(),
  pam_name text not null default 'Alira',
  address text,
  phone text,
  billing_due_day integer not null default 15,
  passcode_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Seed default app_settings (passcode akan diisi lewat UI setup)
-- ============================================================
insert into public.pam_app_settings (pam_name)
select 'Alira'
where not exists (select 1 from public.pam_app_settings);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.pam_profiles enable row level security;
alter table public.pam_customers enable row level security;
alter table public.pam_meter_readings enable row level security;
alter table public.pam_tariffs enable row level security;
alter table public.pam_bills enable row level security;
alter table public.pam_payments enable row level security;
alter table public.pam_app_settings enable row level security;

-- Auth passcode tidak memakai Supabase Auth, jadi service role
-- (server side) yang bertanggung jawab mengakses data.
-- RLS tetap diaktifkan sebagai lapisan keamanan tambahan.

-- Index untuk performa
create index if not exists idx_pam_customers_number on public.pam_customers (customer_number);
create index if not exists idx_pam_meter_readings_customer_period on public.pam_meter_readings (customer_id, period);
create index if not exists idx_pam_bills_customer_period on public.pam_bills (customer_id, period);
create index if not exists idx_pam_bills_status on public.pam_bills (status);
create index if not exists idx_pam_payments_bill on public.pam_payments (bill_id);