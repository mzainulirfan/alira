import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/lib/staff";
import type { StaffProfile } from "@/lib/types";

const STAFF_COLUMNS =
  "id, username, name, role, status, must_change_passcode, failed_attempts, locked_until, last_login_at, created_at, updated_at";

export const getStaffProfiles = cache(async (): Promise<StaffProfile[]> => {
  await requireRole(ADMIN_ROLES);
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("pam_profiles")
    .select(STAFF_COLUMNS)
    .order("status", { ascending: true })
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  const now = Date.now();
  return ((data ?? []) as StaffProfile[]).map((profile) => ({
    ...profile,
    is_locked: profile.locked_until
      ? new Date(profile.locked_until).getTime() > now
      : false,
  }));
});

export const getStaffProfile = cache(
  async (id: string): Promise<StaffProfile | null> => {
    await requireRole(ADMIN_ROLES);
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("pam_profiles")
      .select(STAFF_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as StaffProfile | null;
  }
);
