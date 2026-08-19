# Implementasi Customer Portal — Task Breakdown (Versi Sederhana)

## Fase 0: Persiapan & Migration DB (Hari 1)

### Task 0.1: Migration Database
- [ ] Buat file migration: `supabase/migrations/0010_customer_auth_simple.sql`
- [ ] Tambah kolom ke `pam_customers`:
  - `passcode_hash TEXT`
  - `must_change_passcode BOOLEAN DEFAULT true`
  - `failed_attempts INT DEFAULT 0`
  - `locked_until TIMESTAMPTZ`
  - `last_login_at TIMESTAMPTZ`
- [ ] Buat tabel `pam_customer_login_logs`
- [ ] Buat index `idx_pam_customers_customer_number_active`
- [ ] Jalankan migration di Supabase (Dashboard → SQL Editor)
- [ ] **Acceptance**: Migration berhasil, kolom muncul di Supabase Table Editor

### Task 0.2: Seed Passcode Testing
- [ ] Generate bcrypt hash untuk "123456" (cost 12)
- [ ] Update pelanggan existing: `passcode_hash = '$2b$12$...'` WHERE status='active'
- [ ] Set `must_change_passcode = true` untuk semua
- [ ] **Acceptance**: Bisa login pakai nomor pelanggan + "123456"

### Task 0.3: Environment Variables
- [ ] Tambah di `.env.local`:
  ```
  CUSTOMER_JWT_SECRET=... (generate 32 bytes base64)
  CUSTOMER_JWT_EXPIRY_DAYS=30
  ```
- [ ] **Acceptance**: Variabel tersedia di runtime

---

## Fase 1: Auth Foundation (Hari 1-2)

### Task 1.1: JWT Utils untuk Customer
- [ ] Buat `lib/auth/customer-jwt.ts`:
  - `signCustomerToken(payload)` → JWT string
  - `verifyCustomerToken(token)` → payload | null
  - Payload: `{ customerId, sessionEpoch, iat, exp }`
- [ ] Gunakan `jose` (sudah ada di project) + `CUSTOMER_JWT_SECRET`
- [ ] **Acceptance**: Unit test sign/verify roundtrip sukses

### Task 1.2: Server Actions Auth
- [ ] Buat `app/actions/customer-auth.ts`:
  - `loginCustomerAction(formData)` → `{ error? } | { success: true, redirect: '/customer/dashboard' }`
    - Input: `customer_number`, `passcode`
    - Validasi format nomor pelanggan (regex `^PAM-\d{6}$`)
    - Cari customer by `customer_number` + `status='active'`
    - Cek `locked_until` > now → error "Terlalu banyak percobaan"
    - Verify bcrypt passcode
    - Sukses: reset `failed_attempts=0`, `last_login_at=now()`, increment `session_epoch`
    - Gagal: increment `failed_attempts`, jika ≥5 set `locked_until=now()+15min`
    - Insert log ke `pam_customer_login_logs`
    - Set cookie `customer_session` (HttpOnly, Secure, SameSite=Lax, maxAge 30 hari)
    - Return redirect URL
  - `logoutCustomerAction()` → hapus cookie, redirect `/customer/login`
  - `changePasscodeAction(formData)` → verify old passcode, hash new, update, set `must_change_passcode=false`, increment `session_epoch` (invalidate other sessions)
- [ ] **Acceptance**: Semua action compile, TypeScript pass

### Task 1.3: Middleware Customer Guard
- [ ] Update `middleware.ts` (atau buat `lib/auth/customer-middleware.ts`):
  - Matcher: `/customer/:path*` (kecuali `/customer/login`, `/customer/verify`)
  - `verifyCustomerSession()`:
    - Ambil cookie `customer_session`
    - Verify JWT → payload
    - Query `pam_customers` by `customer_id` + `session_epoch` match
    - Return `{ customerId, sessionEpoch, profile: Customer }`
    - Jika gagal → redirect `/customer/login?reset=true`
- [ ] Export `requireCustomerRole()` untuk halaman yang butuh auth
- [ ] **Acceptance**: Akses `/customer/dashboard` tanpa login → redirect ke login

---

## Fase 2: Route Group & Layout (Hari 2-3)

### Task 2.1: Route Group Structure
- [ ] Buat folder `app/(customer)/`
- [ ] Buat `app/(customer)/layout.tsx`:
  - Header minimal: Logo Alira + nama pelanggan (dari profile) + logout button
  - No sidebar, no bottom-nav
  - Class: `min-h-dvh flex flex-col bg-background`
  - Header: `sticky top-0 z-40 h-14 border-b border-border bg-background px-4`
