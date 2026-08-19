import { verifySession } from "@/lib/auth/dal";
import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { currentPeriod, isValidPeriod, nextPeriodDate, periodToDate } from "@/lib/period";
import { getAppSettings } from "@/lib/data/settings";
import { DashboardSummary, type ActivityItem } from "@/components/dashboard/dashboard-summary";
import { formatCurrency, formatMeter } from "@/lib/format";
import {
  filterQuickActionKeys,
  normalizeQuickActionKeys,
} from "@/lib/quick-actions";
import { canManageFinance } from "@/lib/staff";

export const metadata = {
  title: "Dashboard",
};

const getDashboardData = unstable_cache(
  async (period: string, canViewFinance: boolean) => {
    const supabase = createSupabaseAdmin();
    const periodDate = periodToDate(period);
    const nextPeriod = nextPeriodDate(period);
    const emptyResult = Promise.resolve({ data: [], error: null });

    const [
      customersResult,
      readingsResult,
      billsResult,
      cashPaymentsResult,
      expensesResult,
      recentPaymentsResult,
      recentReadingsResult,
      recentCustomersResult,
      recentExpensesResult,
    ] = await Promise.all([
      supabase.from("pam_customers").select("id, status"),
      supabase
        .from("pam_meter_readings")
        .select("id, customer_id")
        .eq("period", periodDate),
      supabase
        .from("pam_bills")
        .select("total_amount, status")
        .eq("period", periodDate),
      canViewFinance
        ? supabase
            .from("pam_payments")
            .select("amount")
            .gte("payment_date", periodDate)
            .lt("payment_date", nextPeriod)
        : emptyResult,
      canViewFinance
        ? supabase
            .from("pam_expenses")
            .select("amount")
            .gte("expense_date", periodDate)
            .lt("expense_date", nextPeriod)
        : emptyResult,
      canViewFinance
        ? supabase
            .from("pam_payments")
            .select("id, amount, created_at, bill:pam_bills(customer:pam_customers(id, name))")
            .order("created_at", { ascending: false })
            .limit(5)
        : emptyResult,
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
      canViewFinance
        ? supabase
            .from("pam_expenses")
            .select("id, title, amount, created_at")
            .order("created_at", { ascending: false })
            .limit(5)
        : emptyResult,
    ]);

    const queryResults = [
      customersResult,
      readingsResult,
      billsResult,
      cashPaymentsResult,
      expensesResult,
      recentPaymentsResult,
      recentReadingsResult,
      recentCustomersResult,
      recentExpensesResult,
    ];
    const failedQuery = queryResults.find((result) => result.error);
    if (failedQuery?.error) {
      throw new Error(`Gagal memuat dashboard: ${failedQuery.error.message}`);
    }

    return {
      customers: customersResult.data ?? [],
      readings: readingsResult.data ?? [],
      bills: billsResult.data ?? [],
      cashPayments: cashPaymentsResult.data ?? [],
      expenses: expensesResult.data ?? [],
      recentPayments: recentPaymentsResult.data ?? [],
      recentReadings: recentReadingsResult.data ?? [],
      recentCustomers: recentCustomersResult.data ?? [],
      recentExpenses: recentExpensesResult.data ?? [],
    };
  },
  ["dashboard-summary"],
  {
    tags: ["customers", "meter-readings", "bills", "payments", "expenses", "settings"],
    revalidate: 60,
  }
);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await verifySession();

  const sp = await searchParams;
  const period = isValidPeriod(sp.period) ? sp.period : currentPeriod();

  const canViewFinance = canManageFinance(session.role);

  const [settings, dashboard] = await Promise.all([
    getAppSettings(),
    getDashboardData(period, canViewFinance),
  ]);

  const {
    customers,
    readings,
    bills,
    cashPayments,
    expenses,
    recentPayments,
    recentReadings,
    recentCustomers,
    recentExpenses,
  } = dashboard;

  const activeCustomerIds = new Set(
    customers.filter((customer) => customer.status === "active").map((customer) => customer.id)
  );
  const activeCustomers = activeCustomerIds.size;
  const totalCustomers = customers.length;
  const readingDone = readings.filter((reading) =>
    activeCustomerIds.has(reading.customer_id)
  ).length;
  const activeBills = bills.filter((bill) => bill.status !== "cancelled");
  const billPaidCount = activeBills.filter((bill) => bill.status === "paid").length;
  const unpaidCount = activeBills.filter((bill) => bill.status === "unpaid").length;
  const overdueCount = activeBills.filter((bill) => bill.status === "overdue").length;
  const cashIn = cashPayments.reduce((total, payment) => total + payment.amount, 0);
  const cashOut = expenses.reduce((total, expense) => total + expense.amount, 0);

  const activities: ActivityItem[] = [];

  for (const p of recentPayments) {
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

  for (const r of recentReadings) {
    activities.push({
      id: `read-${r.id}`,
      type: "reading",
      title: (r.customer as { name?: string } | null)?.name ?? "Pencatatan",
      description: `Meter dicatat ${formatMeter(r.current_reading as number)}`,
      time: r.created_at,
      href: "/meter-readings",
    });
  }

  for (const c of recentCustomers) {
    activities.push({
      id: `cust-${c.id}`,
      type: "customer",
      title: c.name,
      description: "Pelanggan baru",
      time: c.created_at,
      href: `/customers/${c.id}`,
    });
  }

  for (const expense of recentExpenses) {
    activities.push({
      id: `expense-${expense.id}`,
      type: "expense",
      title: expense.title,
      description: `Pengeluaran ${formatCurrency(expense.amount)}`,
      time: expense.created_at,
      href: "/expenses",
    });
  }

  activities.sort((a, b) => (a.time < b.time ? 1 : -1));
  const topActivities = activities.slice(0, 5);

  return (
    <DashboardSummary
      period={period}
      activeCustomers={activeCustomers}
      totalCustomers={totalCustomers}
      readingDone={readingDone}
      billPaidCount={billPaidCount}
      billTotal={activeBills.length}
      cashIn={cashIn}
      cashOut={cashOut}
      canViewFinance={canViewFinance}
      unpaidCount={unpaidCount}
      overdueCount={overdueCount}
      activities={topActivities}
      quickActionKeys={filterQuickActionKeys(
        normalizeQuickActionKeys(settings.quick_actions),
        session.role
      )}
      hasActiveFilters={period !== currentPeriod()}
    />
  );
}
