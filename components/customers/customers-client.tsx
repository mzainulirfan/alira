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
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "@/components/customers/customer-form";
import type { Customer } from "@/lib/types";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Nonaktif" },
] as const;

export function CustomersClient({
  customers,
  total,
  activeTotal,
  query,
  status,
  canEdit,
}: {
  customers: Customer[];
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
    router.push(`/customers?${sp.toString()}`);
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
        <select
          value={status}
          onChange={(event) => updateParams({ status: event.target.value })}
          aria-label="Filter status pelanggan"
          className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-52"
        >
          {STATUS_TABS.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label} ({counts[tab.key as keyof typeof counts]})
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset Filter
          </Button>
        )}
      </div>

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
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
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
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
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
