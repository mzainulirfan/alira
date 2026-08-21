const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatCurrency(value: number): string {
  return rupiahFormatter.format(value).replace(/\s?Rp/g, "Rp");
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatMeter(value: number): string {
  return `${formatNumber(value)} m3`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + (date.length === 10 ? "T00:00:00Z" : "")) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatPeriod(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + (date.length === 10 ? "T00:00:00Z" : "")) : date;
  return d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortPeriod(value: string): string {
  // value format: "YYYY-MM"
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export function formatShortPeriodLabel(value: string): string {
  // value format: "YYYY-MM" -> "AGU 2026"
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value.toUpperCase();
  const date = new Date(year, month - 1, 1);
  return `${date
    .toLocaleDateString("id-ID", { month: "short" })
    .toUpperCase()} ${year}`;
}
