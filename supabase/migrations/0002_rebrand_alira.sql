-- ============================================================
-- Rebranding: PAM Kita → Alira
-- ============================================================
update public.pam_app_settings
set pam_name = 'Alira', updated_at = now()
where pam_name = 'PAM Kita';
