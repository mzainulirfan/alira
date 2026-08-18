import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  UserGroupIcon,
  Tap01Icon,
  BanknoteIcon,
  UserAdd01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PeriodPicker } from "@/components/ui/period-picker";
import { formatCurrency, formatNumber, formatShortPeriod } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  type: "payment" | "reading" | "customer";
  title: string;
  description: string;
  time: string;
  href: string;
  badge?: string;
};

type DashboardSummaryProps = {
  period: string;
  activeCustomers: number;
  totalCustomers: number;
  readingDone: number;
  billedTotal: number;
  paidTotal: number;
  unpaidCount: number;
  overdueCount: number;
  activities: ActivityItem[];
};

const activityIcons: Record<ActivityItem["type"], IconSvgElement> = {
  payment: BanknoteIcon,
  reading: Tap01Icon,
  customer: UserAdd01Icon,
};

export function DashboardSummary({
  period,
  activeCustomers,
  totalCustomers,
  readingDone,
  billedTotal,
  paidTotal,
  unpaidCount,
  overdueCount,
  activities,
}: DashboardSummaryProps) {
  const readingTotal = activeCustomers;
  const readingPct =
    readingTotal > 0 ? Math.round((readingDone / readingTotal) * 100) : 0;
  const readingRemaining = Math.max(0, readingTotal - readingDone);

  const paidPct = billedTotal > 0 ? Math.round((paidTotal / billedTotal) * 100) : 0;
  const unpaidAmount = Math.max(0, billedTotal - paidTotal);

  const attentionItems: {
    label: string;
    value: number;
    href: string;
    tone: "warning" | "destructive";
  }[] = [];

  if (readingRemaining > 0)
    attentionItems.push({
      label: "Meter belum dicatat",
      value: readingRemaining,
      href: "/meter-readings",
      tone: "warning",
    });
  if (unpaidCount > 0)
    attentionItems.push({
      label: "Belum membayar",
      value: unpaidCount,
      href: "/bills?status=unpaid",
      tone: "warning",
    });
  if (overdueCount > 0)
    attentionItems.push({
      label: "Menunggak",
      value: overdueCount,
      href: "/bills?status=overdue",
      tone: "destructive",
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatShortPeriod(period)}</p>
        </div>
        <PeriodPicker period={period} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <QuickAction href="/meter-readings" icon={Tap01Icon} label="Catat Meter" />
        <QuickAction href="/payments/new" icon={BanknoteIcon} label="Catat Pembayaran" />
        <QuickAction href="/customers" icon={UserAdd01Icon} label="Kelola Pelanggan" />
      </div>

      <section className="flex flex-col gap-2">
        <SectionLabel>Ringkasan</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            href="/customers"
            icon={UserGroupIcon}
            label="Pelanggan"
            value={formatNumber(activeCustomers)}
            sub={`dari ${formatNumber(totalCustomers)} total`}
          />
          <SummaryCard
            href="/meter-readings"
            icon={Tap01Icon}
            label="Meter"
            value={`${formatNumber(readingDone)} / ${formatNumber(readingTotal)}`}
            sub={`${readingPct}% selesai`}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Pencatatan Meter</SectionLabel>
        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            {readingTotal === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada pelanggan aktif untuk dicatat.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {formatNumber(readingDone)}
                  </span>{" "}
                  dari {formatNumber(readingTotal)} pelanggan
                </p>
                <Progress value={readingPct} />
                <p className="text-sm">
                  {readingRemaining > 0 ? (
                    <>
                      <span className="font-semibold text-warning">
                        {formatNumber(readingRemaining)}
                      </span>{" "}
                      pelanggan belum dicatat
                    </>
                  ) : (
                    "Semua pelanggan sudah dicatat"
                  )}
                </p>
                <Button render={<Link href="/meter-readings" />} className="w-fit">
                  Lanjut Catat Meter
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Keuangan Bulan Ini</SectionLabel>
        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            {billedTotal === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada tagihan untuk {formatShortPeriod(period)}.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <MoneyCard label="Tagihan" value={formatCurrency(billedTotal)} />
                  <MoneyCard label="Dibayar" value={formatCurrency(paidTotal)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{paidPct}%</span>{" "}
                  tagihan sudah dibayar
                </p>
                <Progress value={paidPct} />
                <p className="text-sm">
                  {unpaidAmount > 0 ? (
                    <>
                      Belum dibayar{" "}
                      <span className="font-semibold text-warning">
                        {formatCurrency(unpaidAmount)}
                      </span>
                    </>
                  ) : (
                    "Semua tagihan sudah dibayar"
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Perlu Perhatian</SectionLabel>
        {attentionItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
              </div>
              <p className="font-medium">Semua aman</p>
              <p className="text-sm text-muted-foreground">
                Tidak ada pelanggan yang memerlukan perhatian.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-2 py-3">
              {attentionItems.map((item) => (
                <AttentionRow key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Aktivitas Terbaru</SectionLabel>
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            {activities.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Belum ada aktivitas.
              </p>
            ) : (
              activities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: IconSvgElement;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card py-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
    >
      <HugeiconsIcon icon={icon} className="size-5 text-primary" />
      {label}
    </Link>
  );
}

function SummaryCard({
  href,
  icon,
  label,
  value,
  sub,
}: {
  href: string;
  icon: IconSvgElement;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="text-2xl font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}

function MoneyCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-medium">{value}</span>
      </CardContent>
    </Card>
  );
}

function Progress({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function AttentionRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
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
          className={cn(
            "size-2 rounded-full",
            tone === "warning" ? "bg-warning" : "bg-destructive"
          )}
        />
        {label}
      </span>
      <span className="flex items-center gap-1 font-semibold">
        {formatNumber(value)}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-4 text-muted-foreground"
        />
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
        <HugeiconsIcon icon={activityIcons[activity.type]} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{activity.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {activity.description}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {activity.badge && <Badge variant="success">{activity.badge}</Badge>}
        <span className="text-xs text-muted-foreground">
          {formatActivityTime(activity.time)}
        </span>
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

  if (diffDays === 0)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}