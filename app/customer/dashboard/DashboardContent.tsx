"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  GaugeIcon,
  InvoiceIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { CustomerProfile } from "@/lib/auth/customer-dal";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

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
  type: "bill" | "meter" | "profile" | "login";
};

const activityIcons = {
  bill: InvoiceIcon,
  meter: GaugeIcon,
  profile: UserIcon,
  login: Clock01Icon,
} as const;

const activityDotClass = {
  bill: "bg-brass text-white",
  meter: "bg-aqua text-white",
  profile: "bg-petrol text-white",
  login: "bg-coral text-white",
} as const;

function CustomerHero({
  name,
  customerNumber,
  hasActiveBill,
}: {
  name: string | null;
  customerNumber: string;
  hasActiveBill: boolean;
}) {
  const firstName = name?.trim().split(/\s+/)[0] || "Pelanggan";
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
        }}
      />
      <div className="absolute -top-[38px] -right-[38px] size-[170px] rounded-full border-[1.5px] border-aqua/35">
        <div className="absolute inset-[22px] rounded-full border border-dashed border-brass/40" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-aqua">
          <span className="size-1.5 rounded-full bg-aqua" />
          Panel Pelanggan
        </span>
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          Halo, {firstName}!
        </h2>
        <p className="max-w-[80%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
          Pantau tagihan, meter, dan profil akun Anda dalam satu tempat.
        </p>
        <div className="mt-1 flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/7 px-3 py-1.5">
          <span
            className={cn(
              "flex size-4 items-center justify-center rounded-full",
              hasActiveBill ? "bg-brass-light" : "bg-green-light"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                hasActiveBill ? "bg-brass" : "bg-green"
              )}
            />
          </span>
          <span className="font-mono text-[10.5px] tracking-wide text-[#ddefec]">
            {customerNumber.toUpperCase()} · {hasActiveBill ? "ADA TAGIHAN AKTIF" : "TAGIHAN BERES"}
          </span>
        </div>
      </div>
    </div>
  );
}

function TagihanMetric({
  activeBill,
}: {
  activeBill: DashboardContentProps["activeBill"];
}) {
  return (
    <Link
      href="/customer/bills"
      className="flex min-h-[118px] flex-col rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Tagihan
      </p>
      <p className="mt-1 font-mono text-[19px] font-semibold text-petrol">
        {activeBill ? formatCurrency(activeBill.total_amount) : "Tidak ada"}
      </p>
      <p className="text-[10.5px] text-muted-2">
        {activeBill ? `Periode ${formatShortPeriod(activeBill.period)}` : "Tidak ada tagihan aktif"}
      </p>
      <span
        className={cn(
          "mt-auto w-fit rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
          !activeBill
            ? "bg-green-light text-green"
            : activeBill.status === "overdue"
              ? "bg-coral-light text-coral"
              : "bg-brass-light text-brass"
        )}
      >
        {!activeBill ? "BERES" : activeBill.status === "overdue" ? "TERLAMBAT" : "BELUM LUNAS"}
      </span>
    </Link>
  );
}

function MeterMetric({
  latestReading,
}: {
  latestReading: DashboardContentProps["latestReading"];
}) {
  const usage = latestReading?.usage ?? 0;
  const pct = Math.min(100, Math.max(0, Math.round(usage)));
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Link
      href="/customer/meter-readings"
      className="flex min-h-[118px] flex-col items-center rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="self-start text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Meter
      </p>
      <div className="relative flex flex-1 items-center justify-center">
        <svg viewBox="0 0 80 80" className="size-14" role="presentation">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#E4F5F3" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#16A6A0"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="absolute font-mono text-[12px] font-bold text-petrol">
          {usage} m³
        </span>
      </div>
      <p className="mt-1 truncate font-mono text-[10px] text-muted-2">
        {latestReading
          ? `METER ${formatMeter(latestReading.current_reading)}`
          : "MENUNGGU CATATAN"}
      </p>
    </Link>
  );
}

