import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCustomerSession } from "@/lib/auth/customer-jwt";
import type { MeterReading } from "@/lib/types";

function noStoreHeaders(headers?: Record<string, string>): Record<string, string> {
  return { "Cache-Control": "private, no-store, max-age=0, must-revalidate", ...(headers ?? {}) };
}

function formatPeriodKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function subtractMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - count, 1);
}

function normalizePeriodFilter(period: string): string {
  return /^\d{4}-\d{2}$/.test(period) ? `${period}-01` : period;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_session")?.value;

  const tokenLegacy = cookieStore.get("customer_session")?.value ?? null;
  const tokenHost = cookieStore.get("__Host-customer_session")?.value ?? null;
  const rawToken = token ?? tokenLegacy ?? tokenHost;
  if (!rawToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders() });
  }

  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: noStoreHeaders() });
  }

  const supabase = createSupabaseAdmin();
  const { data: profile, error: profileError } = await supabase
    .from("pam_customers")
    .select("id, session_epoch")
    .eq("id", session.customerId)
    .eq("session_epoch", session.sessionEpoch)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: noStoreHeaders() });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const periodFilter = searchParams.get("period");
  const rangeFilter = searchParams.get("range");

  let query = supabase
    .from("pam_meter_readings")
    .select(
      "id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by",
      { count: "exact" }
    )
    .eq("customer_id", profile.id)
    .order("period", { ascending: false });

  if (periodFilter) {
    query = query.eq("period", normalizePeriodFilter(periodFilter));
  } else if (rangeFilter === "current-month") {
    query = query.eq("period", formatPeriodKey(new Date()));
  } else if (rangeFilter === "last-3-months") {
    const end = new Date();
    const start = subtractMonths(end, 2);
    query = query.gte("period", formatPeriodKey(start)).lte("period", formatPeriodKey(end));
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders() });
  }

  return NextResponse.json({ data: data as MeterReading[], total: count ?? 0, page, limit }, { headers: noStoreHeaders() });
}
