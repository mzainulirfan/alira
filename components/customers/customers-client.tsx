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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "@/components/customers/customer-form";
import { loadMoreCustomersAction } from "@/app/actions/customers";
import type { Customer } from "@/lib/types";

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pelanggan</h1>
          <p className="text-sm text-muted-foreground">
            {activeTotal} aktif dari {total} pelanggan
          </p>
        </div>
        {canEdit && <CustomerForm />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nomor pelanggan, atau meter..."
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
        <div ref={filterRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Filter status pelanggan"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <HugeiconsIcon icon={FilterIcon} />
            {status !== "all" && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {filterOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
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
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{tab.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {counts[tab.key as keyof typeof counts]}
                    </span>
                    {active && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-4 text-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">
              {query
                ? `Menampilkan ${customers.length} hasil`
                : `Menampilkan ${customers.length} dari ${counts[status as keyof typeof counts]} pelanggan`}
            </span>
            {status !== "all" && (
              <Badge variant="secondary">
                {STATUS_TABS.find((tab) => tab.key === status)?.label}
              </Badge>
            )}
            {query && <Badge variant="secondary">“{query}”</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
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
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <HugeiconsIcon icon={UserGroupIcon} size={20} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{c.name}</p>
                      <Badge
                        variant={c.status === "active" ? "success" : "secondary"}
                        className="shrink-0"
                      >
                        {c.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.customer_number}
                      {c.meter_number ? ` · Meter ${c.meter_number}` : ""}
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
          {nextCursor && (
            <Button
              type="button"
              variant="outline"
              className="mt-1"
              onClick={loadMore}
              disabled={loadingMore}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} />
              {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
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
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-muted">
          <HugeiconsIcon icon={UserGroupIcon} size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            {hasFilter ? "Tidak ada hasil." : "Belum ada pelanggan."}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? "Tidak ada pelanggan yang cocok dengan pencarian atau filter."
              : "Tambahkan pelanggan pertama untuk mulai mengelola PAM."}
          </p>
        </div>
        {hasFilter ? (
          <Button variant="outline" onClick={onClearFilters}>
            Hapus Filter
          </Button>
        ) : canEdit ? (
          <CustomerForm />
        ) : null}
      </CardContent>
    </Card>
  );
}