- [ ] Buat `app/(customer)/login/page.tsx`:
  - Reuse `LoginForm` tapi field username → nomor pelanggan (format PAM-XXXXXX)
  - Action: `loginCustomerAction`
  - Error handling: tampilkan error dari action
- [ ] **Acceptance**: `/customer/login` render, submit → redirect ke dashboard

### Task 2.2: Redirect Logic & Must Change Passcode
- [ ] Di `login/page.tsx` setelah sukses: cek `must_change_passcode` dari response → redirect ke `/customer/profile?required=true`
- [ ] Buat `app/(customer)/profile/page.tsx`:
  - Form ganti passcode (lama + baru + konfirmasi)
  - Action: `changePasscodeAction`
  - Jika `required=true` → sembunyikan tombol cancel, wajib isi
  - Setelah sukses → redirect `/customer/dashboard`
- [ ] **Acceptance**: First login → force ganti passcode → lalu ke dashboard

---

## Fase 3: Dashboard Pelanggan (Hari 3-4)

### Task 3.1: Data Actions Dashboard
- [ ] Buat `app/actions/customer-data.ts`:
  - `getCustomerDashboardData()`:
    - Query tagihan belum lunas (status != 'paid') → ambil 1 terbaru (prioritas jatuh tempo)
    - Query meter reading terbaru (period desc, limit 1)
    - Return: `{ activeBill?: BillSummary, latestReading?: MeterSummary, customer: CustomerProfile }`
  - `getCustomerBills(page, limit, statusFilter)` → paginated
  - `getCustomerBillDetail(billId)` → detail + customer info
  - `getCustomerMeterReadings(page, limit)` → paginated
- [ ] Gunakan `unstable_cache` dengan tag `customer-bills-{customerId}`, revalidate 60s
- [ ] **Acceptance**: Actions return data benar, cache works

### Task 3.2: Dashboard Page
- [ ] Buat `app/(customer)/dashboard/page.tsx`:
  - Card 1: "Tagihan Belum Lunas" → periode, jumlah, jatuh tempo, status badge
  - Card 2: "Pemakaian Terakhir" → periode, angka meter, pemakaian m³
  - Card 3: "Status Pelanggan" → Aktif/Nonaktif badge
  - Empty state kalau tidak ada tagihan/meter
- [ ] Style: konsisten dengan design system (card rounded-md, h-11 input, dll)
- [ ] **Acceptance**: Dashboard menampilkan data benar, loading state, empty state

---

## Fase 4: Bills List & Detail (Hari 4-5)

### Task 4.1: Bills List Page
- [ ] Buat `app/(customer)/bills/page.tsx`:
  - Header: "Tagihan Saya"
  - Tabel: Periode | Jumlah | Status | Jatuh Tempo
  - Status badge: Lunas (success), Belum Lunas (warning), Terlambat (destructive)
  - Pagination: "Muat Lebih Banyak" (keyset pagination seperti staff)
  - Filter status: Semua / Belum Lunas / Lunas (dropdown)
  - Click row → navigate ke `/customer/bills/[id]`
- [ ] Reuse `bills-client.tsx` logic tapi read-only (no create, no edit, no filter customer)
- [ ] **Acceptance**: List render, pagination work, filter work, click navigate detail

### Task 4.2: Bill Detail Page
- [ ] Buat `app/(customer)/bills/[id]/page.tsx`:
  - Header: Periode + Status badge
  - Detail card: Abonemen, Pemakaian, Harga/m³, Total
  - Info: Jatuh tempo, Tanggal dibayar (jika lunas), Metode bayar (jika ada)
  - Foto meter (jika ada) — lazy load
  - No action buttons (read-only)
- [ ] **Acceptance**: Detail lengkap, foto load, responsive

---

## Fase 5: Meter Readings History (Hari 5-6)

### Task 5.1: Meter Readings Page
- [ ] Buat `app/(customer)/meter-readings/page.tsx`:
  - Header: "Riwayat Pencatatan Meter"
  - Tabel: Periode | Angka Meter | Pemakaian (m³) | Foto | Status
  - Foto: thumbnail click → buka full (modal atau link)
  - Pagination + filter periode (PeriodPicker reuse)
  - Empty state: "Belum ada pencatatan meter"
- [ ] Reuse `meter-readings-client.tsx` logic read-only
- [ ] **Acceptance**: Riwayat tampil benar, foto bisa dilihat, pagination work

---

## Fase 6: Profile & Passcode (Hari 6-7)

