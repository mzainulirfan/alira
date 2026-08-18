"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GaugeIcon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
}: {
  rows: ReadingWithCustomer[];
  period: string;
  done: number;
  total: number;
  tariff: Tariff | null;
  query: string;
  status: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

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

  const hasFilter = query !== "" || status !== "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pencatatan Meter</h1>
          <p className="text-sm text-muted-foreground">{formatShortPeriod(period)}</p>
        </div>
        <PeriodPicker period={period} basePath="/meter-readings" />
      </div>

      {!tariff && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Belum ada tarif aktif. Atur tarif di{" "}
          <Link href="/more/tariffs" className="underline underline-offset-2">
            Pengaturan Tarif
          </Link>{" "}
          agar perkiraan tagihan dapat dihitung.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <SectionLabel>Ringkasan Pencatatan</SectionLabel>
        <Card>
          <CardContent className="flex flex-col gap-2 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{pct}%</span>{" "}
              meter tercatat dari {total} pelanggan
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {pending > 0 ? (
              <p className="text-sm">
                <span className="font-semibold text-warning">{pending}</span>{" "}
                pelanggan belum dicatat
              </p>
            ) : (
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                Semua meter sudah dicatat untuk {formatShortPeriod(period)}.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, nomor pelanggan, nomor meter..."
          className="h-10 w-full rounded-lg border border-input bg-transparent pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Bersihkan pencarian"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.key}
            variant={status === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ status: f.key })}
          >
            {f.label}
            <span className="text-xs opacity-70">
              {counts[f.key as keyof typeof counts]}
            </span>
          </Button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={GaugeIcon} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                {hasFilter ? "Tidak ada hasil." : "Belum ada pelanggan."}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasFilter
                  ? "Tidak ada pelanggan yang cocok dengan pencarian atau filter."
                  : "Tambahkan pelanggan aktif terlebih dahulu."}
              </p>
            </div>
            {hasFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  updateParams({ q: "", status: "all" });
                }}
              >
                Hapus Filter
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ customer, reading, previousReading, previousPeriod }) => (
            <Card key={customer.id}>
              <CardContent className="flex flex-col gap-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
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
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ReadingStatusBadge reading={reading} />
                    {reading && (
                      <ReadingForm
                        customer={customer}
                        period={period}
                        reading={reading}
                        previousReading={reading.previous_reading}
                        tariff={tariff}
                      />
                    )}
                  </div>
                </div>

                {reading ? (
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      {formatMeter(reading.previous_reading)} →{" "}
                      <span className="font-medium text-foreground">
                        {formatMeter(reading.current_reading)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Pemakaian{" "}
                      <span className="font-medium text-foreground">
                        {formatMeter(reading.usage)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <p className="min-w-0 text-muted-foreground">
                      Meter sebelumnya{" "}
                      <span className="font-medium text-foreground">
                        {formatMeter(previousReading)}
                      </span>
                      {previousPeriod
                        ? ` · ${formatShortPeriod(previousPeriod)}`
                        : " · belum pernah dicatat"}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/customers/${customer.id}`} />}
                      >
                        Detail
                      </Button>
                      <ReadingForm
                        customer={customer}
                        period={period}
                        previousReading={previousReading}
                        tariff={tariff}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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