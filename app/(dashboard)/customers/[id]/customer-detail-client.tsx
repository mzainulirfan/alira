"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CallIcon,
  MapPinIcon,
  GaugeIcon,
  Calendar01Icon,
  BanknoteIcon,
  Tap01Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const BILL_STATUS_LABEL: Record<Bill["status"], string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
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
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/customers" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Detail Pelanggan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {customer.customer_number} · {customer.name}
          </p>
        </div>
      </div>

      <CustomerHero
        name={customer.name}
        customerNumber={customer.customer_number}
        status={customer.status}
        hasUnpaidBill={!!unpaidBill}
      />

      <section className="flex flex-col">
        <SectionHeading title="Informasi" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {customer.phone && <InfoRow icon={CallIcon} label="No. HP" value={customer.phone} />}
            {customer.address && <InfoRow icon={MapPinIcon} label="Alamat" value={customer.address} />}
            {customer.meter_number && <InfoRow icon={GaugeIcon} label="No. Meter" value={customer.meter_number} />}
            {customer.join_date && <InfoRow icon={Calendar01Icon} label="Mulai" value={formatDate(customer.join_date)} />}
          </div>
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Meter Terakhir" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          {lastReading ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
                  <HugeiconsIcon icon={GaugeIcon} size={20} />
                </div>
                <div>
                  <p className="font-mono text-[22px] font-semibold text-petrol">{formatMeter(lastReading.current_reading)}</p>
                  <p className="font-mono text-[10px] text-muted-2">
                    Pemakaian {formatMeter(lastReading.usage)} · {formatShortPeriod(lastReading.period)}
                  </p>
                </div>
              </div>
              <span className="flex size-6 items-center justify-center rounded-md bg-paper text-muted-2">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-center py-6">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-muted mx-auto text-muted-2">
                <HugeiconsIcon icon={GaugeIcon} size={20} />
              </div>
              <p className="text-[13px] text-muted-2">Belum ada pencatatan meter.</p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Tagihan Terakhir" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          {lastBill ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex size-10 items-center justify-center rounded-[10px]",
                  lastBill.status === "overdue" ? "bg-coral-light text-coral" : "bg-aqua-light text-aqua"
                )}>
                  <HugeiconsIcon icon={BanknoteIcon} size={20} />
                </div>
                <div>
                  <p className="font-mono text-[22px] font-semibold text-petrol">{formatCurrency(lastBill.total_amount)}</p>
                  <p className="font-mono text-[10px] text-muted-2">{formatShortPeriod(lastBill.period)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                    lastBill.status === "overdue"
                      ? "bg-coral-light text-coral"
                      : lastBill.status === "paid"
                        ? "bg-green-light text-green"
                        : lastBill.status === "unpaid"
                          ? "bg-brass-light text-brass"
                          : "bg-muted text-muted-2"
                  )}
                >
                  {lastBill.status === "overdue" ? "TERLAMBAT" : BILL_STATUS_LABEL[lastBill.status].toUpperCase()}
                </span>
                <span className="flex size-6 items-center justify-center rounded-md bg-paper text-muted-2">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-center py-6">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-muted mx-auto text-muted-2">
                <HugeiconsIcon icon={BanknoteIcon} size={20} />
              </div>
              <p className="text-[13px] text-muted-2">Belum ada tagihan.</p>
            </div>
          )}
        </div>
      </section>

      {canChangeStatus && (
        <section className="flex flex-col">
          <SectionHeading title="Status Pelanggan" />
          <StatusToggle customerId={customer.id} status={customer.status === "active" ? "inactive" : "active"} label={customer.status === "active" ? "Nonaktifkan Pelanggan" : "Aktifkan Pelanggan"} />
        </section>
      )}

      <section className="flex flex-col">
        <SectionHeading title="Riwayat Tagihan" linkLabel="Lihat Semua" linkHref={`/bills?customer=${customer.id}`} />
        <div className="rounded-[14px] border border-line bg-card">
          {bills.length > 0 ? (
            <ol className="relative flex flex-col divide-y divide-dashed divide-line">
              {bills.slice(0, 6).map((b, idx) => (
                <li
                  key={b.id}
                  className={cn(
                    "flex items-center justify-between py-3 px-4",
                    idx === bills.length - 1 && "divide-y-0"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      b.status === "overdue" ? "bg-coral-light text-coral" :
                      b.status === "paid" ? "bg-green-light text-green" :
                      b.status === "unpaid" ? "bg-brass-light text-brass" :
                      "bg-muted text-muted-2"
                    )}>
                      <HugeiconsIcon icon={BanknoteIcon} size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[13px] font-semibold text-petrol">{formatShortPeriod(b.period)}</p>
                      <p className="truncate font-mono text-[10px] text-muted-2">{formatMeter(b.usage)} m³ · {formatCurrency(b.total_amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                        b.status === "overdue" ? "bg-coral-light text-coral" :
                        b.status === "paid" ? "bg-green-light text-green" :
                        b.status === "unpaid" ? "bg-brass-light text-brass" :
                        "bg-muted text-muted-2"
                      )}
                    >
                      {b.status === "overdue" ? "TERLAMBAT" : BILL_STATUS_LABEL[b.status].toUpperCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-muted mx-auto text-muted-2">
                <HugeiconsIcon icon={BanknoteIcon} size={20} />
              </div>
              <p className="text-[13px] text-muted-2">Belum ada riwayat tagihan.</p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Aksi Cepat" />
        <QuickActions
          customer={customer}
          period={period}
          tariff={tariff}
          lastReading={lastReading}
          unpaidBill={unpaidBill}
          canRecordMeter={canRecordMeter}
          canRecordPayment={canRecordPayment}
        />
      </section>

      {canEdit && (
        <section className="flex flex-col">
          <SectionHeading title="Kelola Akun" />
          <div className="grid gap-2 sm:grid-cols-2">
            {canManageQr && <CustomerQrDialog customer={customer} />}
            {canEdit && <CustomerForm mode="edit" customer={customer} />}
            {canResetPasscode && <ResetPasscode customer={customer} />}
          </div>
        </section>
      )}
    </div>
  );
}

function CustomerHero({
  name,
  customerNumber,
  status,
  hasUnpaidBill,
}: {
  name: string;
  customerNumber: string;
  status: "active" | "inactive";
  hasUnpaidBill: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
        }}
      />
      <div className="absolute -top-[38px] -right-[38px] size-[170px] rounded-full border-[1.5px] border-aqua/35">
        <div className="absolute inset-[22px] rounded-full border border-dashed border-brass/40" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-aqua">
          <span className="size-1.5 rounded-full bg-aqua" />
          Panel Pelanggan
        </span>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{name}</h2>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
              status === "active" ? "bg-green-light text-green" : "bg-coral-light text-coral"
            )}
          >
            {status === "active" ? "AKTIF" : "NONAKTIF"}
          </span>
        </div>
        <p className="max-w-[78%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
          {customerNumber.toUpperCase()} · {hasUnpaidBill ? "ADA TAGIHAN AKTIF" : "TAGIHAN BERES"}
        </p>
      </div>
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
    <div className="rounded-[10px] bg-paper/80 px-3 py-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        <HugeiconsIcon icon={icon} className="size-4 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 font-display text-[13px] font-semibold text-petrol">{value}</p>
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
  if (customer.status !== "active" || (!canRecordMeter && !canRecordPayment)) return null;

  const previousReading = lastReading?.current_reading ?? 0;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {canRecordMeter && (
        <ReadingForm
          customer={customer}
          period={period}
          previousReading={previousReading}
          tariff={tariff}
          trigger={
            <Button variant="outline" className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full">
              <HugeiconsIcon icon={Tap01Icon} className="mr-2" />
              Catat Meter
            </Button>
          }
        />
      )}
      {canRecordPayment && (unpaidBill ? (
        <Button
          variant="outline"
          className="rounded-[10px] border-line font-display text-[13px] font-semibold text-brass hover:bg-brass-light hover:border-brass w-full"
          render={<Link href={`/payments/new?bill=${unpaidBill.id}`} />}
        >
          <HugeiconsIcon icon={BanknoteIcon} className="mr-2" />
          Catat Pembayaran
        </Button>
      ) : (
        <Button variant="outline" disabled className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted w-full">
          <HugeiconsIcon icon={BanknoteIcon} className="mr-2" />
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
      <Button type="submit" variant="outline" className="w-full rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40">
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
      <DialogTrigger render={<Button variant="outline" className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40" />}>
        <HugeiconsIcon icon={Key01Icon} className="mr-2" />
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
              className="h-10 rounded-[10px] border-line"
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
              className="h-10 rounded-[10px] border-line"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-[10px] border-line">
              Batal
            </Button>
            <Button type="submit" disabled={pending} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full">
              {pending ? "Menyimpan..." : "Reset Passcode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}