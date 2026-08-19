-- ============================================================
-- Atomic financial/meter operations and session hardening
-- ============================================================

alter table public.pam_profiles
  add column if not exists session_epoch uuid not null default gen_random_uuid();

alter table public.pam_bills
  add column if not exists price_per_m3 numeric;

alter table public.pam_meter_readings
  add column if not exists photo_path text;

update public.pam_meter_readings
set photo_path = substring(photo_url from '/object/public/meter-photos/(.*)$')
where photo_path is null
  and photo_url like '%/object/public/meter-photos/%';

update storage.buckets
set public = false
where id in ('meter-photos', 'expense-receipts');

alter table public.pam_profiles
  add constraint pam_profiles_failed_attempts_nonnegative
  check (failed_attempts >= 0) not valid;

alter table public.pam_meter_readings
  add constraint pam_meter_readings_month_period_check
  check (period = date_trunc('month', period::timestamp)::date) not valid;

alter table public.pam_meter_readings
  add constraint pam_meter_readings_values_check
  check (
    previous_reading >= 0
    and current_reading >= previous_reading
    and usage = current_reading - previous_reading
  ) not valid;

alter table public.pam_payments
  add constraint pam_payments_amount_positive_check
  check (amount > 0) not valid;

do $$
begin
  if not exists (
    select 1 from public.pam_profiles where failed_attempts < 0
  ) then
    alter table public.pam_profiles
      validate constraint pam_profiles_failed_attempts_nonnegative;
  end if;

  if not exists (
    select 1
    from public.pam_meter_readings
    where period <> date_trunc('month', period::timestamp)::date
  ) then
    alter table public.pam_meter_readings
      validate constraint pam_meter_readings_month_period_check;
  end if;

  if not exists (
    select 1
    from public.pam_meter_readings
    where previous_reading < 0
      or current_reading < previous_reading
      or usage <> current_reading - previous_reading
  ) then
    alter table public.pam_meter_readings
      validate constraint pam_meter_readings_values_check;
  end if;

  if not exists (
    select 1 from public.pam_payments where amount <= 0
  ) then
    alter table public.pam_payments
      validate constraint pam_payments_amount_positive_check;
  end if;

  if not exists (
    select 1
    from public.pam_payments
    group by bill_id
    having count(*) > 1
  ) then
    create unique index if not exists uq_pam_payments_bill
      on public.pam_payments (bill_id);
  end if;

  if not exists (
    select 1
    from public.pam_bills
    where meter_reading_id is not null
    group by meter_reading_id
    having count(*) > 1
  ) then
    create unique index if not exists uq_pam_bills_meter_reading
      on public.pam_bills (meter_reading_id)
      where meter_reading_id is not null;
  end if;
end;
$$;

