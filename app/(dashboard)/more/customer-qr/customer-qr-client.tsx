"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  PrinterIcon,
  QrCodeIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { createCustomerQrPayload } from "@/lib/customer-qr";
import type { Customer } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";

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
    <div data-qr-print-page className="flex flex-col gap-5">
      <div data-print-hide className="flex items-end justify-between gap-3">
        <Link href="/more" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            QR Pelanggan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {selected.size} dari {customers.length} pelanggan dipilih
          </p>
        </div>
        <Button variant="outline" className="rounded-[10px] border-line" onClick={() => window.print()}>
          <HugeiconsIcon icon={PrinterIcon} /> Cetak {selected.size} QR
        </Button>
      </div>

      <section data-print-hide className="flex flex-col">
        <SectionHeading title="Pilih Pelanggan" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, pelanggan, atau meter..."
              className="h-11 w-full rounded-[10px] border border-line bg-card pr-9 pl-9 text-sm outline-none placeholder:text-muted-2 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Reset filter"
                className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-2 hover:bg-aqua-light hover:text-petrol"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="rounded-[10px] border-line" onClick={toggleAllFiltered}>
            {filtered.length > 0 && filtered.every((customer) => selected.has(customer.id))
              ? "Batalkan Pilihan"
              : "Pilih Semua"}
          </Button>
          {search && <Button variant="outline" size="sm" className="rounded-[10px] border-line" onClick={() => setSearch("")}>Reset Filter</Button>}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div data-print-hide><EmptyState /></div>
      ) : (
        <section data-print-hide className="flex flex-col">
          <SectionHeading title="Daftar Pelanggan" />
          <div className="rounded-[14px] border border-line bg-card divide-y divide-dashed divide-line">
            {filtered.map((customer) => (
              <label key={customer.id} className="cursor-pointer group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-transparent bg-transparent py-3.5 pr-3 pl-4 transition-all hover:border-petrol/30 hover:bg-petrol/3">
                <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass opacity-0 group-hover:opacity-100 transition-opacity" />
                <input
                  type="checkbox"
                  checked={selected.has(customer.id)}
                  onChange={() => toggleCustomer(customer.id)}
                  className="size-4 shrink-0 accent-primary"
                />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors group-hover:bg-petrol group-hover:text-white">
                  <HugeiconsIcon icon={QrCodeIcon} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{customer.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-2">{customer.customer_number}{customer.meter_number ? ` · Meter ${customer.meter_number}` : ""}</p>
                </div>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div data-qr-print-grid className="hidden">
        {selectedCustomers.map((customer) => (
          <QrPrintLabel key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={QrCodeIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">Pelanggan tidak ditemukan</p>
        <p className="text-[13px] text-muted-2">Coba nama atau nomor pelanggan lainnya.</p>
      </div>
    </div>
  );
}

function QrPrintLabel({ customer }: { customer: Customer }) {
  return (
    <div className="flex break-inside-avoid flex-col items-center border border-dashed border-slate-400 bg-white p-3 text-center text-slate-950">
      <QRCodeSVG
        value={createCustomerQrPayload(customer.customer_number)}
        size={140}
        level="M"
        marginSize={1}
        title={`QR ${customer.customer_number}`}
      />
      <p className="mt-1.5 truncate w-full font-display text-[11px] font-semibold leading-tight text-petrol">{customer.name}</p>
      <p className="font-mono text-[10px] font-medium leading-none">{customer.customer_number}</p>
      <p className="mt-0.5 text-[8px] leading-none text-muted-2">
        {customer.meter_number ? `Meter ${customer.meter_number}` : "Tanpa meter"}
      </p>
      <p className="mt-1 text-[7px] font-medium tracking-wide text-muted-2 uppercase">
        Scan Alira
      </p>
    </div>
  );
}