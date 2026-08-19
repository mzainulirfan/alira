"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  BanknoteIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import {
  recordPaymentAction,
  type RecordPaymentState,
} from "@/app/actions/payments";
import { formatCurrency, formatDate, formatShortPeriod } from "@/lib/format";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [cashReceived, setCashReceived] = useState("");
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
      router.push(`/bills/${bill.id}`);
    } else if (state?.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const statusLabel = bill.status === "overdue" ? "Menunggak" : "Belum Dibayar";
  const cashReceivedAmount = Number(cashReceived) || 0;
  const cashDifference = cashReceivedAmount - bill.total_amount;
  const cashIsSufficient =
    paymentMethod === "transfer" || cashReceivedAmount >= bill.total_amount;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/bills/${bill.id}`} />}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          <span className="sr-only">Kembali</span>
        </Button>
        <div>
          <h1 className="text-xl font-medium">Catat Pembayaran</h1>
          <p className="text-sm text-muted-foreground">
            Periksa tagihan sebelum menyimpan pembayaran
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={InvoiceIcon} size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{bill.customer.name}</p>
              <p className="text-xs text-muted-foreground">
                {bill.customer.customer_number} ·{" "}
                {formatShortPeriod(bill.period.slice(0, 7))}
              </p>
            </div>
            <Badge variant={bill.status === "overdue" ? "destructive" : "warning"}>
              {statusLabel}
            </Badge>
          </div>

          <div className="rounded-md bg-primary/5 px-4 py-4 ring-1 ring-primary/15">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Total yang Dibayar
            </p>
            <p className="mt-1 text-3xl font-medium tracking-tight text-primary">
              {formatCurrency(bill.total_amount)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pembayaran harus sesuai dengan total tagihan.
            </p>
          </div>
        </CardContent>
      </Card>

      <form
        id="payment-form"
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="bill_id" value={bill.id} />
        <input type="hidden" name="amount" value={bill.total_amount} />

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Detail Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="payment_date"
                className="flex items-center gap-1.5"
              >
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-4 text-muted-foreground"
                />
                Tanggal Pembayaran
              </Label>
              <Input
                id="payment_date"
                name="payment_date"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                required
              />
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm leading-none font-medium">
                Metode Pembayaran
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "cash", label: "Tunai" },
                    { value: "transfer", label: "Transfer" },
                  ] as const
                ).map((method) => {
                  const selected = paymentMethod === method.value;
                  return (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-3 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-input text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon icon={BanknoteIcon} className="size-4" />
                        {method.label}
                      </span>
                      {selected && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="size-4 text-primary"
                        />
                      )}
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={selected}
                        onChange={() => setPaymentMethod(method.value)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {paymentMethod === "cash" && (
              <div className="flex flex-col gap-2 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="cash_received">Uang Diterima</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCashReceived(String(bill.total_amount))}
                  >
                    Uang Pas
                  </Button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="cash_received"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={cashReceived}
                    onChange={(event) => setCashReceived(event.target.value)}
                    placeholder="0"
                    className="h-12 pl-10 text-lg font-medium"
                    aria-invalid={cashReceived !== "" && cashDifference < 0}
                  />
                </div>

                {cashReceived === "" ? (
                  <p className="text-xs text-muted-foreground">
                    Masukkan nominal uang dari pelanggan atau pilih Uang Pas.
                  </p>
                ) : cashDifference < 0 ? (
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <span>Masih kurang</span>
                    <span className="font-medium">
                      {formatCurrency(Math.abs(cashDifference))}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                    <span>{cashDifference === 0 ? "Uang pas" : "Kembalian"}</span>
                    <span className="font-medium">
                      {formatCurrency(cashDifference)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5 border-t pt-4">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Contoh: dibayar langsung di kantor"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              className="w-full"
              disabled={!paymentDate || !cashIsSufficient || pending}
              onClick={() => setConfirmOpen(true)}
            >
              Periksa Pembayaran
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
           <ConfirmationDialogHeader
             icon={BanknoteIcon}
             title="Konfirmasi Pembayaran"
             description="Pastikan pelanggan, nominal, dan metode pembayaran sudah benar."
           />

           <ConfirmationDialogSummary>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{bill.customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatShortPeriod(bill.period.slice(0, 7))}
                </p>
              </div>
              <p className="font-medium text-primary">
                {formatCurrency(bill.total_amount)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p className="font-medium">{formatDate(paymentDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Metode</p>
                <p className="font-medium">
                  {paymentMethod === "cash" ? "Tunai" : "Transfer"}
                </p>
              </div>
              {paymentMethod === "cash" && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Uang diterima
                    </p>
                    <p className="font-medium">
                      {formatCurrency(cashReceivedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kembalian</p>
                    <p className="font-medium text-success">
                      {formatCurrency(Math.max(0, cashDifference))}
                    </p>
                  </div>
                </>
              )}
            </div>
           </ConfirmationDialogSummary>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmOpen(false)}
            >
              Periksa Lagi
            </Button>
            <Button
              type="submit"
              form="payment-form"
              disabled={pending || !cashIsSufficient}
            >
              {pending ? "Menyimpan..." : "Catat Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
