import type { ExpenseCategory } from "@/lib/types";

export const EXPENSE_CATEGORIES: Array<{
  key: ExpenseCategory;
  label: string;
}> = [
  { key: "maintenance", label: "Pemeliharaan Rutin" },
  { key: "pipe_repair", label: "Perbaikan Saluran" },
  { key: "equipment", label: "Peralatan dan Sparepart" },
  { key: "electricity_pump", label: "Listrik dan Pompa" },
  { key: "technician", label: "Jasa Teknisi" },
  { key: "operations", label: "Operasional Administrasi" },
  { key: "other", label: "Lainnya" },
];

export const EXPENSE_CATEGORY_LABEL = Object.fromEntries(
  EXPENSE_CATEGORIES.map((category) => [category.key, category.label])
) as Record<ExpenseCategory, string>;

const expenseCategoryKeys = new Set<string>(
  EXPENSE_CATEGORIES.map((category) => category.key)
);

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && expenseCategoryKeys.has(value);
}

export const EXPENSE_PAYMENT_METHOD_LABEL = {
  cash: "Tunai",
  transfer: "Transfer",
} as const;
