import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  UserGroupIcon,
  Tap01Icon,
  BanknoteIcon,
  BanknoteArrowUpIcon,
  InvoiceIcon,
  UserAdd01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PeriodPicker } from "@/components/ui/period-picker";
import { formatCurrency, formatNumber, formatShortPeriod } from "@/lib/format";
import {
  QUICK_ACTION_BY_KEY,
  type QuickActionKey,
} from "@/lib/quick-actions";
import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  type: "payment" | "reading" | "customer" | "expense";
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
  billPaidCount: number;
  billTotal: number;
  cashIn: number;
  cashOut: number;
  canViewFinance: boolean;
  unpaidCount: number;
  overdueCount: number;
  activities: ActivityItem[];
  quickActionKeys: QuickActionKey[];
  hasActiveFilters: boolean;
};

const activityIcons: Record<ActivityItem["type"], IconSvgElement> = {
  payment: BanknoteIcon,
  reading: Tap01Icon,
  customer: UserAdd01Icon,
  expense: BanknoteArrowUpIcon,
};

export function DashboardSummary({
  period,
  activeCustomers,
  totalCustomers,
  readingDone,
  billPaidCount,
  billTotal,
  cashIn,
  cashOut,
  canViewFinance,
  unpaidCount,
  overdueCount,
  activities,
  quickActionKeys,
  hasActiveFilters,
}: DashboardSummaryProps) {
  const readingTotal = activeCustomers;
  const readingPct =
    readingTotal > 0 ? Math.round((readingDone / readingTotal) * 100) : 0;
  const readingRemaining = Math.max(0, readingTotal - readingDone);
  const billRemaining = Math.max(0, billTotal - billPaidCount);
  const netCash = cashIn - cashOut;

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

  const quickActions = quickActionKeys.map((key) => QUICK_ACTION_BY_KEY[key]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatShortPeriod(period)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PeriodPicker period={period} />
          {hasActiveFilters && (
            <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-2",
          quickActions.length === 1
            ? "grid-cols-1"
            : quickActions.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        )}
      >
        {quickActions.map((action) => (
          <QuickAction
            key={action.key}
            href={action.href}
            icon={action.icon}
            label={action.label}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <DashboardStat
          href="/customers"
          icon={UserGroupIcon}
          label="Pelanggan"
          value={formatNumber(activeCustomers)}
          sub={`${formatNumber(totalCustomers)} total`}
        />
        <DashboardStat
          href="/meter-readings"
          icon={Tap01Icon}
          label="Meter"
          value={`${formatNumber(readingDone)}/${formatNumber(readingTotal)}`}
          sub={`${readingPct}% selesai`}
        />
        <DashboardStat
          href="/bills"
          icon={InvoiceIcon}
          label="Tagihan"
          value={`${formatNumber(billPaidCount)}/${formatNumber(billTotal)}`}
          sub={`${formatNumber(billRemaining)} belum lunas`}
        />
      </div>

      {attentionItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Perlu Tindakan</h2>
          <Card>
            <CardContent className="flex flex-col gap-1 py-2">
              {attentionItems.map((item) => (
                <AttentionRow key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {canViewFinance && <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Arus Kas</h2>
        <Card>
          <CardContent className="flex flex-col gap-2 py-3">
            <CashRow label="Pemasukan" value={formatCurrency(cashIn)} />
            <CashRow label="Pengeluaran" value={formatCurrency(cashOut)} />
            <div className="flex items-center justify-between gap-3 border-t pt-2">
              <span className="text-sm font-medium">Saldo Bersih</span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold",
                    netCash < 0 && "text-destructive"
                  )}
                >
                  {formatCurrency(netCash)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Buka laporan"
                  render={<Link href={`/reports?period=${period}`} />}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                  <span className="sr-only">Buka laporan</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>}

      {activities.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Aktivitas Terbaru</h2>
          <Card>
            <CardContent className="flex flex-col gap-1 py-2">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
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

function DashboardStat({
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
      className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4 text-primary" />
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-lg font-semibold sm:text-xl">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{sub}</p>
    </Link>
  );
}

function CashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
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
