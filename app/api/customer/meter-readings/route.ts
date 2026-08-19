import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCustomerSession } from "@/lib/auth/customer-jwt";
import type { MeterReading } from "@/lib/types";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const { data: profile, error: profileError } = await supabase
    .from("pam_customers")
    .select("id, session_epoch")
    .eq("id", session.customerId)
    .eq("session_epoch", session.sessionEpoch)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const periodFilter = searchParams.get("period");

  let query = supabase
    .from("pam_meter_readings")
    .select(
      "id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by",
      { count: "exact" }
    )
    .eq("customer_id", profile.id)
    .order("period", { ascending: false });

  if (periodFilter) {
    query = query.eq("period", periodFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as MeterReading[], total: count ?? 0, page, limit });
}