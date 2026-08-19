"use client";

import { QRCodeSVG } from "qrcode.react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  PrinterIcon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCustomerQrPayload } from "@/lib/customer-qr";
import type { Customer } from "@/lib/types";

export function CustomerQrDialog({ customer }: { customer: Customer }) {
  const payload = createCustomerQrPayload(customer.customer_number);

  function downloadSvg() {
    const svg = document.querySelector(
      `[data-customer-qr="${customer.id}"] svg`
    );
    if (!svg) return;
    const content = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${customer.customer_number}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <HugeiconsIcon icon={QrCodeIcon} />
        QR
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Pelanggan</DialogTitle>
          <DialogDescription>
            Cetak dan pasang label ini pada meter pelanggan.
          </DialogDescription>
        </DialogHeader>

        <div
          data-print-customer-qr
          data-customer-qr={customer.id}
          className="flex flex-col items-center rounded-xl border bg-white p-5 text-center text-slate-950"
        >
          <QRCodeSVG
            value={payload}
            size={220}
            level="M"
            marginSize={2}
            title={`QR ${customer.customer_number}`}
          />
          <p className="mt-4 text-lg font-semibold">{customer.name}</p>
          <p className="font-mono text-sm font-medium">{customer.customer_number}</p>
          <p className="mt-1 text-xs text-slate-600">
            {customer.meter_number
              ? `Meter ${customer.meter_number}`
              : "Nomor meter belum diatur"}
          </p>
          <p className="mt-3 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
            Scan dengan Alira
          </p>
        </div>

        <DialogFooter data-print-hide>
          <Button variant="outline" onClick={downloadSvg}>
            <HugeiconsIcon icon={Download01Icon} />
            Unduh SVG
          </Button>
          <Button onClick={() => window.print()}>
            <HugeiconsIcon icon={PrinterIcon} />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
