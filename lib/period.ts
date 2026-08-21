const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;

export function isValidPeriod(value: unknown): value is string {
  if (typeof value !== "string" || !PERIOD_PATTERN.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1000 && year <= 9998;
}

export function periodToDate(period: string): string {
  if (!isValidPeriod(period)) throw new Error("Periode tidak valid.");
  return `${period}-01`;
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 1000 || year > 9999) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function dateToPeriod(date: string): string {
  // Normalize via UTC to avoid TZ shift (e.g. 2026-08-01T00:00:00+07:00 -> 2026-08)
  if (date.includes("T")) {
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) {
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }
  }
  return date.slice(0, 7);
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function nextPeriodDate(period: string): string {
  if (!isValidPeriod(period)) throw new Error("Periode tidak valid.");
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
}
