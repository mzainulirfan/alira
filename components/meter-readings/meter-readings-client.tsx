"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GaugeIcon,
  Search01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FilterIcon,
  FilterResetIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { PeriodPicker } from "@/components/ui/period-picker";
import { ReadingForm, ReadingStatusBadge } from "@/components/meter-readings/reading-form";
import { QrScanner } from "@/components/meter-readings/qr-scanner";
import { formatMeter, formatShortPeriod } from "@/lib/format";
import { currentPeriod } from "@/lib/period";
import type { ReadingWithCustomer } from "@/lib/data/meter-readings";
import type { Tariff } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Belum Dicatat" },
  { key: "done", label: "Sudah Dicatat" },
] as const;

const CLS = {
  backButton: "flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80",
  searchInput: "h-11 w-full rounded-[10px] border border-line bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-2 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20",
  clearSearchBtn: "absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-2 transition-colors hover:bg-aqua-light hover:text-petrol",
  filterButton: "rounded-[10px] border-line",
  filterDropdown: "absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-[12px] border border-line bg-popover text-popover-foreground shadow-md",
  filterOption: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light",
  filterResetButton: "font-mono text-[11px] font-semibold text-muted-text hover:text-petrol",
  activeFilterBar: "flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-aqua-light/60 px-3 py-2 text-sm",
  periodBadge: "rounded-full bg-petrol px-2 py-0.5 font-mono text-[10px] font-bold text-white",
  statusBadge: "rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass",
  queryBadge: "rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass",
  resetFilterButton: "font-mono text-[11px] font-semibold text-muted-text hover:text-petrol",
  card: "group relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md",
  brassBar: "absolute top-0 bottom-0 left-0 w-1 bg-brass",
  dashedTop: "absolute inset-x-0 top-0 border-t border-dashed border-line",
  dashedBottom: "absolute inset-x-0 bottom-0 border-t border-dashed border-line",
  iconWrapper: (reading: boolean) => reading ? "bg-aqua-light text-aqua" : "bg-info/15 text-info",
  meterValue: "font-mono text-[15px] font-bold text-petrol whitespace-nowrap",
  usageBadge: "rounded-full bg-aqua-light px-2 py-0.5 font-mono text-[10px] font-bold text-aqua",
  arrowIcon: "flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white",
} as const;