function AkunMetric({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const active = profile.status === "active";
  return (
    <Link
      href="/customer/profile"
      className="flex min-h-[118px] flex-col rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Akun
      </p>
      <p className="mt-1 font-mono text-[19px] font-semibold text-petrol">
        {active ? "Aktif" : "Nonaktif"}
      </p>
      <p className="truncate text-[10.5px] text-muted-2">
        No. {profile.customer_number}
      </p>
      <span
        className={cn(
          "mt-auto w-fit rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
          active ? "bg-green-light text-green" : "bg-coral-light text-coral"
        )}
      >
        {active ? "TERDAFTAR" : "DINONAKTIFKAN"}
      </span>
    </Link>
  );
}

function Ticket({
  label,
  sub,
  value,
  href,
  tone,
}: {
  label: string;
  sub: string;
  value: string;
  href: string;
  tone: "warning" | "destructive";
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md"
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
      <span className="absolute top-1/2 left-1.5 size-[5px] -translate-y-1/2 rounded-full bg-brass-light" />
      <span className="absolute bottom-1.5 left-1.5 size-[5px] rounded-full bg-brass-light" />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-petrol">{label}</p>
          <p className="font-mono text-[11px] text-muted-2">{sub}</p>
        </div>
        <span
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-mono text-[13px] font-bold",
            tone === "destructive" ? "bg-coral-light text-coral" : "bg-brass-light text-brass"
          )}
        >
          {value}
        </span>
      </div>
    </Link>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <li className="relative flex gap-3 pb-1">
      <span
        aria-hidden
        className="absolute top-5 bottom-0 left-[11px] w-px border-l border-dashed border-line"
      />
      <span
        className={cn(
          "relative z-10 flex size-[23px] shrink-0 items-center justify-center rounded-full",
          activityDotClass[activity.type]
        )}
      >
        <HugeiconsIcon icon={activityIcons[activity.type]} className="size-3" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[13px] font-semibold text-petrol">{activity.title}</p>
        <p className="truncate text-[11.5px] text-muted-2">{activity.description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 pt-0.5">
        {activity.badge && (
          <span className="rounded-full bg-green-light px-2 py-0.5 font-mono text-[9.5px] font-bold tracking-wide text-green">
            {activity.badge.toUpperCase()}
          </span>
        )}
        <span className="font-mono text-[10.5px] text-muted-2">
          {formatActivityTime(activity.time)}
        </span>
      </div>
    </li>
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
  if (diffDays === 1) return "KEMARIN";
  return date
    .toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    .toUpperCase();
}

export default function DashboardContent({
  activeBill,
  latestReading,
  lastLogin,
  profile,
}: DashboardContentProps) {
  const customerStatus = profile.status === "active" ? "Aktif" : "Nonaktif";

  const attentionItems: {
    label: string;
    sub: string;
    value: string;
    href: string;
    tone: "warning" | "destructive";
  }[] = [];

  if (activeBill) {
    attentionItems.push({
      label: "Tagihan aktif",
      sub: `PERIODE ${formatShortPeriod(activeBill.period).toUpperCase()}`,
      value: activeBill.status === "overdue" ? "Terlambat" : "Belum lunas",
      href: "/customer/bills",
      tone: activeBill.status === "overdue" ? "destructive" : "warning",
    });
  }

  if (!latestReading) {
    attentionItems.push({
      label: "Pencatatan meter",
      sub: "MENUNGGU PENCATATAN",
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
      type: "bill",
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
      type: "meter",
    },
    {
      id: "profile",
      title: "Status akun",
      description: `${customerStatus} sejak ${profile.join_date ? formatDate(profile.join_date) : "akun dibuat"}`,
      time: profile.join_date ?? profile.created_at,
      href: "/customer/profile",
      badge: "Profil",
      type: "profile",
    },
    {
      id: "login",
      title: "Login terakhir",
      description: lastLogin ? formatDate(lastLogin) : "Belum pernah login",
      time: lastLogin ?? profile.created_at,
      href: "/customer/profile",
      badge: lastLogin ? "Aktivitas" : undefined,
      type: "login",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
          Dashboard
        </h1>
        <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
          Ringkasan akun pelanggan Anda
        </p>
      </div>

      <CustomerHero
        name={profile.name}
        customerNumber={profile.customer_number}
        hasActiveBill={Boolean(activeBill)}
      />

      <section className="flex flex-col">
        <SectionHeading title="Ringkasan" />
        <div className="grid grid-cols-3 gap-2">
          <TagihanMetric activeBill={activeBill} />
          <MeterMetric latestReading={latestReading} />
          <AkunMetric profile={profile} />
        </div>
      </section>

      {attentionItems.length > 0 && (
        <section className="flex flex-col">
          <SectionHeading title="Perlu Tindakan" linkLabel="Lihat Semua" linkHref="/customer/bills" />
          <div className="flex flex-col gap-3">
            {attentionItems.map((item) => (
              <Ticket key={item.label} {...item} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col">
        <SectionHeading title="Aktivitas Terbaru" />
        <div className="rounded-[14px] border border-line bg-card px-4 py-3">
          <ol className="relative flex flex-col">
            {activities.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}