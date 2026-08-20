-- Customer Login Logs — RLS & revoke akses anon/authenticated
-- Fix keamanan: pam_customer_login_logs dibuat di 0010 tanpa RLS,
-- sehingga default PUBLIC grants memungkinkan anon/authenticated membaca,
-- menulis, dan menghapus audit log login pelanggan lewat REST API.

-- 1. Aktifkan RLS (deny-by-default untuk semua role non-service)
ALTER TABLE pam_customer_login_logs ENABLE ROW LEVEL SECURITY;

-- 2. Cabut hak akses default (PUBLIC grants ke anon/authenticated)
REVOKE ALL ON TABLE pam_customer_login_logs FROM anon, authenticated, PUBLIC;
REVOKE ALL ON SEQUENCE pam_customer_login_logs_id_seq FROM anon, authenticated, PUBLIC;