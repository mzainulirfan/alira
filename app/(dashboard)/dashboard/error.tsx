"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function DashboardErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardError onReset={reset} />;
}