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
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { PeriodPicker } from "@/components/ui/period-picker";
import { ReadingForm, ReadingStatusBadge } from "@/components/meter-readings/reading-form";
import { formatMeter, formatShortPeriod } from "@/lib/format";
import type { ReadingWithCustomer } from "@/lib/data/meter-readings";
import type { Tariff } from "@/lib/types";

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Belum Dicatat" },
  { key: "done", label: "Sudah Dicatat" },
] as const;

export function MeterReadingsClient({
  rows,
  period,
  done,
  total,
  tariff,
  query,
  status,
  pendingCustomers,
  canEdit,
  hasActiveFilters,
}: {
  rows: ReadingWithCustomer[];
  period: string;
  done: number;
  total: number;
  tariff: Tariff | null;
  query: string;
  status: string;
  pendingCustomers: ReadingWithCustomer[];
  canEdit: boolean;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParams(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status === "all") sp.delete("status");
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Pencatatan Meter</h1>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodPicker period={period} basePath="/meter-readings" />
        <select
          value={status}
          onChange={(event) => updateParams({ status: event.target.value })}
          aria-label="Filter status pencatatan meter"
          className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-56"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.key} value={filter.key}>
              {filter.label} ({counts[filter.key as keyof typeof counts]})
            </option>
          ))}
        </select>
        <div className="relative min-w-48 flex-1 sm:max-w-80">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan atau nomor meter..."
            className="h-8 w-full rounded-lg border border-border bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Bersihkan pencarian"
              className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Reset Filter
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          status={status}
          hasFilter={hasFilter}
          period={period}
          onClear={clearAllFilters}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ customer, reading, previousReading, previousPeriod, billStatus }) =>
            reading ? (
              <Card
                key={customer.id}
                className="relative cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/20 focus-within:border-primary/40"
              >
                {canEdit && billStatus !== "paid" ? (
                  <ReadingForm
                    customer={customer}
                    period={period}
                    reading={reading}
                    previousReading={reading.previous_reading}
                    tariff={tariff}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Ubah pencatatan meter ${customer.name}`}
                        className="absolute inset-0 z-10 rounded-xl text-transparent outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    }
                  />
                ) : (
                  <Link
                    href={`/customers/${customer.id}`}
                    aria-label={`Lihat detail pelanggan ${customer.name}`}
                    className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                )}
                <CardContent className="flex flex-col gap-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/customers/${customer.id}`}
                      aria-label={`Lihat detail pelanggan ${customer.name}`}
                      className="relative z-20 flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <HugeiconsIcon icon={GaugeIcon} size={20} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.customer_number}
                          {customer.meter_number ? ` · Meter ${customer.meter_number}` : ""}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <ReadingStatusBadge reading={reading} />
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-4 text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      {formatMeter(reading.previous_reading)} →{" "}
                      <span className="font-medium text-foreground">
                        {formatMeter(reading.current_reading)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Pemakaian{" "}
                      <span className="font-semibold text-foreground">
                        {formatMeter(reading.usage)}
                      </span>
                    </p>
                  </div>

                  {canEdit && (
                    <div className="flex justify-end border-t pt-2">
                      <span
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className:
                            "pointer-events-none " +
                            (billStatus === "paid" ? "opacity-50" : ""),
                        })}
                      >
                        {billStatus === "paid" ? "Terkunci · Tagihan Lunas" : "Ubah"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card
                key={customer.id}
                className="relative cursor-pointer border-warning/30 transition-colors hover:border-warning/60 hover:bg-warning/5 focus-within:border-warning/60"
              >
                {canEdit ? (
                  <ReadingForm
                    customer={customer}
                    period={period}
                    previousReading={previousReading}
                    tariff={tariff}
                    nextCustomerId={
                      pendingCustomers[
                        pendingCustomers.findIndex(
                          (pending) => pending.customer.id === customer.id
                        ) + 1
                      ]?.customer.id ?? null
                    }
                    trigger={
                      <button
                        type="button"
                        aria-label={`Catat meter ${customer.name}`}
                        className="absolute inset-0 z-10 rounded-xl text-transparent outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    }
                  />
                ) : (
                  <Link
                    href={`/customers/${customer.id}`}
                    aria-label={`Lihat detail pelanggan ${customer.name}`}
                    className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                )}
                <CardContent className="flex flex-col gap-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/customers/${customer.id}`}
                      aria-label={`Lihat detail pelanggan ${customer.name}`}
                      className="relative z-20 flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                        <HugeiconsIcon icon={GaugeIcon} size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.customer_number}
                          {customer.meter_number ? ` · Meter ${customer.meter_number}` : ""}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <ReadingStatusBadge reading={null} />
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-4 text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">Meter sebelumnya</p>
                    <p className="font-medium text-foreground">
                      {previousPeriod
                        ? formatMeter(previousReading)
                        : "Belum ada"}
                    </p>
                  </div>

                  {canEdit && (
                    <span
                      className={buttonVariants({
                        className: "pointer-events-none w-full",
                      })}
                    >
                      Catat Meter
                    </span>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
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
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} />
          </div>
          <div>
            <p className="font-medium">Semua selesai</p>
            <p className="text-sm text-muted-foreground">
              Tidak ada meter yang belum dicatat untuk{" "}
              {formatShortPeriod(period)}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={GaugeIcon} size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            {hasFilter ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? "Coba nama atau nomor meter lainnya."
              : "Tambahkan pelanggan aktif terlebih dahulu."}
          </p>
        </div>
        {hasFilter && (
          <Button variant="outline" onClick={onClear}>
            Reset Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
