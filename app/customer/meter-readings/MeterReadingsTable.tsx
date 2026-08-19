"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GaugeIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMeter, formatShortPeriod } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MeterReading } from "@/lib/types";

interface MeterReadingsTableProps {
  initialReadings: MeterReading[];
  total: number;
  initialPage: number;
  initialPeriodFilter?: string;
}

export function MeterReadingsTable({
  initialReadings,
  total,
  initialPage,
  initialPeriodFilter,
}: MeterReadingsTableProps) {
  const [readings, setReadings] = useState<MeterReading[]>(initialReadings);
  const [totalCount, setTotalCount] = useState(total);
  const [page, setPage] = useState(initialPage);
  const [periodFilter, setPeriodFilter] = useState(initialPeriodFilter || "");
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchReadings(nextPage: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customer/meter-readings?page=${nextPage}&limit=20&period=${periodFilter}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Gagal memuat riwayat meter");
      const data = await res.json();
      setReadings(data.data);
      setTotalCount(data.total);
      setPage(data.page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePeriodChange(nextPeriod: string) {
    setPeriodFilter(nextPeriod);
    setFilterOpen(false);
    await fetchReadings(1);
  }

  async function handleLoadMore() {
    await fetchReadings(page + 1);
  }

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <HugeiconsIcon icon={GaugeIcon} className="size-8" />
        <p className="font-medium">Belum ada pencatatan meter</p>
        <p className="text-sm">Riwayat pencatatan meter akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-medium">Riwayat Pencatatan Meter</h2>
        <div ref={filterRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon-xl"
            aria-label="Filter periode"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <HugeiconsIcon icon={FilterIcon} size={18} />
            {periodFilter && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {filterOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
            >
              <button
                type="button"
                role="option"
                aria-selected={periodFilter === ""}
                onClick={() => handlePeriodChange("")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              >
                Semua Periode
              </button>
              {[
                "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
                "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
              ].map((period) => (
                <button
                  key={period}
                  type="button"
                  role="option"
                  aria-selected={periodFilter === period}
                  onClick={() => handlePeriodChange(period)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  {period.replace("-", "/")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Periode</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Angka Meter</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Pemakaian (m³)</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {readings.map((reading) => (
              <tr key={reading.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-3 py-3">{formatShortPeriod(reading.period)}</td>
                <td className="text-right px-3 py-3 font-medium">{formatMeter(reading.current_reading)}</td>
                <td className="text-center px-3 py-3">{formatMeter(reading.usage)}</td>
                <td className="text-center px-3 py-3">
                  {reading.photo_path ? (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <HugeiconsIcon icon={Image01Icon} size={12} />
                      Ada
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Tidak ada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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