-- ============================================================
-- Perf: index untuk query yang memfilter per periode/status
-- ============================================================

-- Halaman Pencatatan Meter, Dashboard, Laporan, dan generate tagihan
-- banyak memfilter pam_meter_readings per `period`. Index lama
-- (customer_id, period) tidak bisa dipakai karena kolom depannya
-- bukan `period`.
create index if not exists idx_pam_meter_readings_period
  on public.pam_meter_readings (period);

-- Halaman Tagihan, Dashboard, dan Laporan memfilter pam_bills per
-- `period`. Sama seperti di atas, perlu index sendiri untuk `period`.
create index if not exists idx_pam_bills_period
  on public.pam_bills (period);

-- getRecentPayments mengurutkan berdasarkan payment_date (limit 50).
create index if not exists idx_pam_payments_payment_date
  on public.pam_payments (payment_date);

-- getActiveCustomers memfilter status + urut customer_number.
create index if not exists idx_pam_customers_status_number
  on public.pam_customers (status, customer_number);
