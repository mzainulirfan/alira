import type { QuickActionKey } from "@/lib/quick-actions";

export type Customer = {
  id: string;
  customer_number: string;
  name: string;
  phone: string | null;
  address: string | null;
  meter_number: string | null;
  join_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type MeterReading = {
  id: string;
  customer_id: string;
  period: string;
  previous_reading: number;
  current_reading: number;
  usage: number;
  photo_path: string | null;
  photo_url: string | null;
  recorded_by: string | null;
  recorded_at: string | null;
  created_at: string;
};

export type Bill = {
  id: string;
  customer_id: string;
  meter_reading_id: string | null;
  period: string;
  usage: number;
  price_per_m3: number | null;
  water_amount: number;
  monthly_fee: number;
  total_amount: number;
  due_date: string | null;
  status: "unpaid" | "paid" | "overdue" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  bill_id: string;
  customer_id: string;
  amount: number;
  payment_method: "cash" | "transfer";
  payment_date: string;
  received_by: string | null;
  notes: string | null;
  created_at: string;
};

export type ExpenseCategory =
  | "maintenance"
  | "pipe_repair"
  | "equipment"
  | "electricity_pump"
  | "technician"
  | "operations"
  | "other";

export type Expense = {
  id: string;
  expense_date: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  payee: string | null;
  payment_method: "cash" | "transfer";
  receipt_path: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffRole = "admin" | "treasurer" | "meter_reader";
export type StaffStatus = "active" | "inactive";

export type StaffProfile = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  session_epoch: string;
  must_change_passcode: boolean;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  is_locked?: boolean;
};

export type AppSettings = {
  id: string;
  pam_name: string;
  address: string | null;
  phone: string | null;
  billing_due_day: number;
  quick_actions?: QuickActionKey[] | null;
  created_at: string;
  updated_at: string;
};

export type Tariff = {
  id: string;
  name: string;
  price_per_m3: number;
  monthly_fee: number;
  effective_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type CustomerInput = {
  name: string;
  phone?: string | null;
  address?: string | null;
  meter_number?: string | null;
  join_date?: string | null;
  status?: "active" | "inactive";
  passcode?: string | null;
};
