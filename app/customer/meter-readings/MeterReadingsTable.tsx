"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, GaugeIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MeterReading } from "@/lib/types";

interface MeterReadingsTableProps {
  initialReadings: MeterReading[];
  total: number;
  initialPage: number;
  initialPeriodFilter?: string;
  initialRangeFilter?: "current-month" | "last-3-months" | "all";
}

const FILTER_OPTIONS = [
  { key: "current-month", label: "Bulan ini" },
  { key: "last-3-months", label: "3 bulan terakhir" },
  { key: "all", label: "Semua" },
] as const;

type FilterMode = (typeof FILTER_OPTIONS)[number]["key"] | "custom";

function getInitialFilterMode(
  period?: string,
  range?: MeterReadingsTableProps["initialRangeFilter"]
): FilterMode {
  if (period) return "custom";
  if (range === "current-month" || range === "last-3-months") return range;
  return "all";
}

function formatMonthOnly(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function toMonthInputValue(value?: string): string {
  if (!value) return "";
  const match = value.match(/^(\d{4}-\d{2})/);
  return match?.[1] ?? "";
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const year = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, index, 1);
    const value = `${year}-${String(index + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("id-ID", { month: "long" });
    return { value, label };
  });
}

function getUsageLabel(reading: MeterReading): string {
  return `${formatMeter(reading.previous_reading)} → ${formatMeter(reading.current_reading)}`;
}

export function MeterReadingsTable({
  initialReadings,
  total,
  initialPage,
  initialPeriodFilter,
  initialRangeFilter,
}: MeterReadingsTableProps) {
  const [readings, setReadings] = useState<MeterReading[]>(initialReadings);
  const [totalCount, setTotalCount] = useState(total);
  const [page, setPage] = useState(initialPage);
  const [periodFilter, setPeriodFilter] = useState(toMonthInputValue(initialPeriodFilter));
  const [filterMode, setFilterMode] = useState<FilterMode>(() =>
    getInitialFilterMode(initialPeriodFilter, initialRangeFilter)
  );
  const [loading, setLoading] = useState(false);
  const monthOptions = getMonthOptions();

  async function fetchReadings(
    nextPage: number,
    options: { mode?: FilterMode; period?: string } = {}
  ) {
    setLoading(true);
    const nextMode = options.mode ?? filterMode;
    const nextPeriod = options.period ?? periodFilter;
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "20",
    });

    if (nextMode === "custom" && nextPeriod) {
      params.set("period", nextPeriod);
    } else if (nextMode === "current-month" || nextMode === "last-3-months") {
      params.set("range", nextMode);
    }

    try {
      const res = await fetch(`/api/customer/meter-readings?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat riwayat meter");
      const data = await res.json();
      setReadings((current) => (nextPage === 1 ? data.data : [...current, ...data.data]));
      setTotalCount(data.total);
      setPage(data.page);
    } catch (e) {
      console.error(e);
      if (nextPage === 1) {
        setReadings([]);
        setTotalCount(0);
        setPage(1);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterModeChange(nextMode: FilterMode) {
    setFilterMode(nextMode);
    if (nextMode === "custom") {
      if (periodFilter) await fetchReadings(1, { mode: nextMode });
      return;
    }

    setPeriodFilter("");
    await fetchReadings(1, { mode: nextMode, period: "" });
  }

  async function handleCustomPeriodChange(nextPeriod: string) {
    setFilterMode("custom");
    setPeriodFilter(nextPeriod);
    if (!nextPeriod) return;
    await fetchReadings(1, { mode: "custom", period: nextPeriod });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-xl font-medium">Riwayat Pencatatan Meter</h1>
        <p className="text-sm text-muted-foreground">
          Catatan angka meter dan pemakaian pelanggan yang paling terbaru.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {FILTER_OPTIONS.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  variant={filterMode === filter.key ? "default" : "outline"}
                  size="sm"
                  disabled={loading && filterMode !== filter.key}
                  onClick={() => handleFilterModeChange(filter.key)}
                  className={cn("shrink-0 px-3", filterMode !== filter.key && "bg-card")}
                >
                  {filter.label}
                </Button>
              ))}
              <select
                value={filterMode === "custom" ? periodFilter : ""}
                onChange={(event) => handleCustomPeriodChange(event.target.value)}
                disabled={loading}
                aria-label="Pilih bulan pencatatan"
                className={cn(
                  "h-7 shrink-0 rounded-lg border px-3 text-[0.8rem] font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                  filterMode === "custom"
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                <option value="">Lainnya</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {readings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
              <HugeiconsIcon icon={GaugeIcon} className="size-8" />
              <p className="font-medium">Belum ada pencatatan meter</p>
              <p className="text-sm">Riwayat pencatatan meter akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readings.map((reading) => (
                <Link
                  key={reading.id}
                  href={`/customer/meter-readings/${reading.id}`}
                  className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {formatMonthOnly(reading.period)}
                      </p>
                      <p className="text-lg font-medium text-foreground">
                        {formatMeter(reading.current_reading)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pemakaian {formatMeter(reading.usage)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={reading.photo_path ? "success" : "secondary"}>
                        {reading.photo_path ? "Ada foto" : "Tanpa foto"}
                      </Badge>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Urutan meter</p>
                      <p className="mt-0.5 font-medium text-foreground">{getUsageLabel(reading)}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">Pencatatan</p>
                      <p className="mt-0.5 font-medium text-foreground">
                        {reading.recorded_at ? formatDate(reading.recorded_at) : formatShortPeriod(reading.period)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {readings.length < totalCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchReadings(page + 1)}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? "Memuat..." : `Muat Lebih Banyak (${readings.length}/${totalCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}
