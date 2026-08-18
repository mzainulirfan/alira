import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { AppSettings, Tariff } from "@/lib/types";

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_app_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AppSettings;
});

export const getTariffs = cache(async (): Promise<Tariff[]> => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_tariffs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Tariff[];
});