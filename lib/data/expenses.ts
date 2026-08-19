import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isExpenseCategory } from "@/lib/expenses";
import { nextPeriodDate, periodToDate } from "@/lib/period";
import { createSignedUrlMap } from "@/lib/storage";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { FINANCE_ROLES } from "@/lib/staff";

function periodBounds(period: string): { start: string; end: string } {
  return { start: periodToDate(period), end: nextPeriodDate(period) };
}

export const getExpenses = cache(
  async (period: string, category?: string): Promise<Expense[]> => {
    await requireRole(FINANCE_ROLES);
    const supabase = createSupabaseAdmin();
    const { start, end } = periodBounds(period);

    let query = supabase
      .from("pam_expenses")
      .select(
        "id, expense_date, title, category, amount, payee, payment_method, receipt_path, receipt_url, notes, created_by, created_at, updated_at"
      )
      .gte("expense_date", start)
      .lt("expense_date", end)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (isExpenseCategory(category)) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const expenses = (data ?? []) as Expense[];
    const signedUrls = await createSignedUrlMap(
      supabase,
      "expense-receipts",
      expenses.map((expense) => expense.receipt_path)
    );
    return expenses.map((expense) => ({
      ...expense,
      receipt_url: signedUrls.get(expense.receipt_path ?? "") ?? null,
    }));
  }
);

export const getExpenseById = cache(
  async (id: string): Promise<Expense | null> => {
    await requireRole(FINANCE_ROLES);
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("pam_expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const expense = data as Expense | null;
    if (!expense) return null;
    const signedUrls = await createSignedUrlMap(
      supabase,
      "expense-receipts",
      [expense.receipt_path]
    );
    return {
      ...expense,
      receipt_url: signedUrls.get(expense.receipt_path ?? "") ?? null,
    };
  }
);

export const getExpenseTotal = cache(
  async (period: string): Promise<number> => {
    const expenses = await getExpenses(period);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
);

export type { ExpenseCategory };
