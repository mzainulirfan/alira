"use client";

import { MeterReadingsTable } from "./MeterReadingsTable";

interface MeterReadingsTableClientProps {
  initialReadings: import("@/lib/types").MeterReading[];
  total: number;
  initialPage: number;
  initialPeriodFilter?: string;
  initialRangeFilter?: "current-month" | "last-3-months" | "all";
}

export default function MeterReadingsTableClient({
  initialReadings,
  total,
  initialPage,
  initialPeriodFilter,
  initialRangeFilter,
}: MeterReadingsTableClientProps) {
  return (
    <MeterReadingsTable
      initialReadings={initialReadings}
      total={total}
      initialPage={initialPage}
      initialPeriodFilter={initialPeriodFilter}
      initialRangeFilter={initialRangeFilter}
    />
  );
}
