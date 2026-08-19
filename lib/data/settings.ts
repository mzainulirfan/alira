import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { requireRole, verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { AppSettings, Tariff } from "@/lib/types";
import { ADMIN_ROLES } from "@/lib/staff";

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  await verifySession();
  return getCachedAppSettings();
});

const getCachedAppSettings = unstable_cache(
  async (): Promise<AppSettings> => {
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
  },
  ["app-settings"],
  { tags: ["settings"], revalidate: 60 }
);

export const getTariffs = cache(async (): Promise<Tariff[]> => {
  await requireRole(ADMIN_ROLES);
  return getCachedTariffs();
});

const getCachedTariffs = unstable_cache(
  async (): Promise<Tariff[]> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_tariffs")
      .select("id, name, price_per_m3, monthly_fee, effective_date, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Tariff[];
  },
  ["tariffs-list"],
  { tags: ["tariffs"], revalidate: 60 }
);
