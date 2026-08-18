-- ============================================================
-- Operational expenses
-- ============================================================

create table if not exists public.pam_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  title text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  payee text,
  payment_method text not null
    check (payment_method in ('cash', 'transfer')),
  receipt_path text,
  receipt_url text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pam_expenses enable row level security;

create index if not exists idx_pam_expenses_date
  on public.pam_expenses (expense_date desc);

create index if not exists idx_pam_expenses_category_date
  on public.pam_expenses (category, expense_date desc);
