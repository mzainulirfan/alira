import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { currentPeriod } from "@/lib/data/bills";
import { getExpenses } from "@/lib/data/expenses";
import { isExpenseCategory } from "@/lib/expenses";
import { ExpensesClient } from "@/components/expenses/expenses-client";
import { FINANCE_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Pengeluaran",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  await requireRole(FINANCE_ROLES);
  const params = await searchParams;
  const period =
    typeof params.period === "string" && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod();
  const category = isExpenseCategory(params.category) ? params.category : null;
  const allExpenses = await getExpenses(period);
  const expenses = category
    ? allExpenses.filter((expense) => expense.category === category)
    : allExpenses;
  const totalAmount = allExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return (
    <ExpensesClient
      expenses={expenses}
      allExpenses={allExpenses}
      period={period}
      category={category}
      totalAmount={totalAmount}
      hasActiveFilters={period !== currentPeriod() || category !== null}
    />
  );
}
