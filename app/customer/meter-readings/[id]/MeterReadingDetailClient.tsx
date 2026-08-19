"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GaugeIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { MeterReading } from "@/lib/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function MeterReadingDetailClient({
  reading,
}: {
  reading: MeterReading;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Detail pencatatan meter
          </p>
          <h1 className="text-xl font-medium">Periode {formatShortPeriod(reading.period)}</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan pencatatan meter pelanggan dalam tampilan yang lebih sederhana.
          </p>
        </div>
        <Badge variant="secondary">Tercatat</Badge>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon icon={GaugeIcon} size={18} />
            Ringkasan meter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Angka meter sekarang
            </p>
            <p className="mt-2 text-3xl font-medium tracking-tight text-foreground">
              {formatMeter(reading.current_reading)}
            </p>
          </div>

          <div className="space-y-1">
            <Row label="Periode" value={formatShortPeriod(reading.period)} />
            <Row label="Sebelumnya" value={formatMeter(reading.previous_reading)} />
            <Row label="Pemakaian" value={formatMeter(reading.usage)} />
            <Row
              label="Dicatat pada"
              value={reading.recorded_at ? formatDate(reading.recorded_at) : "-"}
            />
            <Row
              label="Petugas"
              value={reading.recorded_by || "-"}
            />
          </div>
        </CardContent>
      </Card>

      {reading.photo_url && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={Image01Icon} size={18} />
              Foto meter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href={reading.photo_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reading.photo_url}
                alt={`Foto meter ${formatShortPeriod(reading.period)}`}
                className="h-auto w-full object-cover"
              />
            </a>
          </CardContent>
        </Card>
      )}

      <div className="pt-1">
        <Button variant="outline" className="w-full sm:w-fit" render={<Link href="/customer/meter-readings" />}>
          Kembali ke riwayat meter
        </Button>
      </div>
    </div>
  );
}
