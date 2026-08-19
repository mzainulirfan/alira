"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Clock01Icon,
  GaugeIcon,
  InvoiceIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { CustomerProfile } from "@/lib/auth/customer-dal";

interface DashboardContentProps {
  activeBill: {
    id: string;
    period: string;
    total_amount: number;
    status: "unpaid" | "overdue";
    due_date: string | null;
  } | null;
  latestReading: {
    id: string;
    period: string;
    current_reading: number;
    previous_reading: number;
    usage: number;
  } | null;
  lastLogin: string | null;
  profile: CustomerProfile;
}

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  badge?: string;
  icon: typeof InvoiceIcon;
};

function DashboardStat({
  href,
  icon,
  label,
  value,
  sub,
}: {
  href: string;
  icon: typeof InvoiceIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4 text-primary" />
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-lg font-medium sm:text-xl">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{sub}</p>
    </Link>
  );
}

function AttentionRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: string;
  href: string;
  tone: "warning" | "destructive";
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-2.5 text-sm">
        <span
          className={[
            "size-2 rounded-full",
            tone === "warning" ? "bg-warning" : "bg-destructive",
          ].join(" ")}
        />
        {label}
      </span>
      <span className="flex items-center gap-1 font-medium">
        {value}
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
      </span>
    </Link>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <Link
      href={activity.href}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={activity.icon} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{activity.title}</p>
        <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {activity.badge && <Badge variant="success">{activity.badge}</Badge>}
        <span className="text-xs text-muted-foreground">{formatActivityTime(activity.time)}</span>
      </div>
    </Link>
  );
}

function formatActivityTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfDay - startOfDate) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  if (diffDays === 1) return "Kemarin";

  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardContent({
  activeBill,
  latestReading,
  lastLogin,
  profile,
}: DashboardContentProps) {
  const customerStatus = profile.status === "active" ? "Aktif" : "Nonaktif";
  const activeBillValue = activeBill ? formatCurrency(activeBill.total_amount) : "Tidak ada";
  const billSub = activeBill
    ? `Periode ${formatShortPeriod(activeBill.period)}`
    : "Tidak ada tagihan aktif";
  const meterValue = latestReading ? formatMeter(latestReading.current_reading) : "Belum ada";
  const meterSub = latestReading
    ? `Pemakaian ${formatMeter(latestReading.usage)}`
    : "Menunggu pencatatan meter";
  const profileValue = customerStatus;
  const profileSub = `No. ${profile.customer_number}`;

  const attentionItems: {
    label: string;
    value: string;
    href: string;
    tone: "warning" | "destructive";
  }[] = [];

  if (activeBill) {
    attentionItems.push({
      label: "Tagihan aktif",
      value: activeBill.status === "overdue" ? "Terlambat" : "Belum lunas",
      href: "/customer/bills",
      tone: activeBill.status === "overdue" ? "destructive" : "warning",
    });
  }

  if (!latestReading) {
    attentionItems.push({
      label: "Pencatatan meter",
      value: "Belum ada",
      href: "/customer/meter-readings",
      tone: "warning",
    });
  }

  const activities: ActivityItem[] = [
    {
      id: "bill",
      title: activeBill ? `Tagihan ${formatShortPeriod(activeBill.period)}` : "Tagihan aktif",
      description: activeBill
        ? `${formatCurrency(activeBill.total_amount)} ${activeBill.status === "overdue" ? "perlu segera dibayar" : "menunggu pembayaran"}`
        : "Tidak ada tagihan belum lunas",
      time: activeBill?.due_date ?? profile.created_at,
      href: "/customer/bills",
      badge: activeBill ? "Tagihan" : undefined,
      icon: InvoiceIcon,
    },
    {
      id: "meter",
      title: latestReading ? `Meter ${formatShortPeriod(latestReading.period)}` : "Pencatatan meter",
      description: latestReading
        ? `${formatMeter(latestReading.current_reading)} dengan pemakaian ${formatMeter(latestReading.usage)}`
        : "Belum ada data meter terbaru",
      time: latestReading?.period
        ? `${latestReading.period}-01`
        : profile.created_at,
      href: "/customer/meter-readings",
      badge: latestReading ? "Meter" : undefined,
      icon: GaugeIcon,
    },
    {
      id: "profile",
      title: "Status akun",
      description: `${customerStatus} sejak ${profile.join_date ? formatDate(profile.join_date) : "akun dibuat"}`,
      time: profile.join_date ?? profile.created_at,
      href: "/customer/profile",
      badge: "Profil",
      icon: UserIcon,
    },
    {
      id: "login",
      title: "Login terakhir",
      description: lastLogin ? formatDate(lastLogin) : "Belum pernah login",
      time: lastLogin ?? profile.created_at,
      href: "/customer/profile",
      badge: lastLogin ? "Aktivitas" : undefined,
      icon: Clock01Icon,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan akun pelanggan</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <DashboardStat
          href="/customer/bills"
          icon={InvoiceIcon}
          label="Tagihan"
          value={activeBillValue}
          sub={billSub}
        />
        <DashboardStat
          href="/customer/meter-readings"
          icon={GaugeIcon}
          label="Meter"
          value={meterValue}
          sub={meterSub}
        />
        <DashboardStat
          href="/customer/profile"
          icon={UserIcon}
          label="Akun"
          value={profileValue}
          sub={profileSub}
        />
      </div>

      {attentionItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionHeading
            title="Perlu Tindakan"
            description="Hal yang paling butuh perhatian saat ini"
          />
          <Card>
            <CardContent className="flex flex-col gap-1 py-2">
              {attentionItems.map((item) => (
                <AttentionRow key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <SectionHeading
          title="Aktivitas Terbaru"
          description="Jejak ringkas aktivitas akun pelanggan"
        />
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            {activities.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