export function MeterReadingsClient({
  rows,
  period,
  done,
  total,
  tariff,
  query,
  status,
  canEdit,
  hasActiveFilters,
  openCustomerId,
}: {
  rows: ReadingWithCustomer[];
  period: string;
  done: number;
  total: number;
  tariff: Tariff | null;
  query: string;
  status: string;
  canEdit: boolean;
  hasActiveFilters: boolean;
  openCustomerId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const openedCustomerRef = useRef<string | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pending = total - done;

  const counts = {
    all: total,
    pending,
    done,
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== query) updateParams({ q: search });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!openCustomerId) {
      openedCustomerRef.current = null;
      return;
    }
    if (openedCustomerRef.current === openCustomerId) return;
    openedCustomerRef.current = openCustomerId;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent("alira:open-reading", { detail: openCustomerId })
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete("open");
      router.replace(`/meter-readings?${params.toString()}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [openCustomerId, router, searchParams]);

  function updateParams(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status === "pending") sp.delete("status");
      else sp.set("status", next.status);
    }
    router.push(`/meter-readings?${sp.toString()}`);
  }

  function clearSearch() {
    setSearch("");
    updateParams({ q: "" });
    inputRef.current?.focus();
  }

  function clearAllFilters() {
    setSearch("");
    router.push("/meter-readings");
  }

  const hasFilter = hasActiveFilters;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/more" className={CLS.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Pencatatan Meter
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {done}/{total} dicatat · {pending} belum
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Filter & Cari" />
        <div className="flex flex-wrap items-center gap-2">
          <PeriodPicker period={period} basePath="/meter-readings" />
          <div className="relative min-w-48 flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
            />
            <input
              ref={inputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelanggan atau nomor meter..."
              className="h-11 w-full rounded-[10px] border border-line bg-card pr-[72px] pl-9 text-sm outline-none placeholder:text-muted-2 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20"
            />
            <div className="absolute top-1/2 right-1.5 -translate-y-1/2 flex items-center gap-1">
              <QrScanner period={period} canEdit={canEdit} />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Bersihkan pencarian"
                  className="flex size-6 items-center justify-center rounded-md text-muted-2 transition-colors hover:bg-aqua-light hover:text-petrol"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              )}
            </div>
          </div>
          <div ref={filterRef} className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label="Filter status pencatatan meter"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className="rounded-[10px] border-line"
            >
              <HugeiconsIcon icon={FilterIcon} />
              {status !== "pending" && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-brass" />
              )}
            </Button>
            {filterOpen && (
              <div
                role="listbox"
                className="absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-[12px] border border-line bg-popover text-popover-foreground shadow-md"
              >
                {STATUS_FILTERS.map((filter) => {
                  const active = status === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        updateParams({ status: filter.key });
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                    >
                      <span className={cn(active ? "font-semibold text-petrol" : "")}>{filter.label}</span>
                      <span className="font-mono text-xs text-muted-2">{counts[filter.key as keyof typeof counts]}</span>
                      {active && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-aqua-light/60 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-text">
              {query
                ? `Menampilkan ${rows.length} hasil`
                : `Menampilkan ${rows.length} dari ${counts[status as keyof typeof counts]} pelanggan`}
            </span>
            {period !== currentPeriod() && (
              <span className="rounded-full bg-petrol px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                {formatShortPeriod(period).toUpperCase()}
              </span>
            )}
            {status !== "pending" && (
              <span className="rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">
                {STATUS_FILTERS.find((filter) => filter.key === status)?.label.toUpperCase()}
              </span>
            )}
            {query && (
              <span className="rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">
                {query.toUpperCase()}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="font-mono text-[11px] font-semibold text-muted-text hover:text-petrol">
            <HugeiconsIcon icon={FilterResetIcon} />
            Reset Filter
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState status={status} hasFilter={hasFilter} period={period} onClear={clearAllFilters} />
      ) : (
        <section className="flex flex-col">
          <SectionHeading title="Daftar Pencatatan" />
          <div className="flex flex-col gap-2">
            {rows.map(({ customer, reading, previousReading }) => (
              <ReadingForm
                key={customer.id}
                customer={customer}
                period={period}
                reading={reading ?? null}
                previousReading={reading ? reading.previous_reading : previousReading}
                tariff={tariff}
                trigger={
                  <div
                    key={customer.id}
                    className="group relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
                  >
                    <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
                    <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
                    <div className="relative flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                          reading ? "bg-aqua-light text-aqua" : "bg-info/15 text-info"
                        )}
                      >
                        <HugeiconsIcon icon={GaugeIcon} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{customer.name}</p>
                        <p className="truncate font-mono text-[11px] text-muted-2">{customer.customer_number}{customer.meter_number ? ` · Meter ${customer.meter_number}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {reading ? (
                          <>
                            <ReadingStatusBadge reading={reading} />
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">{formatMeter(reading.current_reading)}</span>
                              {reading.usage > 0 && (
                                <span className="rounded-full bg-aqua-light px-2 py-0.5 font-mono text-[10px] font-bold text-aqua">
                                  {formatMeter(reading.usage)} m³
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <ReadingStatusBadge reading={null} />
                            <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">
                              {canEdit ? "Catat Meter" : "Belum"}
                            </span>
                          </>
                        )}
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                }
            />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({
  status,
  hasFilter,
  period,
  onClear,
}: {
  status: string;
  hasFilter: boolean;
  period: string;
  onClear: () => void;
}) {
  if (status === "pending" && !hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-[12px] bg-green-light text-green">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold text-petrol">Semua selesai</p>
          <p className="text-[13px] text-muted-2">Tidak ada meter yang belum dicatat untuk {formatShortPeriod(period)}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-muted text-muted-2">
        <HugeiconsIcon icon={GaugeIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">{hasFilter ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}</p>
        <p className="text-[13px] text-muted-2">{hasFilter ? "Coba nama atau nomor meter lainnya." : "Tambahkan pelanggan aktif terlebih dahulu."}</p>
      </div>
      {hasFilter && (
        <Button variant="outline" className="rounded-[10px] border-line" onClick={onClear}>
          Hapus Filter
        </Button>
      )}
    </div>
  );
}