"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { BanknoteIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatShortPeriod } from "@/lib/format";
import type { PaymentWithBill } from "@/lib/data/payments";

const METHOD_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
};

export function PaymentsClient({
  payments,
}: {
  payments: PaymentWithBill[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-medium">Pembayaran</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat pembayaran terbaru
        </p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-muted">
              <HugeiconsIcon icon={BanknoteIcon} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Belum ada pembayaran.</p>
              <p className="text-sm text-muted-foreground">
                Catat pembayaran dari halaman detail tagihan.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <Link key={p.id} href={`/bills/${p.bill_id}`}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <HugeiconsIcon icon={BanknoteIcon} size={20} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{p.bill.customer.name}</p>
                      <Badge variant="secondary" className="shrink-0">
                        {METHOD_LABEL[p.payment_method]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.bill.customer.customer_number} ·{" "}
                      {formatShortPeriod(p.bill.period.slice(0, 7))} ·{" "}
                      {formatDate(p.payment_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4 text-muted-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}