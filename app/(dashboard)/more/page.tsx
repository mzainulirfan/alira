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
  QrCodeIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { normalizeQuickActionKeys } from "@/lib/quick-actions";
import { canManageFinance } from "@/lib/staff";
import { LogoutButton } from "./logout-button";
import { SectionHeading } from "@/components/dashboard/section-heading";

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
    title: "QR Pelanggan",
    description: "Pilih dan cetak label QR pelanggan",
    href: "/more/customer-qr",
    icon: QrCodeIcon,
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
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/dashboard" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Lainnya
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Kelola aplikasi dan akses tambahan
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Pengaturan" />
        <div className="rounded-[14px] border border-line bg-card p-2">
          {settingsItems.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </div>
      </section>

      {visibleShortcuts.length > 0 && (
        <section className="flex flex-col">
          <SectionHeading title="Pintasan Cepat" />
          <div className="rounded-[14px] border border-line bg-card p-2">
            {visibleShortcuts.map((item) => (
              <MenuItem key={item.href} {...item} />
            ))}
          </div>
        </section>
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
      className="group relative flex items-center gap-3 overflow-hidden rounded-[12px] border border-transparent bg-transparent py-2.5 pr-2 pl-3 transition-all hover:border-petrol/30 hover:bg-petrol/3"
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-aqua-light text-aqua transition-colors group-hover:bg-petrol group-hover:text-white">
        <HugeiconsIcon icon={icon} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[13px] font-semibold text-petrol">{title}</p>
        <p className="truncate font-mono text-[10.5px] text-muted-2">{description}</p>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">{badge}</span>
      )}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
      </span>
    </Link>
  );
}