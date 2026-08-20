-- Customer Portal Auth (Simple) — Migration 0010
-- Tambah kolom auth ke pam_customers + tabel log login

-- 1. Tambah kolom auth ke pam_customers
ALTER TABLE pam_customers
  ADD COLUMN IF NOT EXISTS passcode_hash TEXT,
  ADD COLUMN IF NOT EXISTS must_change_passcode BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_epoch UUID DEFAULT gen_random_uuid();

-- Update existing rows with random session_epoch
UPDATE pam_customers 
SET session_epoch = gen_random_uuid() 
WHERE session_epoch IS NULL;

-- 2. Index untuk login cepat (hanya pelanggan aktif)
CREATE INDEX IF NOT EXISTS idx_pam_customers_customer_number_active
  ON pam_customers (customer_number)
  WHERE status = 'active';

-- 3. Tabel log login pelanggan
CREATE TABLE IF NOT EXISTS pam_customer_login_logs (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES pam_customers(id) ON DELETE CASCADE,
  ip INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pam_customer_login_logs_customer_created
  ON pam_customer_login_logs (customer_id, created_at DESC);

-- 3b. Kunci tabel audit: RLS + cabut akses anon/authenticated
ALTER TABLE pam_customer_login_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE pam_customer_login_logs FROM anon, authenticated, PUBLIC;
REVOKE ALL ON SEQUENCE pam_customer_login_logs_id_seq FROM anon, authenticated, PUBLIC;

-- 4. Comment untuk dokumentasi
COMMENT ON COLUMN pam_customers.passcode_hash IS 'bcrypt hash of 6-digit passcode';
COMMENT ON COLUMN pam_customers.must_change_passcode IS 'Force change passcode on next login';
COMMENT ON COLUMN pam_customers.failed_attempts IS 'Counter for failed login attempts';
COMMENT ON COLUMN pam_customers.locked_until IS 'Lockout expiry after 5 failed attempts';
COMMENT ON COLUMN pam_customers.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN pam_customers.session_epoch IS 'Session epoch for token invalidation on login/logout/passcode change';
COMMENT ON TABLE pam_customer_login_logs IS 'Audit log for customer login attempts';