create or replace function public.pam_create_meter_reading(
  p_customer_id uuid,
  p_period date,
  p_current_reading numeric,
  p_photo_url text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reading_id uuid;
  v_previous_reading numeric := 0;
  v_usage numeric;
begin
  if p_period is null or p_period <> date_trunc('month', p_period::timestamp)::date then
    raise exception 'Periode pencatatan tidak valid.';
  end if;
  if p_current_reading is null or p_current_reading < 0 then
    raise exception 'Angka meter sekarang tidak valid.';
  end if;
  if not exists (
    select 1
    from public.pam_profiles
    where id = p_actor
      and status = 'active'
      and role in ('admin', 'meter_reader')
  ) then
    raise exception 'Tidak memiliki akses untuk mencatat meter.';
  end if;

  perform 1
  from public.pam_customers
  where id = p_customer_id and status = 'active'
  for update;
  if not found then
    raise exception 'Pelanggan aktif tidak ditemukan.';
  end if;

  if exists (
    select 1
    from public.pam_meter_readings
    where customer_id = p_customer_id and period >= p_period
  ) then
    raise exception 'Pencatatan harus ditambahkan setelah periode terakhir pelanggan.';
  end if;

  select current_reading
  into v_previous_reading
  from public.pam_meter_readings
  where customer_id = p_customer_id and period < p_period
  order by period desc
  limit 1;

  v_previous_reading := coalesce(v_previous_reading, 0);
  if p_current_reading < v_previous_reading then
    raise exception 'Meter sekarang tidak boleh lebih kecil dari meter sebelumnya (%).',
      v_previous_reading;
  end if;
  v_usage := p_current_reading - v_previous_reading;

  insert into public.pam_meter_readings (
    customer_id,
    period,
    previous_reading,
    current_reading,
    usage,
    photo_path,
    photo_url,
    recorded_by,
    recorded_at
  ) values (
    p_customer_id,
    p_period,
    v_previous_reading,
    p_current_reading,
    v_usage,
    p_photo_url,
    null,
    p_actor,
    now()
  )
  returning id into v_reading_id;

  return jsonb_build_object(
    'id', v_reading_id,
    'previous_reading', v_previous_reading,
    'usage', v_usage
  );
end;
$$;

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
set search_path = ''
as $$
declare
  v_customer_id uuid;
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
  if p_current_reading is null or p_current_reading < 0 then
    raise exception 'Angka meter sekarang tidak valid.';
  end if;
  if not exists (
    select 1
    from public.pam_profiles
    where id = p_actor
      and status = 'active'
      and role in ('admin', 'meter_reader')
  ) then
    raise exception 'Tidak memiliki akses untuk merevisi meter.';
  end if;

  select customer_id into v_customer_id
  from public.pam_meter_readings
  where id = p_reading_id;
  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;

  perform 1 from public.pam_customers where id = v_customer_id for update;

  select * into v_reading
  from public.pam_meter_readings
  where id = p_reading_id
  for update;
  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;
  if exists (
    select 1
    from public.pam_meter_readings
    where customer_id = v_reading.customer_id and period > v_reading.period
  ) then
    raise exception 'Hanya pencatatan terbaru yang dapat direvisi.';
  end if;
  if p_current_reading < v_reading.previous_reading then
    raise exception 'Meter sekarang tidak boleh lebih kecil dari meter sebelumnya.';
  end if;

  select * into v_bill
  from public.pam_bills
  where customer_id = v_reading.customer_id and period = v_reading.period
  for update;
  if found and (
    v_bill.status = 'paid'
    or exists (select 1 from public.pam_payments where bill_id = v_bill.id)
  ) then
    raise exception 'Pencatatan tidak dapat direvisi karena tagihan sudah dibayar.';
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
      photo_path = case when p_replace_photo then p_photo_url else photo_path end,
      photo_url = case when p_replace_photo then null else photo_url end,
      recorded_by = p_actor,
      recorded_at = now()
  where id = v_reading.id;

  if v_bill.id is not null then
    if v_bill.price_per_m3 is null then
      raise exception 'Tarif historis tagihan belum tersedia. Lengkapi price_per_m3 sebelum merevisi.';
    end if;
    v_price_per_m3 := v_bill.price_per_m3;
    v_water_amount := round(v_usage * v_price_per_m3);

    update public.pam_bills
    set usage = v_usage,
        price_per_m3 = v_price_per_m3,
        water_amount = v_water_amount,
        total_amount = v_water_amount + v_bill.monthly_fee,
        updated_at = now()
    where id = v_bill.id;
    v_bill_updated := true;
  end if;

  return jsonb_build_object(
    'usage', v_usage,
    'bill_updated', v_bill_updated,
    'previous_photo_path', v_reading.photo_path
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
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_reading public.pam_meter_readings%rowtype;
  v_bill public.pam_bills%rowtype;
  v_bill_deleted boolean := false;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'Alasan pembatalan minimal 3 karakter.';
  end if;
  if not exists (
    select 1
    from public.pam_profiles
    where id = p_actor
      and status = 'active'
      and role in ('admin', 'meter_reader')
  ) then
    raise exception 'Tidak memiliki akses untuk membatalkan meter.';
  end if;

  select customer_id into v_customer_id
  from public.pam_meter_readings
  where id = p_reading_id;
  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;

  perform 1 from public.pam_customers where id = v_customer_id for update;

  select * into v_reading
  from public.pam_meter_readings
  where id = p_reading_id
  for update;
  if not found then
    raise exception 'Pencatatan meter tidak ditemukan.';
  end if;
  if exists (
    select 1
    from public.pam_meter_readings
    where customer_id = v_reading.customer_id and period > v_reading.period
  ) then
    raise exception 'Hanya pencatatan terbaru yang dapat dibatalkan.';
  end if;

  select * into v_bill
  from public.pam_bills
  where customer_id = v_reading.customer_id and period = v_reading.period
  for update;
  if found and (
    v_bill.status = 'paid'
    or exists (select 1 from public.pam_payments where bill_id = v_bill.id)
  ) then
    raise exception 'Pencatatan tidak dapat dibatalkan karena tagihan sudah dibayar.';
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
  return jsonb_build_object(
    'bill_deleted', v_bill_deleted,
    'photo_path', v_reading.photo_path
  );
end;
$$;

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

  select * into v_tariff
  from public.pam_tariffs
  where is_active = true
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
  v_due_date := make_date(
    extract(year from p_period)::integer,
    extract(month from p_period)::integer,
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

create or replace function public.pam_record_payment(
  p_bill_id uuid,
  p_expected_amount numeric,
  p_payment_method text,
  p_payment_date date,
  p_notes text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bill public.pam_bills%rowtype;
  v_payment_id uuid;
begin
  if p_expected_amount is null or p_expected_amount <= 0 then
    raise exception 'Nominal pembayaran tidak valid.';
  end if;
  if p_payment_method is null or p_payment_method not in ('cash', 'transfer') then
    raise exception 'Metode pembayaran tidak valid.';
  end if;
  if not exists (
    select 1
    from public.pam_profiles
    where id = p_actor
      and status = 'active'
      and role in ('admin', 'treasurer')
  ) then
    raise exception 'Tidak memiliki akses untuk mencatat pembayaran.';
  end if;

  select * into v_bill
  from public.pam_bills
  where id = p_bill_id
  for update;
  if not found then
    raise exception 'Tagihan tidak ditemukan.';
  end if;
  if v_bill.status not in ('unpaid', 'overdue') then
    raise exception 'Tagihan ini tidak dapat dibayar.';
  end if;
  if p_expected_amount <> v_bill.total_amount then
    raise exception 'Nominal pembayaran harus sama dengan total tagihan.';
  end if;
  if exists (select 1 from public.pam_payments where bill_id = v_bill.id) then
    raise exception 'Pembayaran untuk tagihan ini sudah tercatat.';
  end if;

  insert into public.pam_payments (
    bill_id,
    customer_id,
    amount,
    payment_method,
    payment_date,
    received_by,
    notes
  ) values (
    v_bill.id,
    v_bill.customer_id,
    v_bill.total_amount,
    p_payment_method,
    coalesce(p_payment_date, current_date),
    p_actor,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_payment_id;

  update public.pam_bills
  set status = 'paid', updated_at = now()
  where id = v_bill.id;

  return jsonb_build_object('payment_id', v_payment_id);
end;
$$;

create or replace function public.pam_register_failed_login(
  p_profile_id uuid,
  p_expected_passcode_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.pam_profiles%rowtype;
  v_now timestamptz := clock_timestamp();
  v_attempts integer;
  v_locked_until timestamptz;
begin
  select * into v_profile
  from public.pam_profiles
  where id = p_profile_id
  for update;

  if not found
    or v_profile.status <> 'active'
    or v_profile.passcode_hash is distinct from p_expected_passcode_hash
  then
    return jsonb_build_object('accepted', false, 'locked', false);
  end if;

  if v_profile.locked_until is not null and v_profile.locked_until > v_now then
    return jsonb_build_object(
      'accepted', true,
      'locked', true,
      'failed_attempts', v_profile.failed_attempts
    );
  end if;

  v_attempts := case
    when v_profile.locked_until is not null and v_profile.locked_until <= v_now then 1
    else v_profile.failed_attempts + 1
  end;
  v_locked_until := case
    when v_attempts >= 5 then v_now + interval '15 minutes'
    else null
  end;

  update public.pam_profiles
  set failed_attempts = v_attempts,
      locked_until = v_locked_until,
      updated_at = v_now
  where id = v_profile.id;

  return jsonb_build_object(
    'accepted', true,
    'locked', v_locked_until is not null,
    'failed_attempts', v_attempts
  );
end;
$$;

create or replace function public.pam_complete_login(
  p_profile_id uuid,
  p_expected_passcode_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.pam_profiles%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  select * into v_profile
  from public.pam_profiles
  where id = p_profile_id
  for update;

  if not found
    or v_profile.status <> 'active'
    or v_profile.role not in ('admin', 'treasurer', 'meter_reader')
    or v_profile.passcode_hash is distinct from p_expected_passcode_hash
  then
    return jsonb_build_object('success', false, 'locked', false);
  end if;
  if v_profile.locked_until is not null and v_profile.locked_until > v_now then
    return jsonb_build_object('success', false, 'locked', true);
  end if;

  update public.pam_profiles
  set failed_attempts = 0,
      locked_until = null,
      last_login_at = v_now,
      updated_at = v_now
  where id = v_profile.id;

  return jsonb_build_object(
    'success', true,
    'role', v_profile.role,
    'must_change_passcode', v_profile.must_change_passcode,
    'session_epoch', v_profile.session_epoch
  );
end;
$$;

revoke all on function public.pam_create_meter_reading(
  uuid, date, numeric, text, uuid
) from public, anon, authenticated;
revoke all on function public.pam_revise_meter_reading(
  uuid, numeric, text, boolean, text, uuid, numeric
) from public, anon, authenticated;
revoke all on function public.pam_cancel_meter_reading(
  uuid, text, uuid
) from public, anon, authenticated;
revoke all on function public.pam_generate_bills(
  date, uuid
) from public, anon, authenticated;
revoke all on function public.pam_record_payment(
  uuid, numeric, text, date, text, uuid
) from public, anon, authenticated;
revoke all on function public.pam_register_failed_login(
  uuid, text
) from public, anon, authenticated;
revoke all on function public.pam_complete_login(
  uuid, text
) from public, anon, authenticated;

grant execute on function public.pam_create_meter_reading(
  uuid, date, numeric, text, uuid
) to service_role;
grant execute on function public.pam_revise_meter_reading(
  uuid, numeric, text, boolean, text, uuid, numeric
) to service_role;
grant execute on function public.pam_cancel_meter_reading(
  uuid, text, uuid
) to service_role;
grant execute on function public.pam_generate_bills(
  date, uuid
) to service_role;
grant execute on function public.pam_record_payment(
  uuid, numeric, text, date, text, uuid
) to service_role;
grant execute on function public.pam_register_failed_login(
  uuid, text
) to service_role;
grant execute on function public.pam_complete_login(
  uuid, text
) to service_role;

notify pgrst, 'reload schema';
