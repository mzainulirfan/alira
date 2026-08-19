# Rencana Portal Pelanggan (Customer Portal) — Alira (Versi Sederhana)

## Prinsip: Minimal, Tanpa Payment Gateway

Pelanggan hanya butuh:
1. **Login dengan passcode** (mirip staff, tapi lebih simpel)
2. **Lihat tagihan aktif & riwayat**
3. **Lihat riwayat pemakaian meter**
4. **Update nomor WA (opsional)**

Tidak ada: payment gateway, QRIS, OTP WA, notifikasi otomatis, magic link.

---

## 1. Arsitektur Auth Pelanggan (Sederhana)

| Aspek | Staff | Pelanggan (Baru) |
|-------|-------|------------------|
| **Tabel** | `pam_profiles` (role staff) | `pam_customers` + kolom `passcode_hash` + `must_change_passcode` |
| **Login** | Username + 6-digit passcode | **Nomor Pelanggan + 6-digit passcode** |
| **Session** | JWT cookie `session` | JWT cookie `customer_session` (terpisah) |
| **Route Group** | `app/(dashboard)/...` | `app/(customer)/...` |
| **Middleware** | `verifySession()` | `verifyCustomerSession()` |

### Perubahan Database (Minimal)
```sql
-- Tambah kolom ke pam_customers (sudah ada)
ALTER TABLE pam_customers ADD COLUMN IF NOT EXISTS passcode_hash TEXT;
ALTER TABLE pam_customers ADD COLUMN IF NOT EXISTS must_change_passcode BOOLEAN DEFAULT true;
ALTER TABLE pam_customers ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;
ALTER TABLE pam_customers ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE pam_customers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Index untuk login cepat
CREATE INDEX IF NOT EXISTS idx_pam_customers_passcode_lookup 
  ON pam_customers (customer_number) WHERE passcode_hash IS NOT NULL;
```

> Tidak perlu tabel auth terpisah. `pam_customers` sudah ada, tinggal tambah kolom passcode.

---

## 2. Route Structure (Minimal)

```
app/
├── (auth)/
│   └── login/                      # Staff login (existing)
├── (customer)/                     # NEW: Customer portal
│   ├── layout.tsx                  # Shell minimal: header only (logo + logout)
│   ├── login/
│   │   └── page.tsx                # Nomor pelanggan + passcode 6 digit
│   ├── dashboard/
│   │   └── page.tsx                # Ringkasan: tagihan aktif (belum lunas), pemakaian terakhir
│   ├── bills/
│   │   ├── page.tsx                # Daftar tagihan: periode, jumlah, status, jatuh tempo
│   │   └── [id]/
│   │       └── page.tsx            # Detail tagihan (read-only, tanpa bayar)
│   ├── meter-readings/
│   │   └── page.tsx                # Riwayat: periode, angka meter, pemakaian (m³), foto
│   └── profile/
│       └── page.tsx                # Lihat info (nama, alamat, nomor meter), ganti passcode
```

---

## 3. Fitur MVP (Hanya 4 Halaman)

| Halaman | Fitur Utama |
|---------|-------------|
| **Login** | Nomor pelanggan (PAM-XXXXXX) + passcode 6 digit. `must_change_passcode` → redirect `/customer/profile?required=true` |
| **Dashboard** | • Tagihan belum lunas (periode, jumlah, jatuh tempo)<br>• Pemakaian meter terakhir (periode, m³)<br>• Status pelanggan (aktif/nonaktif) |
| **Bills List** | Tabel: Periode | Jumlah | Status (Lunas/Belum) | Jatuh Tempo |
| **Bill Detail** | Rincian: abonemen, pemakaian, harga/m³, total, jatuh tempo, status (read-only) |
| **Meter Readings** | Tabel: Periode | Angka Meter | Pemakaian (m³) | Foto (jika ada) |
| **Profile** | Info read-only (nama, alamat, nomor meter, tanggal gabung) + **Ganti Passcode** |

---

## 4. Flow Login Pelanggan

```
1. GET /customer/login
   → Form: Nomor Pelanggan (PAM-XXXXXX) + Passcode 6 digit
   → Submit POST /customer/login

2. POST /customer/login (Server Action)
   → Cari customer by customer_number
   → Verify passcode_hash (bcrypt)
   → Cek failed_attempts < 5, locked_until < now()
   → Jika salah: increment failed_attempts, lock 15 menit setelah 5x
   → Jika benar: reset failed_attempts, set last_login_at
   → Generate JWT (customer_id, session_epoch) → set cookie customer_session
   → Jika must_change_passcode → redirect /customer/profile?required=true
   → Else redirect /customer/dashboard

3. Middleware verifyCustomerSession()
   → Validasi cookie customer_session
   → Cek session_epoch match di DB
   → Redirect /customer/login jika invalid
```

---

## 4. Server Actions Baru (Minimal)

