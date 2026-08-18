import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Tap01Icon,
  InvoiceIcon,
  BanknoteIcon,
  Chart01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { StaffRole } from "@/lib/types";

export type NavItem = {
  title: string;
  href: string;
  icon: IconSvgElement;
  roles?: StaffRole[];
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  { title: "Pelanggan", href: "/customers", icon: UserGroupIcon },
  { title: "Pencatatan Meter", href: "/meter-readings", icon: Tap01Icon },
  { title: "Tagihan", href: "/bills", icon: InvoiceIcon },
  {
    title: "Pembayaran",
    href: "/payments",
    icon: BanknoteIcon,
    roles: ["admin", "treasurer"],
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: Chart01Icon,
    roles: ["admin", "treasurer"],
  },
  { title: "Lainnya", href: "/more", icon: Settings01Icon },
];

export const bottomNavItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: DashboardSquare01Icon },
  { title: "Pelanggan", href: "/customers", icon: UserGroupIcon },
  { title: "Catat Meter", href: "/meter-readings", icon: Tap01Icon },
  { title: "Tagihan", href: "/bills", icon: InvoiceIcon },
];
