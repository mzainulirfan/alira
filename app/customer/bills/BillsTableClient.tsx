"use client";

import BillsTable from "./BillsTable";

interface BillsTableClientProps {
  initialBills: import("@/lib/types").Bill[];
  total: number;
  initialPage: number;
  initialStatusFilter: "all" | "unpaid" | "pending" | "paid" | "overdue";
}

export default function BillsTableClient({
  initialBills,
  total,
  initialPage,
  initialStatusFilter,
}: BillsTableClientProps) {
  return (
    <BillsTable
      initialBills={initialBills}
      total={total}
      initialPage={initialPage}
      initialStatusFilter={initialStatusFilter}
    />
  );
}