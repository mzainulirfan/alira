"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  UserGroupIcon,
  CallIcon,
  MapPinIcon,
  GaugeIcon,
  Calendar01Icon,
  BanknoteIcon,
  Tap01Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerQrDialog } from "@/components/customers/customer-qr-dialog";
import { ReadingForm } from "@/components/meter-readings/reading-form";
import {
  resetCustomerPasscodeAction,
  setCustomerStatusAction,
  type CustomerFormState,
} from "@/app/actions/customers";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
} from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCurrency,
  formatDate,
  formatMeter,
  formatShortPeriod,
} from "@/lib/format";
import type { Bill, Customer, MeterReading, Tariff } from "@/lib/types";

const BILL_STATUS_LABEL: Record<Bill["status"], string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
};

const BILL_STATUS_VARIANT: Record<
  Bill["status"],
  "success" | "warning" | "destructive" | "secondary"
> = {
  unpaid: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "secondary",
};

export function CustomerDetailClient({
  customer,
  readings,
  bills,
  tariff,
  period,
  canEdit,
  canChangeStatus,
  canRecordMeter,
  canRecordPayment,
  canManageQr,
  canResetPasscode,
}: {
  customer: Customer;
  readings: MeterReading[];
  bills: Bill[];
  tariff: Tariff | null;
  period: string;
  canEdit: boolean;
  canChangeStatus: boolean;
  canRecordMeter: boolean;
  canRecordPayment: boolean;
  canManageQr: boolean;
  canResetPasscode: boolean;
}) {
  const lastReading = readings[0] ?? null;
  const lastBill = bills[0] ?? null;
  const unpaidBill =
    bills.find((b) => b.status === "unpaid" || b.status === "overdue") ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/customers" />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="text-xl font-medium">Detail Pelanggan</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                <HugeiconsIcon icon={UserGroupIcon} size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-medium">{customer.name}</h2>
                <p className="text-sm text-muted-foreground">{customer.customer_number}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={customer.status === "active" ? "success" : "secondary"}>
                {customer.status === "active" ? "Aktif" : "Nonaktif"}
              </Badge>
              <div className="flex items-center gap-2">
                {canManageQr && <CustomerQrDialog customer={customer} />}
                {canEdit && <CustomerForm mode="edit" customer={customer} />}
                {canResetPasscode && <ResetPasscode customer={customer} />}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {customer.phone && (
              <InfoRow icon={CallIcon} label="No. HP" value={customer.phone} />
            )}
            {customer.address && (
              <InfoRow icon={MapPinIcon} label="Alamat" value={customer.address} />
            )}
            {customer.meter_number && (
              <InfoRow icon={GaugeIcon} label="No. Meter" value={customer.meter_number} />
            )}
            {customer.join_date && (
              <InfoRow icon={Calendar01Icon} label="Mulai" value={formatDate(customer.join_date)} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <QuickActions
              customer={customer}
              period={period}
              tariff={tariff}
              lastReading={lastReading}
              unpaidBill={unpaidBill}
              canRecordMeter={canRecordMeter}
              canRecordPayment={canRecordPayment}
            />
            {canChangeStatus && (customer.status === "active" ? (
              <StatusToggle customerId={customer.id} status="inactive" label="Nonaktifkan" />
            ) : (
              <StatusToggle customerId={customer.id} status="active" label="Aktifkan" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meter Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {lastReading ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium">{formatMeter(lastReading.current_reading)}</p>
                <p className="text-sm text-muted-foreground">
                  Pemakaian {formatMeter(lastReading.usage)} ·{" "}
                  {formatShortPeriod(lastReading.period.slice(0, 7))}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada pencatatan meter.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tagihan Terakhir</CardTitle>
          <HugeiconsIcon icon={BanknoteIcon} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {lastBill ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-medium">{formatCurrency(lastBill.total_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatShortPeriod(lastBill.period.slice(0, 7))}
                  </p>
                </div>
                <Badge variant={BILL_STATUS_VARIANT[lastBill.status]}>
                  {BILL_STATUS_LABEL[lastBill.status]}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/bills?customer=${customer.id}`} />}
              >
                Lihat Semua Tagihan
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada tagihan.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <ul className="flex flex-col divide-y">
              {bills.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{formatShortPeriod(b.period.slice(0, 7))}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMeter(b.usage)} · {formatCurrency(b.total_amount)}
                    </p>
                  </div>
                  <Badge variant={BILL_STATUS_VARIANT[b.status]}>
                    {BILL_STATUS_LABEL[b.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada riwayat tagihan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function QuickActions({
  customer,
  period,
  tariff,
  lastReading,
  unpaidBill,
  canRecordMeter,
  canRecordPayment,
}: {
  customer: Customer;
  period: string;
  tariff: Tariff | null;
  lastReading: MeterReading | null;
  unpaidBill: Bill | null;
  canRecordMeter: boolean;
  canRecordPayment: boolean;
}) {
  if (customer.status !== "active" || (!canRecordMeter && !canRecordPayment)) {
    return null;
  }

  const previousReading = lastReading?.current_reading ?? 0;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {canRecordMeter && <ReadingForm
        customer={customer}
        period={period}
        previousReading={previousReading}
        tariff={tariff}
        trigger={
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Tap01Icon} />
            Catat Meter
          </Button>
        }
      />}
      {canRecordPayment && (unpaidBill ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/payments/new?bill=${unpaidBill.id}`} />}
        >
          <HugeiconsIcon icon={BanknoteIcon} />
          Catat Pembayaran
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <HugeiconsIcon icon={BanknoteIcon} />
          Tidak Ada Tagihan
        </Button>
      ))}
    </div>
  );
}

function StatusToggle({
  customerId,
  status,
  label,
}: {
  customerId: string;
  status: "active" | "inactive";
  label: string;
}) {
  return (
    <form
      action={async (formData) => {
        await setCustomerStatusAction(formData);
        toast.success(
          status === "active" ? "Pelanggan diaktifkan." : "Pelanggan dinonaktifkan."
        );
      }}
    >
      <input type="hidden" name="id" value={customerId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" size="sm" className="w-full">
        {label}
      </Button>
    </form>
  );
}

const noState: CustomerFormState = {};

function ResetPasscode({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    resetCustomerPasscodeAction,
    noState
  );
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) toast.success("Passcode sementara dibuat.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <HugeiconsIcon icon={Key01Icon} />
        Reset Passcode
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <ConfirmationDialogHeader
          icon={Key01Icon}
          tone="warning"
          title="Reset Passcode?"
          description={`${customer.name} harus mengganti passcode sementara saat login berikutnya. Sesi pelanggan saat ini akan berakhir.`}
        />
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={customer.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reset-passcode-${customer.id}`}>Passcode Sementara</Label>
            <Input
              id={`reset-passcode-${customer.id}`}
              name="passcode"
              type="password"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              className="h-10"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reset-confirm-${customer.id}`}>Konfirmasi Passcode</Label>
            <Input
              id={`reset-confirm-${customer.id}`}
              name="confirm_passcode"
              type="password"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              className="h-10"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Reset Passcode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