### Task 6.1: Profile Page
- [ ] Buat `app/(customer)/profile/page.tsx`:
  - Section 1: Info Pelanggan (read-only)
    - Nama, Nomor Pelanggan, Nomor Meter, Alamat, Tanggal Gabung, Status
  - Section 2: Ganti Passcode
    - Form: Passcode Lama, Passcode Baru (6 digit), Konfirmasi
    - Validasi: lama benar, baru != lama, konfirmasi match
    - Submit → `changePasscodeAction`
    - Success toast → redirect dashboard
  - Section 3: Logout button
- [ ] **Acceptance**: Info tampil benar, ganti passcode work, logout work

---

## Fase 7: Polish & Testing (Hari 7-10)

### Task 7.1: Error Handling & Loading States
- [ ] Skeleton loaders untuk dashboard, bills, meter
- [ ] Error boundary / error.tsx per route
- [ ] Toast notifications (sonner) untuk error/success actions
- [ ] Form validation inline (zod schema)

### Task 7.2: Responsive & Accessibility
- [ ] Mobile-first: test di 375px, 768px, 1280px
- [ ] Touch target ≥44px (button, input)
- [ ] Focus visible ring (sudah via design system)
- [ ] ARIA labels pada form & tabel
- [ ] Color contrast (sudah via design system)

### Task 7.3: Edge Cases
- [ ] Customer nonaktif → login gagal dengan pesan jelas
- [ ] Passcode salah 5x → lock 15 menit, pesan countdown
- [ ] Session expired → redirect login dengan `?reset=true`
- [ ] Bill tidak ditemukan → 404 page
- [ ] Network error → retry button

### Task 7.4: Testing Manual Checklist
- [ ] Login sukses dengan passcode benar
- [ ] Login gagal dengan passcode salah (counter increment)
- [ ] Lock setelah 5x gagal (wait 15 menit / manual unlock DB)
- [ ] Force change passcode first login
- [ ] Ganti passcode sukses → invalidate session lain
- [ ] Dashboard load data benar
- [ ] Bills list pagination + filter
- [ ] Bill detail data akurat
- [ ] Meter readings pagination + foto
- [ ] Profile info benar, ganti passcode work
- [ ] Logout → redirect login, cookie hapus
- [ ] Akses halaman customer tanpa login → redirect login
- [ ] Akses halaman staff sebagai customer → redirect/403

---

## Checklist Definition of Done (Per Task)

| Kriteria | Wajib |
|----------|-------|
| `npm run lint` pass | ✅ |
| `npx tsc --noEmit` pass | ✅ |
| `npm run build` pass | ✅ |
| Tidak ada console error di browser | ✅ |
| Responsive di 375px / 768px / 1280px | ✅ |
| Aksesibilitas: focus visible, label, contrast | ✅ |
| Commit message convencional (`feat:`, `fix:`, `style:`) | ✅ |

---

## Estimasi Total: 10 Hari Kerja (2 Minggu)

| Fase | Hari | Deliverable Utama |
|------|------|-------------------|
| 0: Migration & Seed | 1 | DB ready, test data |
| 1: Auth Foundation | 1-2 | JWT, actions, middleware |
| 2: Layout & Login | 2-3 | Route group, login, force passcode |
| 3: Dashboard | 3-4 | Tagihan aktif + meter terakhir |
| 4: Bills | 4-5 | List + Detail read-only |
| 5: Meter History | 5-6 | Riwayat tabel + foto |
| 6: Profile | 6-7 | Info + ganti passcode |
| 7: Polish & Test | 7-10 | Production ready |

---

## Catatan Teknis Penting

1. **Reuse existing**: `LoginForm`, `Button`, `Input`, `Card`, `Badge`, `Table`, `PeriodPicker`, `sonner` toast — sudah konsisten design system
2. **No new dependencies**: `bcryptjs` + `jose` sudah ada
3. **Cookie naming**: `customer_session` (beda dari `session` staff)
4. **Cache tags**: `customer-bills-{id}`, `customer-meter-{id}`, `customer-dashboard-{id}`
5. **RLS**: Belum perlu (pakai Supabase Admin + filter manual di actions). Bisa ditambah nanti.
5. **Session epoch**: Increment pada login, logout, ganti passcode → invalidate token lama

---

## Next Action Langsung

1. **Commit plan ini** (sudah di file terpisah)
2. **Mulai Task 0.1**: Buat migration SQL
3. **Jalankan migration** di Supabase
4. **Lanjut Task 1.1** → `lib/auth/customer-jwt.ts`