-- ============================================================
-- Audited, transactional meter reading revisions
-- ============================================================

create table if not exists public.pam_meter_reading_revisions (
  id uuid primary key default gen_random_uuid(),
  meter_reading_id uuid not null,
  customer_id uuid not null references public.pam_customers(id) on delete cascade,
  period date not null,
  action text not null check (action in ('revised', 'cancelled')),
  reason text not null,
  old_current_reading numeric not null,
  new_current_reading numeric,
  revised_by uuid references public.pam_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pam_meter_reading_revisions_customer_period
  on public.pam_meter_reading_revisions (customer_id, period, created_at desc);

alter table public.pam_meter_reading_revisions enable row level security;

create or replace function public.pam_revise_meter_reading(
  p_reading_id uuid,
  p_current_reading numeric,
  p_photo_url text,
  p_replace_photo boolean,
  p_reason text,
  p_actor uuid,
  p_fallback_price_per_m3 numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reading public.pam_meter_readings%rowtype;
  v_bill public.pam_bills%rowtype;
  v_usage numeric;
  v_price_per_m3 numeric;
  v_water_amount numeric;
  v_bill_updated boolean := false;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'Alasan revisi minimal 3 karakter.';
  end if;

  select * into v_reading
  from public.pam_meter_readings
  where id = p_reading_id
  for update;

  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;
  if p_current_reading < v_reading.previous_reading then
    raise exception 'Meter sekarang tidak boleh lebih kecil dari meter sebelumnya.';
  end if;

  select * into v_bill
  from public.pam_bills
  where meter_reading_id = p_reading_id
  for update;

  if found then
    if v_bill.status = 'paid' or exists (
      select 1 from public.pam_payments where bill_id = v_bill.id
    ) then
      raise exception 'Pencatatan tidak dapat direvisi karena tagihan sudah dibayar.';
    end if;
  end if;

  v_usage := p_current_reading - v_reading.previous_reading;

  insert into public.pam_meter_reading_revisions (
    meter_reading_id,
    customer_id,
    period,
    action,
    reason,
    old_current_reading,
    new_current_reading,
    revised_by
  ) values (
    v_reading.id,
    v_reading.customer_id,
    v_reading.period,
    'revised',
    trim(p_reason),
    v_reading.current_reading,
    p_current_reading,
    p_actor
  );

  update public.pam_meter_readings
  set current_reading = p_current_reading,
      usage = v_usage,
      photo_url = case when p_replace_photo then p_photo_url else photo_url end,
      recorded_by = p_actor,
      recorded_at = now()
  where id = v_reading.id;

  if v_bill.id is not null then
    v_price_per_m3 := case
      when v_bill.usage > 0 then v_bill.water_amount / v_bill.usage
      else greatest(coalesce(p_fallback_price_per_m3, 0), 0)
    end;
    v_water_amount := round(v_usage * v_price_per_m3);

    update public.pam_bills
    set usage = v_usage,
        water_amount = v_water_amount,
        total_amount = v_water_amount + v_bill.monthly_fee,
        updated_at = now()
    where id = v_bill.id;
    v_bill_updated := true;
  end if;

  return jsonb_build_object(
    'usage', v_usage,
    'bill_updated', v_bill_updated
  );
end;
$$;

create or replace function public.pam_cancel_meter_reading(
  p_reading_id uuid,
  p_reason text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reading public.pam_meter_readings%rowtype;
  v_bill public.pam_bills%rowtype;
  v_bill_deleted boolean := false;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'Alasan pembatalan minimal 3 karakter.';
  end if;

  select * into v_reading
  from public.pam_meter_readings
  where id = p_reading_id
  for update;

  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;

  select * into v_bill
  from public.pam_bills
  where meter_reading_id = p_reading_id
  for update;

  if found then
    if v_bill.status = 'paid' or exists (
      select 1 from public.pam_payments where bill_id = v_bill.id
    ) then
      raise exception 'Pencatatan tidak dapat dibatalkan karena tagihan sudah dibayar.';
    end if;
  end if;

  insert into public.pam_meter_reading_revisions (
    meter_reading_id,
    customer_id,
    period,
    action,
    reason,
    old_current_reading,
    revised_by
  ) values (
    v_reading.id,
    v_reading.customer_id,
    v_reading.period,
    'cancelled',
    trim(p_reason),
    v_reading.current_reading,
    p_actor
  );

  if v_bill.id is not null then
    delete from public.pam_bills where id = v_bill.id;
    v_bill_deleted := true;
  end if;

  delete from public.pam_meter_readings where id = v_reading.id;

  return jsonb_build_object('bill_deleted', v_bill_deleted);
end;
$$;

revoke all on function public.pam_revise_meter_reading(
  uuid, numeric, text, boolean, text, uuid, numeric
) from public, anon, authenticated;
revoke all on function public.pam_cancel_meter_reading(
  uuid, text, uuid
) from public, anon, authenticated;

grant execute on function public.pam_revise_meter_reading(
  uuid, numeric, text, boolean, text, uuid, numeric
) to service_role;
grant execute on function public.pam_cancel_meter_reading(
  uuid, text, uuid
) to service_role;