| Action | File | Deskripsi |
|--------|------|-----------|
| `loginCustomerAction` | `app/actions/customer-auth.ts` | Verify passcode, set cookie |
| `logoutCustomerAction` | `app/actions/customer-auth.ts` | Hapus cookie |
| `changePasscodeAction` | `app/actions/customer-auth.ts` | Verify old, hash new, update |
| `getCustomerDashboardData` | `app/actions/customer-data.ts` | Tagihan aktif + meter terakhir |
| `getCustomerBills` | `app/actions/customer-data.ts` | List tagihan (paginated) |
| `getCustomerBillDetail` | `app/actions/customer-data.ts` | Detail tagihan by ID |
| `getCustomerMeterReadings` | `app/actions/customer-data.ts` | Riwayat meter (paginated) |

---

## 5. UI Components Baru (Reuse yang Ada)

| Komponen | Reuse Dari | Catatan |
|----------|------------|---------|
| `CustomerLoginForm` | `LoginForm` (staff) | Adaptasi: field nomor pelanggan bukan username |
| `CustomerLayout` | `DashboardLayout` | Header only (logo + nama pelanggan + logout), no sidebar/bottom-nav |
| `BillsTable` | `bills-client.tsx` | Read-only, no filter status bayar, no create |
| `BillDetailCard` | `bill-detail-client.tsx` | Read-only, no action buttons |
| `MeterReadingsTable` | `meter-readings-client.tsx` | Read-only, no QR scanner, no input |
| `PasscodeChangeForm` | `security-form.tsx` | Simplified: old + new + confirm |

---

## 6. Security (Minimal tapi Aman)

- [ ] Passcode hash: **bcrypt** (cost 12)
- [ ] Rate limit login: max 5 gagal → lock 15 menit
- [ ] Session expiry: 30 hari / browser session
- [ ] CSRF: SameSite=Lax cookie (sudah default Next.js)
- [ ] Passcode minimal 6 digit numerik (validasi client + server)
- [ ] `must_change_passcode` default `true` pada registrasi pertama
- [ ] Audit log sederhana: `pam_customer_login_logs` (customer_id, ip, user_agent, success, created_at)

---

## 6. Migration Checklist (1 File SQL)

```sql
-- 1. Tambah kolom auth ke pam_customers
ALTER TABLE pam_customers 
  ADD COLUMN IF NOT EXISTS passcode_hash TEXT,
  ADD COLUMN IF NOT EXISTS must_change_passcode BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Index untuk login
CREATE INDEX IF NOT EXISTS idx_pam_customers_customer_number_active 
  ON pam_customers (customer_number) WHERE status = 'active';

-- 3. Tabel log login (opsional tapi direkomendasikan)
CREATE TABLE IF NOT EXISTS pam_customer_login_logs (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES pam_customers(id) ON DELETE CASCADE,
  ip INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON pam_customer_login_logs (customer_id, created_at DESC);
```

---

## 7. Timeline (Estimasi 1-2 Minggu)

| Hari | Deliverable |
|------|-------------|
| **1** | Migration DB + `pam_customers` seed passcode untuk testing |
| **2** | `customer-auth.ts` actions (login, logout, change passcode), JWT utils |
| **3** | Middleware `verifyCustomerSession`, route group `(customer)`, layout |
| **4** | Login page (reuse `LoginForm`), redirect logic `must_change_passcode` |
| **5** | Dashboard page (tagihan aktif + meter terakhir) |
| **6** | Bills list + detail page (read-only) |
| **7** | Meter readings history page |
| **8** | Profile page (info + ganti passcode) |
| **9** | Polish: error handling, loading states, empty states, responsive |
| **10** | Testing manual + fix bugs |

**Total: ~2 minggu** (bisa 1 minggu kalau fokus).

---

## 8. Seed Data Testing

```sql
-- Set passcode default untuk pelanggan existing (untuk testing)
-- Passcode default: "123456" → hash bcrypt
UPDATE pam_customers 
SET passcode_hash = '$2b$12$...'  -- bcrypt hash of "123456"
WHERE passcode_hash IS NULL AND status = 'active';
```

---

## 9. Keuntungan Versi Sederhana Ini

| Aspek | Versi Full | Versi Sederhana (Ini) |
|-------|------------|----------------------|
| **Waktu dev** | 4 minggu | **1-2 minggu** |
| **Dependencies** | WA Gateway, Midtrans, Recharts, dll | **Hanya bcryptjs + jose (sudah ada)** |
| **Maintenance** | Complex (webhook, cron, dll) | **Minimal** |
| **Scope creep** | Tinggi | **Terkendali** |
| **Value pelanggan** | Bayar online + notif | **Cek tagihan & riwayat (core need)** |
| **Rollout risk** | Tinggi | **Rendah** |

---

## 10. Next Action

1. **Setuju scope** (di atas sudah cukup?)
2. **Migration DB** → jalankan SQL di Supabase
3. **Mulai implementasi** Day 1-2: auth actions + JWT
3. **Lanjut** Day 3-10: pages

---

*Versi sederhana — bisa expand nanti kalau butuh bayar online/notifikasi.*