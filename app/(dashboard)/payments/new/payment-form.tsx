"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, BanknoteIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  recordPaymentAction,
  type RecordPaymentState,
} from "@/app/actions/payments";
import { formatCurrency } from "@/lib/format";

const initialState: RecordPaymentState = {};

export function PaymentForm({
  bill,
}: {
  bill: {
    id: string;
    total_amount: number;
    period: string;
    status: string;
    customer: { name: string; customer_number: string };
  };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    recordPaymentAction,
    initialState
  );
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
  }

  useEffect(() => {
    if (state?.success) {
      toast.success("Pembayaran tercatat. Tagihan lunas.");
      router.push("/payments");
    } else if (state?.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/bills" />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="text-xl font-semibold">Catat Pembayaran</h1>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={BanknoteIcon} size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{bill.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              {bill.customer.customer_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tagihan</p>
            <p className="font-semibold">{formatCurrency(bill.total_amount)}</p>
          </div>
        </CardContent>
      </Card>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="bill_id" value={bill.id} />
        <input type="hidden" name="amount" value={bill.total_amount} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
          <Input
            id="payment_date"
            name="payment_date"
            type="date"
            defaultValue={today}
            required
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm leading-none font-medium">
            Metode Pembayaran
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "cash", label: "Tunai" },
                { value: "transfer", label: "Transfer" },
              ] as const
            ).map((m) => (
              <label
                key={m.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors has-[:checked]:border-ring has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={m.value}
                  defaultChecked={m.value === "cash"}
                  className="size-4 accent-primary"
                />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="cth. dibayar langsung di kantor"
          />
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Menyimpan..." : "Konfirmasi Pembayaran"}
        </Button>
      </form>
    </div>
  );
}