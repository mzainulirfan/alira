import type { StaffRole } from "@/lib/types";

export const STAFF_ROLES: Array<{ key: StaffRole; label: string }> = [
  { key: "admin", label: "Admin" },
  { key: "treasurer", label: "Bendahara" },
  { key: "meter_reader", label: "Petugas Meter" },
];

export const STAFF_ROLE_LABEL = Object.fromEntries(
  STAFF_ROLES.map((role) => [role.key, role.label])
) as Record<StaffRole, string>;

const staffRoleKeys = new Set<string>(STAFF_ROLES.map((role) => role.key));

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && staffRoleKeys.has(value);
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(value);
}

export const ADMIN_ROLES: StaffRole[] = ["admin"];
export const FINANCE_ROLES: StaffRole[] = ["admin", "treasurer"];
export const METER_ROLES: StaffRole[] = ["admin", "meter_reader"];

export function canManageCustomers(role: StaffRole): boolean {
  return role === "admin" || role === "meter_reader";
}

export function canManageFinance(role: StaffRole): boolean {
  return role === "admin" || role === "treasurer";
}
