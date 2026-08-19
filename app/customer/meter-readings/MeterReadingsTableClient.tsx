"use client";

import { MeterReadingsTable } from "./MeterReadingsTable";

interface MeterReadingsTableClientProps {
  initialReadings: import("@/lib/types").MeterReading[];
  total: number;
  initialPage: number;
  initialPeriodFilter?: string;
}

export default function MeterReadingsTableClient({
  initialReadings,
  total,
  initialPage,
  initialPeriodFilter,
}: MeterReadingsTableClientProps) {
  return (
    <MeterReadingsTable
      initialReadings={initialReadings}
      total={total}
      initialPage={initialPage}
      initialPeriodFilter={initialPeriodFilter}
    />
  );
}