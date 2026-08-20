import Link from "next/link";
import { PeriodPicker } from "@/components/ui/period-picker";
import { Button } from "@/components/ui/button";
import { QUICK_ACTION_BY_KEY, type QuickActionKey } from "@/lib/quick-actions";
import type { ActivityItem } from "./types";
import { HeroBanner } from "./hero-banner";
import { QuickActions } from "./quick-actions";
import { DashboardMetrics } from "./dashboard-metrics";
import {
  ActionRequiredSection,
  type ActionRequiredItem,
} from "./action-required-section";
import { CashFlowCard } from "./cash-flow-card";
import { RecentActivitySection } from "./recent-activity-section";
import { SectionHeading } from "./section-heading";

export type { ActivityItem };

type DashboardSummaryProps = {
  period: string;
  userName: string;
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

export function DashboardSummary({
  period,
  userName,
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

  const attentionItems: ActionRequiredItem[] = [];
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Ringkasan operasional Anda
          </p>
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

      <HeroBanner userName={userName} activeCustomers={activeCustomers} />

      <section className="flex flex-col">
        <SectionHeading title="Aksi Cepat" />
        <QuickActions actions={quickActions} />
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Ringkasan" />
        <DashboardMetrics
          activeCustomers={activeCustomers}
          totalCustomers={totalCustomers}
          readingDone={readingDone}
          readingTotal={readingTotal}
          readingPct={readingPct}
          billPaidCount={billPaidCount}
          billTotal={billTotal}
          billRemaining={billRemaining}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActionRequiredSection items={attentionItems} />
        {canViewFinance && (
          <CashFlowCard period={period} cashIn={cashIn} cashOut={cashOut} />
        )}
      </section>

      <RecentActivitySection activities={activities} />
    </div>
  );
}