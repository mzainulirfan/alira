import type { IconSvgElement } from "@hugeicons/react";
import {
  BanknoteArrowUpIcon,
  BanknoteIcon,
  Chart01Icon,
  DiscountTag01Icon,
  InvoiceIcon,
  Tap01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";

export const QUICK_ACTION_KEYS = [
  "meter-readings",
  "payment-new",
  "expense-new",
  "customers",
  "bills",
  "payments",
  "reports",
  "tariffs",
] as const;

export type QuickActionKey = (typeof QUICK_ACTION_KEYS)[number];

export type QuickActionDefinition = {
  key: QuickActionKey;
  label: string;
  description: string;
  href: string;
  icon: IconSvgElement;
};

export const DEFAULT_QUICK_ACTIONS: QuickActionKey[] = [
  "meter-readings",
  "payment-new",
  "customers",
];

export const QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    key: "meter-readings",
    label: "Catat Meter",
    description: "Catat pemakaian pelanggan",
    href: "/meter-readings",
    icon: Tap01Icon,
  },
  {
    key: "payment-new",
    label: "Catat Pembayaran",
    description: "Catat pembayaran tagihan",
    href: "/payments/new",
    icon: BanknoteIcon,
  },
  {
    key: "expense-new",
    label: "Catat Pengeluaran",
    description: "Catat biaya operasional",
    href: "/expenses?new=true",
    icon: BanknoteArrowUpIcon,
  },
  {
    key: "customers",
    label: "Kelola Pelanggan",
    description: "Kelola data pelanggan",
    href: "/customers",
    icon: UserAdd01Icon,
  },
  {
    key: "bills",
    label: "Tagihan",
    description: "Lihat dan kelola tagihan",
    href: "/bills",
    icon: InvoiceIcon,
  },
  {
    key: "payments",
    label: "Pembayaran",
    description: "Lihat riwayat pembayaran",
    href: "/payments",
    icon: BanknoteIcon,
  },
  {
    key: "reports",
    label: "Laporan",
    description: "Buka laporan bulanan",
    href: "/reports",
    icon: Chart01Icon,
  },
  {
    key: "tariffs",
    label: "Tarif",
    description: "Kelola tarif air dan abonemen",
    href: "/more/tariffs",
    icon: DiscountTag01Icon,
  },
];

export const QUICK_ACTION_BY_KEY = Object.fromEntries(
  QUICK_ACTIONS.map((action) => [action.key, action])
) as Record<QuickActionKey, QuickActionDefinition>;

const quickActionKeySet = new Set<string>(QUICK_ACTION_KEYS);

export function isQuickActionKey(value: unknown): value is QuickActionKey {
  return typeof value === "string" && quickActionKeySet.has(value);
}

export function normalizeQuickActionKeys(value: unknown): QuickActionKey[] {
  if (!Array.isArray(value)) return DEFAULT_QUICK_ACTIONS;

  const normalized: QuickActionKey[] = [];
  for (const key of value) {
    if (
      isQuickActionKey(key) &&
      !normalized.includes(key) &&
      normalized.length < 3
    ) {
      normalized.push(key);
    }
  }

  return normalized.length > 0 ? normalized : DEFAULT_QUICK_ACTIONS;
}
