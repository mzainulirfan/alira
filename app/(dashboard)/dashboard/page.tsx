import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { currentPeriod, periodToDate } from "@/lib/data/meter-readings";
import { DashboardSummary, type ActivityItem } from "@/components/dashboard/dashboard-summary";
import { formatCurrency, formatMeter } from "@/lib/format";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await verifySession();

  const sp = await searchParams;
  const period = /^\d{4}-\d{2}$/.test(sp.period ?? "") ? sp.period! : currentPeriod();
  const periodDate = periodToDate(period);

  const supabase = createSupabaseAdmin();

  const [
    { data: customers },
    { data: readings },
    { data: bills },
    { data: recentPayments },
    { data: recentReadings },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from("pam_customers").select("id, status"),
    supabase
      .from("pam_meter_readings")
      .select("id")
      .eq("period", periodDate),
    supabase
      .from("pam_bills")
      .select("total_amount, status")
      .eq("period", periodDate),
    supabase
      .from("pam_payments")
      .select("id, amount, created_at, bill:pam_bills(customer:pam_customers(id, name))")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("pam_meter_readings")
      .select("id, current_reading, created_at, customer:pam_customers(id, name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("pam_customers")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const activeCustomers =
    customers?.filter((c) => c.status === "active").length ?? 0;
  const totalCustomers = customers?.length ?? 0;
  const billedTotal =
    bills?.reduce((s, b) => s + b.total_amount, 0) ?? 0;
  const paidTotal =
    bills?.filter((b) => b.status === "paid")
      .reduce((s, b) => s + b.total_amount, 0) ?? 0;
  const unpaidCount = bills?.filter((b) => b.status === "unpaid").length ?? 0;
  const overdueCount = bills?.filter((b) => b.status === "overdue").length ?? 0;

  const activities: ActivityItem[] = [];

  for (const p of recentPayments ?? []) {
    activities.push({
      id: `pay-${p.id}`,
      type: "payment",
      title: (p.bill as { customer?: { name?: string } | null } | null)?.customer?.name ?? "Pembayaran",
      description: `Pembayaran ${formatCurrency(p.amount as number)}`,
      time: p.created_at,
      href: "/payments",
      badge: "Lunas",
    });
  }

  for (const r of recentReadings ?? []) {
    activities.push({
      id: `read-${r.id}`,
      type: "reading",
      title: (r.customer as { name?: string } | null)?.name ?? "Pencatatan",
      description: `Meter dicatat ${formatMeter(r.current_reading as number)}`,
      time: r.created_at,
      href: "/meter-readings",
    });
  }

  for (const c of recentCustomers ?? []) {
    activities.push({
      id: `cust-${c.id}`,
      type: "customer",
      title: c.name,
      description: "Pelanggan baru",
      time: c.created_at,
      href: `/customers/${c.id}`,
    });
  }

  activities.sort((a, b) => (a.time < b.time ? 1 : -1));
  const topActivities = activities.slice(0, 5);

  return (
    <DashboardSummary
      period={period}
      activeCustomers={activeCustomers}
      totalCustomers={totalCustomers}
      readingDone={readings?.length ?? 0}
      billedTotal={billedTotal}
      paidTotal={paidTotal}
      unpaidCount={unpaidCount}
      overdueCount={overdueCount}
      activities={topActivities}
    />
  );
}
