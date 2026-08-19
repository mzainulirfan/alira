"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  CheckmarkCircle01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import {
  resolveMeterScanAction,
  type ResolveMeterScanResult,
} from "@/app/actions/meter-readings";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMeter, formatShortPeriod } from "@/lib/format";

type ScannerControls = { stop: () => void };

export function QrScanner({
  period,
  canEdit,
}: {
  period: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const scanLockedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ResolveMeterScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (!open || result || !videoRef.current) return;

    let disposed = false;
    const video = videoRef.current;

    async function startScanner() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: { ideal: "environment" } },
          },
          video,
          (scanResult) => {
            if (!scanResult || scanLockedRef.current) return;
            scanLockedRef.current = true;
            controlsRef.current?.stop();
            void resolveCode(scanResult.getText());
          }
        );

        if (disposed) controls.stop();
        else controlsRef.current = controls;
      } catch {
        if (!disposed) {
          setCameraError(
            "Kamera tidak dapat dibuka. Periksa izin browser atau gunakan input manual."
          );
        }
      }
    }

    void startScanner();
    return () => {
      disposed = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      video.srcObject = null;
    };
    // resolveCode intentionally uses the current period from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, result, restartKey]);

  async function resolveCode(rawCode: string) {
    setResolving(true);
    const nextResult = await resolveMeterScanAction(rawCode, period);
    setResult(nextResult);
    setResolving(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      scanLockedRef.current = false;
      setResult(null);
      setManualCode("");
      setCameraError(null);
    }
  }

  function scanAgain() {
    scanLockedRef.current = false;
    setResult(null);
    setCameraError(null);
    setRestartKey((value) => value + 1);
  }

  function openReading() {
    if (!result?.customer) return;
    const params = new URLSearchParams();
    params.set("period", period);
    params.set("status", "all");
    params.set("q", result.customer.customer_number);
    params.set("open", result.customer.id);
    setOpen(false);
    router.push(`/meter-readings?${params.toString()}`);
  }

  const customer = result?.customer;
  const isInactive = customer?.status === "inactive";
  const isLocked = result?.billStatus === "paid";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <HugeiconsIcon icon={Camera01Icon} />
        Scan Kode
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Pelanggan</DialogTitle>
          <DialogDescription>
            Arahkan kamera ke QR Alira yang terpasang pada meter pelanggan.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-dark">
              <video
                ref={videoRef}
                muted
                playsInline
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-44 rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
              </div>
              {resolving && (
                <div className="absolute inset-x-3 bottom-3 rounded-lg bg-background/90 px-3 py-2 text-center text-xs font-medium">
                  Memeriksa pelanggan...
                </div>
              )}
            </div>

            {cameraError && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                {cameraError}
              </p>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!manualCode.trim() || resolving) return;
                scanLockedRef.current = true;
                controlsRef.current?.stop();
                void resolveCode(manualCode);
              }}
              className="flex flex-col gap-2 border-t pt-4"
            >
              <Label htmlFor="manual-customer-code">Atau masukkan nomor pelanggan</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-customer-code"
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                  placeholder="PAM-000123"
                  autoComplete="off"
                />
                <Button type="submit" variant="outline" disabled={resolving}>
                  <HugeiconsIcon icon={Search01Icon} />
                  Cari
                </Button>
              </div>
            </form>
          </>
        )}

        {result?.error && (
          <div className="flex flex-col gap-3 text-center">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-5">
              <p className="font-medium">Kode tidak dapat digunakan</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.error}</p>
            </div>
            <Button variant="outline" onClick={scanAgain}>
              Scan Ulang
            </Button>
          </div>
        )}

        {customer && (
          <div className="flex flex-col gap-4" aria-live="polite">
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-success">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                    <span className="text-xs font-medium">Pelanggan ditemukan</span>
                  </div>
                  <p className="mt-2 truncate text-lg font-semibold">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.customer_number}
                  </p>
                </div>
                <Badge variant={isInactive ? "secondary" : "success"}>
                  {isInactive ? "Nonaktif" : "Aktif"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 border-t pt-3 text-sm sm:grid-cols-2">
                <ResultValue label="Periode" value={formatShortPeriod(period)} />
                <ResultValue
                  label="Nomor meter"
                  value={customer.meter_number ?? "Belum diatur"}
                />
                {customer.address && (
                  <div className="sm:col-span-2">
                    <ResultValue label="Alamat" value={customer.address} />
                  </div>
                )}
                {result.reading && (
                  <ResultValue
                    label="Meter tercatat"
                    value={formatMeter(result.reading.current_reading)}
                  />
                )}
              </div>
            </div>

            {isInactive && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                Pelanggan nonaktif tidak dapat melakukan pencatatan meter.
              </p>
            )}
            {isLocked && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Pencatatan terkunci karena tagihan periode ini sudah dibayar.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={scanAgain}>
                Scan Ulang
              </Button>
              {!canEdit || isInactive || isLocked ? (
                <Button render={<Link href={`/customers/${customer.id}`} />}>
                  Lihat Pelanggan
                </Button>
              ) : (
                <Button onClick={openReading}>
                  {result.reading ? "Ubah Pencatatan" : "Catat Meter"}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
