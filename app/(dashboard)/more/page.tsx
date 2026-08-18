import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Settings01Icon,
  DiscountTag01Icon,
  LockPasswordIcon,
  Chart01Icon,
  BanknoteIcon,
  BanknoteArrowUpIcon,
  ArrowRight01Icon,
  DashboardSquareSettingIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { normalizeQuickActionKeys } from "@/lib/quick-actions";
import { canManageFinance } from "@/lib/staff";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Lainnya",
};

const menuItems: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
  badge?: string;
  adminOnly?: boolean;
}[] = [
  {
    title: "Profil Alira",
    description: "Nama, alamat, telepon, jatuh tempo",
    href: "/more/profile",
    icon: Settings01Icon,
    adminOnly: true,
  },
  {
    title: "Tarif",
    description: "Kelola tarif air dan abonemen",
    href: "/more/tariffs",
    icon: DiscountTag01Icon,
    adminOnly: true,
  },
  {
    title: "Quick Action",
    description: "Atur pintasan di Dashboard",
    href: "/more/quick-actions",
    icon: DashboardSquareSettingIcon,
    adminOnly: true,
  },
  {
    title: "Admin & Pegawai",
    description: "Kelola akun dan hak akses",
    href: "/more/staff",
    icon: UserGroupIcon,
    adminOnly: true,
  },
  {
    title: "Akun",
    description: "Lihat identitas akun dan role",
    href: "/more/account",
    icon: UserIcon,
  },
  {
    title: "Keamanan",
    description: "Ganti passcode masuk",
    href: "/more/security",
    icon: LockPasswordIcon,
  },
];

const shortcutItems: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
}[] = [
  {
    title: "Pengeluaran",
    description: "Catat dan kelola biaya operasional",
    href: "/expenses",
    icon: BanknoteArrowUpIcon,
  },
  {
    title: "Pembayaran",
    description: "Riwayat pembayaran pelanggan",
    href: "/payments",
    icon: BanknoteIcon,
  },
  {
    title: "Laporan",
    description: "Laporan bulanan dan unduh CSV",
    href: "/reports",
    icon: Chart01Icon,
  },
];

export default async function MorePage() {
  const session = await verifySession();
  const settings = await getAppSettings();
  const activeQuickActions = normalizeQuickActionKeys(settings.quick_actions).length;
  const settingsItems = menuItems.map((item) =>
    item.href === "/more/quick-actions"
      ? { ...item, badge: `${activeQuickActions} aktif` }
      : item
  ).filter((item) => !item.adminOnly || session.role === "admin");
  const visibleShortcuts = canManageFinance(session.role) ? shortcutItems : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Lainnya</h1>
        <p className="text-sm text-muted-foreground">
          Kelola aplikasi dan akses tambahan
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-1 p-2">
          {settingsItems.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </CardContent>
      </Card>

      {visibleShortcuts.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-1 p-2">
            {visibleShortcuts.map((item) => (
              <MenuItem key={item.href} {...item} />
            ))}
          </CardContent>
        </Card>
      )}

      <LogoutButton />
    </div>
  );
}

function MenuItem({
  title,
  description,
  href,
  icon,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {badge && <Badge variant="secondary">{badge}</Badge>}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}
