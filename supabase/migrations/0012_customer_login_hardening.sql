-- Customer login hardening — atomic failed-attempt counter + hash guard
-- Fix: penghitung kegagalan login sebelumnya di-increment di aplikasi secara
-- read-modify-write non-atomik (race condition memungkinkan brute force lolos
-- dari lockout) dan tanpa hash-guard (attacker bisa mengunci akun orang lain
-- cukup dengan 5x passcode salah). RPC ini melakukan SELECT ... FOR UPDATE dan
-- hanya menambah counter jika pemanggil menyerahkan passcode_hash asli.

CREATE OR REPLACE FUNCTION pam_register_customer_failed_login(
  p_customer_id uuid,
  p_expected_passcode_hash text,
  p_max_attempts int DEFAULT 5,
  p_lock_minutes int DEFAULT 15
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer record;
  v_new_attempts int;
  v_locked boolean := false;
BEGIN
  SELECT id, passcode_hash, failed_attempts
    INTO v_customer
    FROM pam_customers
    WHERE id = p_customer_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('accepted', false);
  END IF;

  -- Hash-guard: hanya increment jika pemanggil tahu passcode_hash asli.
  -- Ini mencegah attacker mengunci akun tanpa mengetahui passcode.
  IF v_customer.passcode_hash IS DISTINCT FROM p_expected_passcode_hash THEN
    RETURN jsonb_build_object('accepted', false);
  END IF;

  v_new_attempts := coalesce(v_customer.failed_attempts, 0) + 1;

  IF v_new_attempts >= p_max_attempts THEN
    v_locked := true;
    UPDATE pam_customers
       SET failed_attempts = v_new_attempts,
           locked_until = now() + make_interval(mins => p_lock_minutes)
     WHERE id = v_customer.id;
  ELSE
    UPDATE pam_customers
       SET failed_attempts = v_new_attempts
     WHERE id = v_customer.id;
  END IF;

  RETURN jsonb_build_object(
    'accepted', true,
    'failed_attempts', v_new_attempts,
    'locked', v_locked
  );
END;
$$;

REVOKE ALL ON FUNCTION pam_register_customer_failed_login(uuid, text, int, int)
  FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION pam_register_customer_failed_login(uuid, text, int, int)
  TO service_role;