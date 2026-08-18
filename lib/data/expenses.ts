import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isExpenseCategory } from "@/lib/expenses";
import type { Expense, ExpenseCategory } from "@/lib/types";

function periodBounds(period: string): { start: string; end: string } {
  const [year, month] = period.split("-").map(Number);
  const end = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  return { start: `${period}-01`, end };
}

export const getExpenses = cache(
  async (period: string, category?: string): Promise<Expense[]> => {
    await verifySession();
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
    return (data ?? []) as Expense[];
  }
);

export const getExpenseById = cache(
  async (id: string): Promise<Expense | null> => {
    await verifySession();
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("pam_expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as Expense | null;
  }
);

export const getExpenseTotal = cache(
  async (period: string): Promise<number> => {
    const expenses = await getExpenses(period);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
);

export type { ExpenseCategory };
