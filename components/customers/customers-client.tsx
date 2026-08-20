"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  FilterIcon,
  FilterResetIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { CustomerForm } from "@/components/customers/customer-form";
import { loadMoreCustomersAction } from "@/app/actions/customers";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Nonaktif" },
] as const;

export function CustomersClient({
  customers: initialCustomers,
  nextCursor: initialNextCursor,
  total,
  activeTotal,
  query,
  status,
  canEdit,
}: {
  customers: Customer[];
  nextCursor: string | null;
  total: number;
  activeTotal: number;
  query: string;
  status: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [customers, setCustomers] = useState(initialCustomers);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [prevPage, setPrevPage] = useState({
    customers: initialCustomers,
    nextCursor: initialNextCursor,
  });
  if (
    prevPage.customers !== initialCustomers ||
    prevPage.nextCursor !== initialNextCursor
  ) {
    setPrevPage({ customers: initialCustomers, nextCursor: initialNextCursor });
    setCustomers(initialCustomers);
    setNextCursor(initialNextCursor);
    setLoadingMore(false);
  }

  const counts = {
    all: total,
    active: activeTotal,
    inactive: total - activeTotal,
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
    sp.delete("cursor");
    router.push(`/customers?${sp.toString()}`);
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await loadMoreCustomersAction({
        query,
        status,
        cursor: nextCursor,
      });
      setCustomers((prev) => [...prev, ...result.customers]);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Gagal memuat data pelanggan lain:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  function clearSearch() {
    setSearch("");
    updateParams({ q: "" });
    inputRef.current?.focus();
  }

  function resetFilters() {
    setSearch("");
    router.push("/customers");
  }

  const hasActiveFilters = query !== "" || status !== "all";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Pelanggan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {activeTotal} aktif dari {total} pelanggan terdaftar
          </p>
        </div>
        {canEdit && (
          <CustomerForm
            trigger={
              <Button className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2">
                <HugeiconsIcon icon={Add01Icon} />
                Tambah Pelanggan
              </Button>
            }
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => updateParams({ status: tab.key })}
              className={cn(
                "flex min-h-[82px] flex-col rounded-[14px] border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                active
                  ? "border-petrol/40 bg-petrol text-white"
                  : "border-line bg-card hover:border-petrol/30"
              )}
            >
              <p
                className={cn(
                  "text-[10.5px] font-semibold uppercase tracking-[0.04em]",
                  active ? "text-aqua" : "text-muted-text"
                )}
              >
                {tab.label}
              </p>
              <p
                className={cn(
                  "mt-auto font-mono text-[22px] font-semibold",
                  active ? "text-white" : "text-petrol"
                )}
              >
                {counts[tab.key as keyof typeof counts]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
            placeholder="Cari nama, nomor pelanggan, atau meter..."
            className="h-11 w-full rounded-[10px] border border-line bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-2 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
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
            aria-label="Filter status pelanggan"
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
              {STATUS_TABS.map((tab) => {
                const active = status === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      updateParams({ status: tab.key });
                      setFilterOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                  >
                    <span className={cn(active ? "font-semibold text-petrol" : "")}>
                      {tab.label}
                    </span>
                    <span className="font-mono text-xs text-muted-2">
                      {counts[tab.key as keyof typeof counts]}
                    </span>
                    {active && (
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-aqua-light/60 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-text">
              {query
                ? `Menampilkan ${customers.length} hasil`
                : `Menampilkan ${customers.length} dari ${counts[status as keyof typeof counts]} pelanggan`}
            </span>
            {status !== "all" && (
              <span className="rounded-full bg-petrol px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                {STATUS_TABS.find((tab) => tab.key === status)?.label.toUpperCase()}
              </span>
            )}
            {query && (
              <span className="rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">
                {query.toUpperCase()}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="font-mono text-[11px] font-semibold text-muted-text hover:text-petrol">
            <HugeiconsIcon icon={FilterResetIcon} />
            Reset Filter
          </Button>
        </div>
      )}

      {customers.length === 0 ? (
        <EmptyState
          hasFilter={hasActiveFilters}
          onClearFilters={resetFilters}
          canEdit={canEdit}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <div className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
                <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60" />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
                  <HugeiconsIcon icon={UserGroupIcon} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-[13.5px] font-semibold text-petrol">
                      {c.name}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                        c.status === "active"
                          ? "bg-green-light text-green"
                          : "bg-coral-light text-coral"
                      )}
                    >
                      {c.status === "active" ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </div>
                  <p className="truncate font-mono text-[11px] text-muted-2">
                    {c.customer_number}
                    {c.meter_number ? ` · METER ${c.meter_number}` : ""}
                  </p>
                </div>
                <span className="flex size-6 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
          {nextCursor && (
            <Button
              type="button"
              variant="outline"
              className="mt-1 rounded-[10px] border-line font-mono text-[12px] font-semibold text-muted-text hover:text-petrol"
              onClick={loadMore}
              disabled={loadingMore}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} />
              {loadingMore ? "MEMUAT..." : "MUAT LEBIH BANYAK"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasFilter,
  onClearFilters,
  canEdit,
}: {
  hasFilter: boolean;
  onClearFilters: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={UserGroupIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">
          {hasFilter ? "Tidak ada hasil." : "Belum ada pelanggan."}
        </p>
        <p className="text-[13px] text-muted-2">
          {hasFilter
            ? "Tidak ada pelanggan yang cocok dengan pencarian atau filter."
            : "Tambahkan pelanggan pertama untuk mulai mengelola PAM."}
        </p>
      </div>
      {hasFilter ? (
        <Button variant="outline" className="rounded-[10px] border-line" onClick={onClearFilters}>
          Hapus Filter
        </Button>
      ) : canEdit ? (
        <CustomerForm
          trigger={
            <Button className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2">
              <HugeiconsIcon icon={Add01Icon} />
              Tambah Pelanggan
            </Button>
          }
        />
      ) : null}
    </div>
  );
}