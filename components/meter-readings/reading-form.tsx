"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import {
  cancelReadingAction,
  type CancelReadingState,
  saveReadingAction,
  type SaveReadingState,
} from "@/app/actions/meter-readings";
import { formatCurrency, formatMeter } from "@/lib/format";
import type { Customer, MeterReading, Tariff } from "@/lib/types";

const initialState: SaveReadingState = {};
const initialCancelState: CancelReadingState = {};

export function ReadingForm({
  customer,
  period,
  reading,
  previousReading,
  tariff,
  trigger,
  nextCustomerId,
}: {
  customer: Customer;
  period: string;
  reading?: MeterReading | null;
  previousReading: number;
  tariff: Tariff | null;
  trigger?: ReactElement;
  nextCustomerId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [current, setCurrent] = useState(
    reading ? String(reading.current_reading) : ""
  );
  const [original, setOriginal] = useState(
    reading ? String(reading.current_reading) : ""
  );
  const [photoName, setPhotoName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const submitterRef = useRef<HTMLButtonElement | null>(null);
  const confirmedSubmitRef = useRef(false);
  const [state, formAction, pending] = useActionState(
    saveReadingAction,
    initialState
  );
  const [lastState, setLastState] = useState(state);
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelReadingAction,
    initialCancelState
  );
  const [lastCancelState, setLastCancelState] = useState(cancelState);

  const currentNum = Number(current);
  const usage =
    Number.isFinite(currentNum) && currentNum >= previousReading
      ? currentNum - previousReading
      : null;

  const estimatedWater =
    usage !== null && tariff ? usage * tariff.price_per_m3 : null;
  const estimatedTotal =
    estimatedWater !== null && tariff
      ? Math.round(estimatedWater + tariff.monthly_fee)
      : null;

  const dirty = current !== original || photoName !== null;

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) {
      setOpen(false);
    }
  }
  if (cancelState !== lastCancelState) {
    setLastCancelState(cancelState);
    if (cancelState?.success) {
      setCancelOpen(false);
      setOpen(false);
    }
  }

  useEffect(() => {
    if (state?.success) {
      toast.success(
        state.billUpdated
          ? `Pencatatan dan tagihan diperbarui. Pemakaian ${formatMeter(state.usage ?? 0)}.`
          : `Pencatatan tersimpan. Pemakaian ${formatMeter(state.usage ?? 0)}.`
      );
      router.refresh();
      if (state.next && nextCustomerId) {
        window.dispatchEvent(
          new CustomEvent("alira:open-reading", { detail: nextCustomerId })
        );
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, nextCustomerId]);

  useEffect(() => {
    if (cancelState?.success) {
      toast.success(
        cancelState.billDeleted
          ? "Pencatatan dan tagihan belum dibayar dibatalkan."
          : "Pencatatan dibatalkan."
      );
      router.refresh();
    } else if (cancelState?.error) {
      toast.error(cancelState.error);
    }
  }, [cancelState, router]);

  useEffect(() => {
    function handleOpenReading(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail === customer.id) {
        const resetValue = reading ? String(reading.current_reading) : "";
        setCurrent(resetValue);
        setOriginal(resetValue);
        setPhotoName(null);
        setRevisionReason("");
        if (photoRef.current) photoRef.current.value = "";
        setConfirmOpen(false);
        setOpen(true);
      }
    }
    window.addEventListener("alira:open-reading", handleOpenReading);
    return () =>
      window.removeEventListener("alira:open-reading", handleOpenReading);
  }, [customer.id, reading]);

  function closeForm() {
    if (dirty) {
      setConfirmOpen(true);
    } else {
      setOpen(false);
    }
  }

  function discardChanges() {
    setCurrent(original);
    setPhotoName(null);
    setRevisionReason("");
    if (photoRef.current) photoRef.current.value = "";
    setConfirmOpen(false);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      const resetValue = reading ? String(reading.current_reading) : "";
      setCurrent(resetValue);
      setOriginal(resetValue);
      setPhotoName(null);
      setRevisionReason("");
      if (photoRef.current) photoRef.current.value = "";
      setConfirmOpen(false);
      setOpen(true);
    } else {
      closeForm();
    }
  }

  async function compressImage(file: File): Promise<File> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Gagal memuat gambar"));
      };
      img.src = url;
    });
    const MAX_SIZE = 1280;
    const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height));
    if (scale >= 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    try {
      const compressed = await compressImage(file);
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      if (photoRef.current) photoRef.current.files = transfer.files;
    } catch {
      // gambar gagal dikompres (mis. HEIC) — kirim file asli
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmedSubmitRef.current) {
      confirmedSubmitRef.current = false;
      return;
    }
    event.preventDefault();
    submitterRef.current = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    setSaveConfirmOpen(true);
  }

  function confirmSave() {
    confirmedSubmitRef.current = true;
    setSaveConfirmOpen(false);
    formRef.current?.requestSubmit(submitterRef.current ?? undefined);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button
              size={reading ? "sm" : "default"}
              variant={reading ? "ghost" : "default"}
            />
          )
        }
      >
        {reading ? "Ubah" : "Catat Meter"}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Meter</DialogTitle>
          <DialogDescription>
            {customer.name} · {customer.customer_number} ·{" "}
            {customer.meter_number ? `Meter ${customer.meter_number}` : "Tanpa nomor meter"}
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="customer_id" value={customer.id} />
          {reading && <input type="hidden" name="reading_id" value={reading.id} />}
          <input type="hidden" name="period" value={period} />
          <input type="hidden" name="previous_reading" value={previousReading} />

          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Meter sebelumnya: </span>
            <span className="font-medium">{formatMeter(previousReading)}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_reading">Meter sekarang</Label>
            <Input
              id="current_reading"
              name="current_reading"
              type="number"
              inputMode="numeric"
              min={previousReading}
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="cth. 1265"
              autoFocus
              required
            />
            {currentNum < previousReading && (
              <p className="text-xs text-destructive">
                Meter sekarang tidak boleh lebih kecil dari meter sebelumnya.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Pemakaian</span>
            <span className="font-semibold">
              {usage !== null ? formatMeter(usage) : "—"}
            </span>
          </div>

          {estimatedTotal !== null ? (
            <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tarif air</span>
                <span>
                  {formatCurrency(Math.round(estimatedWater ?? 0))}
                  <span className="text-muted-foreground">
                    {" "}
                    × {usage} m³
                  </span>
                </span>
              </div>
              {tariff && tariff.monthly_fee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Abonemen</span>
                  <span>{formatCurrency(tariff.monthly_fee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-primary/15 pt-2 text-sm">
                <span className="font-medium">Perkiraan tagihan</span>
                <span className="text-base font-semibold text-primary">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Menggunakan tarif aktif saat ini. Jatuh tempo & tagihan final
                dibuat saat generate tagihan.
              </p>
            </div>
          ) : tariff === null ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              Belum ada tarif aktif. Atur tarif di Pengaturan agar perkiraan
              tagihan dapat dihitung.
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Foto meter (opsional)</Label>
            <input
              ref={photoRef}
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => photoRef.current?.click()}
            >
              <HugeiconsIcon icon={Camera01Icon} />
              {photoName ? photoName : "Ambil Foto"}
            </Button>
            {reading?.photo_url && (
              <p className="text-xs text-muted-foreground">
                Foto lama akan diganti jika mengunggah foto baru.
              </p>
            )}
          </div>

          {reading && (
            <div className="flex flex-col gap-1.5 border-t pt-4">
              <Label htmlFor={`revision_reason_${reading.id}`}>
                Alasan Revisi
              </Label>
              <textarea
                id={`revision_reason_${reading.id}`}
                name="revision_reason"
                value={revisionReason}
                onChange={(event) => setRevisionReason(event.target.value)}
                rows={2}
                minLength={3}
                placeholder="Contoh: angka tercatat pada pelanggan yang salah"
                className="min-h-16 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Revisi akan dicatat bersama identitas petugas dan waktunya.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            {reading && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setCancelReason("");
                  setCancelOpen(true);
                }}
              >
                <HugeiconsIcon icon={Delete01Icon} />
                Batalkan Pencatatan
              </Button>
            )}
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            {reading ? (
              <Button
                type="submit"
                disabled={
                  pending ||
                  usage === null ||
                  !dirty ||
                  revisionReason.trim().length < 3
                }
              >
                {pending
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            ) : (
              <>
                <Button type="submit" variant="outline" disabled={pending || usage === null}>
                  Simpan
                </Button>
                <Button
                  type="submit"
                  name="next"
                  value="true"
                  disabled={pending || usage === null || !nextCustomerId}
                >
                  {pending ? "Menyimpan..." : "Simpan & Lanjut"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
           <ConfirmationDialogHeader
             icon={CheckmarkCircle01Icon}
             title={
               reading ? "Konfirmasi Revisi Meter" : "Konfirmasi Pencatatan Meter"
             }
             description="Pastikan pelanggan dan angka meter berikut sudah benar."
           />
           <ConfirmationDialogSummary>
            <div className="border-b pb-3">
              <p className="font-semibold">{customer.name}</p>
              <p className="text-xs text-muted-foreground">
                {customer.customer_number} ·{" "}
                {customer.meter_number
                  ? `Meter ${customer.meter_number}`
                  : "Tanpa nomor meter"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Periode</p>
                <p className="font-medium">{period}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meter sekarang</p>
                <p className="font-medium">{formatMeter(currentNum)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pemakaian</p>
                <p className="font-medium">{formatMeter(usage ?? 0)}</p>
              </div>
              {reading && (
                <div>
                  <p className="text-xs text-muted-foreground">Meter sebelumnya</p>
                  <p className="font-medium">
                    {formatMeter(reading.current_reading)}
                  </p>
                </div>
              )}
            </div>
            {reading && (
              <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                Alasan: {revisionReason.trim()}
              </p>
            )}
           </ConfirmationDialogSummary>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveConfirmOpen(false)}>
              Periksa Lagi
            </Button>
            <Button onClick={confirmSave} disabled={pending || usage === null}>
              {pending ? "Menyimpan..." : reading ? "Simpan Revisi" : "Simpan Pencatatan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reading && (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent className="sm:max-w-sm">
             <ConfirmationDialogHeader
               icon={Delete01Icon}
               tone="destructive"
               title="Batalkan Pencatatan?"
               description={`${customer.name} akan kembali ke status Belum Dicatat. Tagihan yang belum dibayar juga akan dibatalkan.`}
             />
            <form action={cancelAction} className="flex flex-col gap-3">
              <input type="hidden" name="reading_id" value={reading.id} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`cancel_reason_${reading.id}`}>
                  Alasan Pembatalan
                </Label>
                <textarea
                  id={`cancel_reason_${reading.id}`}
                  name="reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows={3}
                  minLength={3}
                  placeholder="Contoh: meter pelanggan lain yang tercatat"
                  className="min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                />
              </div>
              {cancelState?.error && (
                <p className="text-xs text-destructive">{cancelState.error}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={cancelPending}
                  onClick={() => setCancelOpen(false)}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelPending || cancelReason.trim().length < 3}
                >
                  {cancelPending ? "Membatalkan..." : "Batalkan Pencatatan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
           <ConfirmationDialogHeader
             icon={Edit01Icon}
             tone="warning"
             title="Perubahan belum disimpan"
             description="Jika ditutup sekarang, perubahan pencatatan meter akan hilang."
           />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Lanjut Mengisi
            </Button>
            <Button variant="destructive" onClick={discardChanges}>
              Buang Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export function ReadingStatusBadge({ reading }: { reading?: MeterReading | null }) {
  return reading ? (
    <Badge variant="success">
      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
      Sudah Dicatat
    </Badge>
  ) : (
    <Badge variant="warning">Belum Dicatat</Badge>
  );
}
