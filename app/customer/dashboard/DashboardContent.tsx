"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  GaugeIcon,
  UserIcon,
  Calendar01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMeter, formatShortPeriod } from "@/lib/format";
import Link from "next/link";
import type { Customer } from "@/lib/types";

interface DashboardContentProps {
  activeBill: {
    id: string;
    period: string;
    total_amount: number;
    status: "pending" | "paid" | "overdue" | "cancelled";
    due_date: string;
  } | null;
  latestReading: {
    id: string;
    period: string;
    current_reading: number;
    previous_reading: number;
    usage: number;
  } | null;
  lastLogin: string | null;
  profile: Customer;
}

export default function DashboardContent({
  activeBill,
  latestReading,
  lastLogin,
  profile,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang, {profile?.name}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HugeiconsIcon icon={InvoiceIcon} size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tagihan Belum Lunas</p>
                {activeBill ? (
                  <>
                    <p className="text-xl font-medium">{formatCurrency(activeBill.total_amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Periode {formatShortPeriod(activeBill.period)}
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-medium text-success">Tidak ada tagihan tertunggak</p>
                )}
              </div>
            </div>
            {activeBill && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={activeBill.status === "overdue" ? "destructive" : "secondary"}>
                  {activeBill.status === "overdue" ? "Terlambat" : "Belum Lunas"}
                </Badge>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar01Icon} size={12} />
                  Jatuh tempo {formatShortPeriod(activeBill.due_date)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-info/10 text-info">
                <HugeiconsIcon icon={GaugeIcon} size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pemakaian Terakhir</p>
                {latestReading ? (
                  <>
                    <p className="text-xl font-medium">{formatMeter(latestReading.current_reading)} m³</p>
                    <p className="text-xs text-muted-foreground">
                      Pemakaian {formatMeter(latestReading.usage)} m³
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-medium text-muted-foreground">Belum ada pencatatan</p>
                )}
              </div>
            </div>
            {latestReading && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar01Icon} size={12} />
                  Periode {formatShortPeriod(latestReading.period)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-warning/10 text-warning">
                <HugeiconsIcon icon={UserIcon} size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Pelanggan</p>
                <p className="text-xl font-medium capitalize">{profile?.status}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar01Icon} size={12} />
                Bergabung {profile?.join_date ? new Date(profile.join_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-success/10 text-success">
                <HugeiconsIcon icon={Clock01Icon} size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Login Terakhir</p>
                <p className="text-xl font-medium">
                  {lastLogin ? new Date(lastLogin).toLocaleString("id-ID") : "Belum pernah"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Link href="/customer/bills">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <HugeiconsIcon icon={InvoiceIcon} size={18} />
            Lihat Semua Tagihan
          </button>
        </Link>
        <Link href="/customer/meter-readings">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <HugeiconsIcon icon={GaugeIcon} size={18} />
            Riwayat Meter
          </button>
        </Link>
      </div>
    </div>
  );
}