"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BanknoteIcon,
  CheckmarkCircle01Icon,
  FilterIcon,
  Coins01Icon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatShortPeriod } from "@/lib/format";
import type { PaymentWithBill } from "@/lib/data/payments";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
};

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "cash", label: "Tunai" },
  { key: "transfer", label: "Transfer" },
] as const;

export function PaymentsClient({
  payments,
}: {
  payments: PaymentWithBill[];
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState<"all" | "cash" | "transfer">("all");
  const [search, setSearch] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesStatus =
      status === "all" || p.payment_method === status;
    if (!matchesStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.bill.customer.name.toLowerCase().includes(q) ||
      p.bill.customer.customer_number.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: payments.length,
    cash: payments.filter((p) => p.payment_method === "cash").length,
    transfer: payments.filter((p) => p.payment_method === "transfer").length,
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Pembayaran
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {filteredPayments.length} dari {payments.length} pembayaran
          </p>
        </div>
      </div>

      {payments.length > 0 && (
        <section className="flex flex-col">
          <SectionHeading title="Ringkasan" />
          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4">
              <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua" />
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
                  <HugeiconsIcon icon={Coins01Icon} size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-2">Total</p>
                  <p className="font-mono text-[15px] font-bold text-petrol">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4">
              <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brass-light text-brass">
                  <HugeiconsIcon icon={BanknoteIcon} size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-2">Transaksi</p>
                  <p className="font-mono text-[15px] font-bold text-petrol">
                    {filteredPayments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col">
        <SectionHeading title="Filter & Cari" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
            />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau nomor pelanggan..."
              className="h-11 w-full rounded-[10px] border border-line bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-2 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                aria-label="Bersihkan pencarian"
                className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-2 transition-colors hover:bg-aqua-light hover:text-petrol"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            )}
          </div>
          <div ref={filterRef} className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label="Filter metode pembayaran"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className="rounded-[10px] border-line"
            >
              <HugeiconsIcon icon={FilterIcon} />
              {status !== "all" && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-brass" />
              )}
            </Button>
            {filterOpen && (
              <div
                role="listbox"
                className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-[12px] border border-line bg-popover text-popover-foreground shadow-md"
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
                        setStatus(filter.key);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                    >
                      <span
                        className={cn(
                          active ? "font-semibold text-petrol" : ""
                        )}
                      >
                        {filter.label}
                      </span>
                      <span className="font-mono text-xs text-muted-2">
                        {counts[filter.key]}
                      </span>
                      {active && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="size-4 text-aqua"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {filteredPayments.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="flex flex-col">
          <SectionHeading title="Riwayat Pembayaran" />
          <div className="flex flex-col gap-3">
            {filteredPayments.map((p) => (
              <Link key={p.id} href={`/bills/${p.bill_id}`}>
                <div className="group relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
                  <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua" />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 border-t border-dashed border-line"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 border-t border-dashed border-line"
                  />
                  <div className="relative flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
                      <HugeiconsIcon icon={BanknoteIcon} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-[13.5px] font-semibold text-petrol">
                          {p.bill.customer.name}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                            p.payment_method === "cash"
                              ? "bg-brass-light text-brass"
                              : "bg-aqua-light text-aqua"
                          )}
                        >
                          {METHOD_LABEL[p.payment_method].toUpperCase()}
                        </span>
                      </div>
                      <p className="truncate font-mono text-[11px] text-muted-2">
                        {p.bill.customer.customer_number} ·{" "}
                        {formatShortPeriod(p.bill.period)} ·{" "}
                        {formatDate(p.payment_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-3.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-muted text-muted-2">
        <HugeiconsIcon icon={BanknoteIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">
          Belum ada pembayaran
        </p>
        <p className="text-[13px] text-muted-2">
          Catat pembayaran dari halaman detail tagihan.
        </p>
      </div>
    </div>
  );
}
