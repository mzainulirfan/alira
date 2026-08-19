"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  PrinterIcon,
  QrCodeIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createCustomerQrPayload } from "@/lib/customer-qr";
import type { Customer } from "@/lib/types";

export function CustomerQrClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(customers.map((customer) => customer.id))
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = customers.filter(
    (customer) =>
      !normalizedSearch ||
      customer.name.toLowerCase().includes(normalizedSearch) ||
      customer.customer_number.toLowerCase().includes(normalizedSearch) ||
      (customer.meter_number ?? "").toLowerCase().includes(normalizedSearch)
  );
  const selectedCustomers = customers.filter((customer) => selected.has(customer.id));

  function toggleCustomer(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    const allSelected = filtered.every((customer) => selected.has(customer.id));
    setSelected((current) => {
      const next = new Set(current);
      for (const customer of filtered) {
        if (allSelected) next.delete(customer.id);
        else next.add(customer.id);
      }
      return next;
    });
  }

  return (
    <div data-qr-print-page className="flex flex-col gap-4">
      <div data-print-hide>
        <SubPageHeader
          title="QR Pelanggan"
          description={`${selected.size} dari ${customers.length} pelanggan dipilih`}
          action={
            <Button
              disabled={selected.size === 0}
              onClick={() => window.print()}
            >
              <HugeiconsIcon icon={PrinterIcon} />
              Cetak
            </Button>
          }
        />
      </div>

      <div data-print-hide className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, pelanggan, atau meter..."
            className="h-11 w-full rounded-sm border border-border bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Reset filter"
              className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={toggleAllFiltered}>
          {filtered.length > 0 && filtered.every((customer) => selected.has(customer.id))
            ? "Batalkan Pilihan"
            : "Pilih Semua"}
        </Button>
        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Reset Filter
          </Button>
        )}
      </div>

      <div data-print-hide className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <HugeiconsIcon icon={QrCodeIcon} className="size-7 text-muted-foreground" />
              <p className="font-medium">Pelanggan tidak ditemukan</p>
              <p className="text-sm text-muted-foreground">
                Coba nama atau nomor pelanggan lainnya.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((customer) => (
            <label key={customer.id} className="cursor-pointer">
              <Card className={selected.has(customer.id) ? "border-primary/40 bg-primary/5" : undefined}>
                <CardContent className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(customer.id)}
                    onChange={() => toggleCustomer(customer.id)}
                    className="size-4 accent-primary"
                  />
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={QrCodeIcon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.customer_number}
                      {customer.meter_number ? ` · Meter ${customer.meter_number}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </label>
          ))
        )}
      </div>

      <div data-qr-print-grid className="hidden">
        {selectedCustomers.map((customer) => (
          <QrPrintLabel key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}

function QrPrintLabel({ customer }: { customer: Customer }) {
  return (
    <div className="flex break-inside-avoid flex-col items-center border border-slate-300 p-4 text-center text-slate-950">
      <QRCodeSVG
        value={createCustomerQrPayload(customer.customer_number)}
        size={150}
        level="M"
        marginSize={1}
        title={`QR ${customer.customer_number}`}
      />
      <p className="mt-2 font-medium">{customer.name}</p>
      <p className="font-mono text-xs font-medium">{customer.customer_number}</p>
      <p className="mt-0.5 text-[10px] text-slate-600">
        {customer.meter_number ? `Meter ${customer.meter_number}` : "Tanpa nomor meter"}
      </p>
      <p className="mt-1 text-[9px] font-medium tracking-wide text-slate-500 uppercase">
        Scan dengan Alira
      </p>
    </div>
  );
}
