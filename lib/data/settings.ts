import "server-only";

import { cache } from "react";
import { requireRole, verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { AppSettings, Tariff } from "@/lib/types";
import { ADMIN_ROLES } from "@/lib/staff";

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_app_settings")
    .select(
      "id, pam_name, address, phone, billing_due_day, quick_actions, created_at, updated_at"
    )
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AppSettings;
});

export const getTariffs = cache(async (): Promise<Tariff[]> => {
  await requireRole(ADMIN_ROLES);
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_tariffs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Tariff[];
});
