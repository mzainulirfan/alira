import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCustomerSession } from "@/lib/auth/customer-jwt";

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
  const statusFilter = searchParams.get("status") as "all" | "unpaid" | "paid" | "overdue" | null;

  let query = supabase
    .from("pam_bills")
    .select("id, period, total_amount, status, due_date, created_at", { count: "exact" })
    .eq("customer_id", profile.id)
    .order("period", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as Bill[], total: count ?? 0, page, limit });
}

interface Bill {
  id: string;
  period: string;
  total_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string;
  created_at: string;
}