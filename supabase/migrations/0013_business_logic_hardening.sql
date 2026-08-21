-- 0013: Business logic hardening — due_date next-month, tariff filter, gap checks

-- 1) Due date should be next month, not same month (fix instantly overdue)
-- Patch pam_generate_bills: v_due_date = next month's due_day
create or replace function public.pam_generate_bills(
  p_period date,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tariff public.pam_tariffs%rowtype;
  v_reading public.pam_meter_readings%rowtype;
  v_due_day integer := 15;
  v_due_date date;
  v_water_amount numeric;
  v_expected_previous numeric;
  v_usage numeric;
  v_created integer := 0;
  v_total integer := 0;
  v_rows integer;
  v_period_next date;
begin
  if p_period is null or p_period <> date_trunc('month', p_period::timestamp)::date then
    raise exception 'Periode tagihan tidak valid.';
  end if;
  if not exists (
    select 1
    from public.pam_profiles
    where id = p_actor
      and status = 'active'
      and role in ('admin', 'treasurer')
  ) then
    raise exception 'Tidak memiliki akses untuk membuat tagihan.';
  end if;

  -- Only pick tariff whose effective_date <= today (or null) — ignore future tariffs
  select * into v_tariff
  from public.pam_tariffs
  where is_active = true
    and (effective_date is null or effective_date <= current_date)
  order by effective_date desc nulls last, created_at desc
  limit 1
  for update;
  if not found then
    raise exception 'Belum ada tarif aktif. Atur tarif terlebih dahulu di Pengaturan.';
  end if;

  select billing_due_day into v_due_day
  from public.pam_app_settings
  order by created_at
  limit 1;
  v_due_day := greatest(1, least(coalesce(v_due_day, 15), 28));
  -- Due next month to avoid instantly overdue
  v_period_next := (date_trunc('month', p_period::timestamp) + interval '1 month')::date;
  v_due_date := make_date(
    extract(year from v_period_next)::integer,
    extract(month from v_period_next)::integer,
    v_due_day
  );

  for v_reading in
    select *
    from public.pam_meter_readings
    where period = p_period
    order by customer_id
    for update
  loop
    v_total := v_total + 1;
    select current_reading into v_expected_previous
    from public.pam_meter_readings
    where customer_id = v_reading.customer_id and period < v_reading.period
    order by period desc
    limit 1;
    v_expected_previous := coalesce(v_expected_previous, 0);

    if v_reading.previous_reading <> v_expected_previous
      or v_reading.current_reading < v_reading.previous_reading
      or v_reading.usage <> v_reading.current_reading - v_reading.previous_reading
    then
      raise exception 'Rantai pencatatan meter pelanggan % perlu diperbaiki sebelum membuat tagihan.',
        v_reading.customer_id;
    end if;

    v_usage := v_reading.current_reading - v_reading.previous_reading;
    v_water_amount := round(v_usage * v_tariff.price_per_m3);

    insert into public.pam_bills (
      customer_id,
      meter_reading_id,
      period,
      usage,
      price_per_m3,
      water_amount,
      monthly_fee,
      total_amount,
      due_date,
      status
    ) values (
      v_reading.customer_id,
      v_reading.id,
      p_period,
      v_usage,
      v_tariff.price_per_m3,
      v_water_amount,
      v_tariff.monthly_fee,
      v_water_amount + v_tariff.monthly_fee,
      v_due_date,
      'unpaid'
    )
    on conflict (customer_id, period) do nothing;

    get diagnostics v_rows = row_count;
    v_created := v_created + v_rows;
  end loop;

  if v_total = 0 then
    raise exception 'Belum ada pencatatan meter pada periode ini.';
  end if;

  return jsonb_build_object(
    'created', v_created,
    'skipped', v_total - v_created
  );
end;
$$;

-- 2) Enforce single active tariff via partial unique index (if not already violated)
do $$
begin
  if not exists (
    select 1 from pg_class where relname = 'uq_pam_tariffs_single_active' and relkind = 'i'
  ) then
    -- Only create if at most one active tariff exists; otherwise warn via notice
    if (select count(*) from public.pam_tariffs where is_active = true) <= 1 then
      create unique index uq_pam_tariffs_single_active on public.pam_tariffs ((is_active)) where is_active = true;
    else
      raise notice 'Skip uq_pam_tariffs_single_active: multiple active tariffs exist — please deactivate extras manually';
    end if;
  end if;
end $$;

-- 3) Customer login hardening: reset failed_attempts after lock expiry (sync with staff logic)
create or replace function public.pam_register_customer_failed_login(
  p_customer_id uuid,
  p_expected_passcode_hash text,
  p_max_attempts int default 5,
  p_lock_minutes int default 15
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer record;
  v_new_attempts int;
  v_locked boolean := false;
  v_now timestamptz := clock_timestamp();
begin
  select id, passcode_hash, failed_attempts, locked_until
    into v_customer
    from pam_customers
    where id = p_customer_id
    for update;

  if not found then
    return jsonb_build_object('accepted', false);
  end if;

  if v_customer.passcode_hash is distinct from p_expected_passcode_hash then
    return jsonb_build_object('accepted', false);
  end if;

  if v_customer.locked_until is not null and v_customer.locked_until > v_now then
    return jsonb_build_object('accepted', true, 'locked', true, 'failed_attempts', v_customer.failed_attempts);
  end if;

  -- Reset counter if lock had expired (same as staff pam_register_failed_login)
  v_new_attempts := case
    when v_customer.locked_until is not null and v_customer.locked_until <= v_now then 1
    else coalesce(v_customer.failed_attempts, 0) + 1
  end;

  if v_new_attempts >= p_max_attempts then
    v_locked := true;
    update pam_customers
       set failed_attempts = v_new_attempts,
           locked_until = v_now + make_interval(mins => p_lock_minutes)
     where id = v_customer.id;
  else
    update pam_customers
       set failed_attempts = v_new_attempts,
           locked_until = null
     where id = v_customer.id;
  end if;

  return jsonb_build_object(
    'accepted', true,
    'failed_attempts', v_new_attempts,
    'locked', v_locked
  );
end;
$$;

revoke all on function public.pam_register_customer_failed_login(uuid, text, int, int) from public, anon, authenticated;
grant execute on function public.pam_register_customer_failed_login(uuid, text, int, int) to service_role;

revoke all on function public.pam_generate_bills(date, uuid) from public, anon, authenticated;
grant execute on function public.pam_generate_bills(date, uuid) to service_role;

notify pgrst, 'reload schema';
