import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Settings01Icon,
  DiscountTag01Icon,
  LockPasswordIcon,
  UserCircleIcon,
  Chart01Icon,
  BanknoteIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { verifySession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Lainnya",
};

const menuItems: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
}[] = [
  {
    title: "Profil Alira",
    description: "Nama, alamat, telepon, jatuh tempo",
    href: "/more/profile",
    icon: Settings01Icon,
  },
  {
    title: "Tarif",
    description: "Kelola tarif air dan abonemen",
    href: "/more/tariffs",
    icon: DiscountTag01Icon,
  },
  {
    title: "Keamanan",
    description: "Ganti passcode masuk",
    href: "/more/security",
    icon: LockPasswordIcon,
  },
  {
    title: "Akun",
    description: "Keluar dari aplikasi",
    href: "/more/account",
    icon: UserCircleIcon,
  },
];

const shortcutItems: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
}[] = [
  {
    title: "Laporan",
    description: "Ringkasan bulanan dan unduh CSV",
    href: "/reports",
    icon: Chart01Icon,
  },
  {
    title: "Pembayaran",
    description: "Riwayat pembayaran pelanggan",
    href: "/payments",
    icon: BanknoteIcon,
  },
];

export default async function MorePage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Lainnya</h1>
        <p className="text-sm text-muted-foreground">
          Pengaturan dan akses cepat.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-1 p-2">
          {[...menuItems, ...shortcutItems].map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MenuItem({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: IconSvgElement;
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
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}