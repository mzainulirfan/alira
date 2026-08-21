"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  GaugeIcon,
  Camera01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { formatMeter } from "@/lib/format";
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
  { key: "last-3-months", label: "3 bulan" },
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

function ReadingItem({
  reading,
}: {
  reading: MeterReading;
}) {
  const hasPhoto = Boolean(reading.photo_path);

  return (
    <Link
      href={`/customer/meter-readings/${reading.id}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua" />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />

      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={GaugeIcon} size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-[13.5px] font-semibold text-petrol">
            {formatMonthOnly(reading.period)}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
              hasPhoto ? "bg-green-light text-green" : "bg-muted-2/10 text-muted-2"
            )}
          >
            <HugeiconsIcon icon={Camera01Icon} className="size-2.5" />
            {hasPhoto ? "ADA FOTO" : "TANPA FOTO"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <p className="font-mono text-[13px] font-semibold text-petrol">
            {formatMeter(reading.current_reading)}
          </p>
          <span className="text-[11px] text-muted-2">
            Pemakaian {formatMeter(reading.usage)}
          </span>
        </div>
      </div>

      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={18}
        className="shrink-0 rotate-180 text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-petrol"
      />
    </Link>
  );
}

export function MeterReadingsTable({
  initialReadings,
  total,
  initialPage,
  initialPeriodFilter,
  initialRangeFilter,
}: MeterReadingsTableProps) {
  const router = useRouter();
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/customer/dashboard")}
          className="flex size-9 items-center justify-center rounded-[10px] border border-line bg-card text-petrol transition-colors hover:bg-aqua-light hover:text-aqua"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Riwayat Meter
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {totalCount} pencatatan total
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              disabled={loading && filterMode !== filter.key}
              onClick={() => handleFilterModeChange(filter.key)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-colors",
                filterMode === filter.key
                  ? "bg-petrol text-white"
                  : "bg-card text-muted-2 border border-line hover:bg-aqua-light hover:text-aqua"
              )}
            >
              {filter.label}
            </button>
          ))}
          <select
            value={filterMode === "custom" ? periodFilter : ""}
            onChange={(event) => handleCustomPeriodChange(event.target.value)}
            disabled={loading}
            aria-label="Pilih bulan pencatatan"
            className={cn(
              "h-7 rounded-full border px-3 font-mono text-[11px] font-semibold outline-none transition-colors",
              filterMode === "custom"
                ? "border-petrol bg-petrol text-white"
                : "border-line bg-card text-muted-2 hover:bg-aqua-light hover:text-aqua"
            )}
          >
            <option value="">Bulan lainnya</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {readings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-line bg-card py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted-2/10">
              <HugeiconsIcon icon={GaugeIcon} className="size-6 text-muted-2" />
            </div>
            <p className="font-display text-[13.5px] font-semibold text-petrol">
              Belum ada pencatatan
            </p>
            <p className="text-[12.5px] text-muted-2">
              Riwayat pencatatan meter akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {readings.map((reading) => (
              <ReadingItem key={reading.id} reading={reading} />
            ))}
          </div>
        )}
      </section>

      {readings.length < totalCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchReadings(page + 1)}
            disabled={loading}
            className="w-full max-w-xs rounded-[10px] border-line"
          >
            {loading ? "Memuat..." : `Muat Lebih Banyak (${readings.length}/${totalCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}
