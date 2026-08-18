# Product Requirements Document (PRD)
## Aplikasi Pengelolaan PAM Air — MVP

**Versi:** 1.1  
**Platform:** Progressive Web App (PWA)  
**Frontend:** Next.js  
**Styling:** Tailwind CSS  
**UI Component:** shadcn/ui  
**Icons:** hugeicons  
**Database & Backend:** Supabase  
**Target MVP:** Pengelolaan PAM skala lingkungan, RT/RW, desa, perumahan, atau komunitas kecil.

---

# 1. Latar Belakang

Pengelolaan PAM air skala kecil sering masih dilakukan secara manual menggunakan buku, Excel, WhatsApp, atau catatan terpisah.

Aktivitas utama biasanya meliputi:

- Pendataan pelanggan.
- Pencatatan meter air setiap bulan.
- Perhitungan penggunaan air.
- Pembuatan tagihan.
- Pencatatan pembayaran.
- Pemantauan pelanggan yang menunggak.
- Pembuatan laporan bulanan.

Cara manual memiliki beberapa masalah:

- Data pelanggan mudah tercecer.
- Salah menghitung pemakaian air.
- Sulit mengetahui siapa yang belum membayar.
- Riwayat pembayaran sulit ditelusuri.
- Pembuatan laporan membutuhkan waktu.
- Data pencatatan meter dan pembayaran tidak terintegrasi.

Aplikasi ini dibuat untuk menyederhanakan proses tersebut dalam satu sistem.

---

# 2. Tujuan Produk

Tujuan MVP adalah menyediakan aplikasi sederhana yang memungkinkan pengurus PAM menjalankan alur berikut:

```text
Pelanggan
   ↓
Pencatatan Meter
   ↓
Hitung Pemakaian
   ↓
Generate Tagihan
   ↓
Pembayaran
   ↓
Lunas / Menunggak
   ↓
Laporan
```

MVP tidak perlu menangani operasional PAM yang kompleks terlebih dahulu.

Fokus utama:

> Pelanggan → Meter → Tagihan → Pembayaran → Laporan

---

# 3. Target Pengguna

## 3.1 Admin PAM

Memiliki akses penuh.

Dapat:

- Mengelola pelanggan.
- Mengelola tarif.
- Melihat semua pencatatan meter.
- Membuat tagihan.
- Mencatat pembayaran.
- Melihat tunggakan.
- Melihat laporan.

---

## 3.2 Petugas Meter

Petugas yang melakukan pencatatan meter pelanggan.

Dapat:

- Melihat daftar pelanggan.
- Melihat angka meter sebelumnya.
- Memasukkan angka meter terbaru.
- Mengambil foto meter.
- Melihat status pencatatan.

Pada MVP, role ini dapat dibuat setelah fungsi Admin stabil.

---

# 4. Scope MVP

Fitur utama MVP:

1. Login.
2. Dashboard.
3. Manajemen pelanggan.
4. Pengaturan tarif.
5. Pencatatan meter.
6. Generate tagihan.
7. Daftar tagihan.
8. Pembayaran.
9. Tunggakan.
10. Laporan sederhana.
11. PWA.

---

# 5. Fitur yang Belum Masuk MVP

Untuk menjaga aplikasi tetap sederhana, fitur berikut belum perlu dibuat:

- WhatsApp otomatis.
- Payment gateway.
- QRIS otomatis.
- Virtual Account.
- Akuntansi lengkap.
- Manajemen stok material.
- Manajemen pompa.
- Monitoring IoT.
- Smart water meter.
- GPS petugas.
- Routing petugas.
- Pengaduan pelanggan.
- Portal pelanggan.
- Mobile app native.
- Multi-PAM / SaaS.
- Sistem denda kompleks.
- SMS gateway.
- Notifikasi push kompleks.

Fitur tersebut dapat ditambahkan setelah MVP berjalan.

---

# 6. Struktur Navigasi

Navigasi utama:

```text
Dashboard

Pelanggan

Pencatatan Meter

Tagihan

Pembayaran

Laporan

Pengaturan
 ├── Tarif
 └── Profil PAM
```

Untuk tampilan mobile/PWA gunakan bottom navigation untuk menu utama.

Contoh:

```text
Home
Pelanggan
Meter
Tagihan
Lainnya
```

---

# 7. Flow Utama Aplikasi

## Flow 1 — Menambahkan Pelanggan

```text
Login
 ↓
Pelanggan
 ↓
Tambah Pelanggan
 ↓
Isi Data
 ↓
Simpan
 ↓
Pelanggan Aktif
```

Data pelanggan minimum:

- Nomor pelanggan.
- Nama pelanggan.
- Alamat.
- Nomor HP.
- Nomor meter.
- Tanggal mulai.
- Status pelanggan.

---

# 8. Nomor Pelanggan

Sistem dapat membuat nomor pelanggan otomatis.

Contoh:

```text
PAM-000001
PAM-000002
PAM-000003
```

Nomor tersebut tidak boleh berubah setelah pelanggan dibuat.

---

# 9. Halaman Pelanggan

## Daftar Pelanggan

Informasi:

- Nomor pelanggan.
- Nama.
- Alamat.
- Nomor meter.
- Status.

Search berdasarkan:

- Nama.
- Nomor pelanggan.
- Nomor meter.

Filter:

- Semua.
- Aktif.
- Nonaktif.

---

# 10. Detail Pelanggan

Contoh:

```text
Budi Santoso
PAM-000123

Jl. Melati No.12
081234567890

Meter
WM-003234

Status
Aktif
```

Tampilkan juga:

### Meter terakhir

```text
Meter terakhir
1.265 m³
```

### Tagihan

```text
Agustus 2026
Rp55.000
Belum Dibayar
```

### Riwayat

```text
Juli 2026
15 m³
Rp52.500
Lunas
```

---

# 11. Pengaturan Tarif

Admin dapat menentukan tarif air.

Untuk MVP gunakan tarif per m³ sederhana.

Contoh:

```text
Tarif Air
Rp3.000 / m³

Abonemen
Rp10.000 / bulan
```

Rumus:

```text
Pemakaian = Meter Sekarang - Meter Sebelumnya

Biaya Air = Pemakaian × Tarif

Total Tagihan =
Biaya Air + Abonemen
```

Contoh:

```text
Meter sebelumnya : 1.250
Meter sekarang   : 1.265

Pemakaian
15 m³

Tarif
Rp3.000

Biaya air
15 × Rp3.000
= Rp45.000

Abonemen
Rp10.000

Total
Rp55.000
```

MVP belum membutuhkan tarif progresif.

---

# 12. Periode Tagihan

Setiap pencatatan meter dan tagihan harus memiliki periode.

Format:

```text
Agustus 2026
September 2026
Oktober 2026
```

Secara database dapat disimpan:

```text
2026-08
2026-09
2026-10
```

---

# 13. Flow Pencatatan Meter

Flow petugas:

```text
Pencatatan Meter
 ↓
Pilih Periode
 ↓
Daftar Pelanggan
 ↓
Pilih Pelanggan
 ↓
Lihat Meter Sebelumnya
 ↓
Input Meter Sekarang
 ↓
Foto Meter (opsional)
 ↓
Simpan
```

---

# 14. Halaman Pencatatan Meter

Contoh tampilan:

```text
Pencatatan Meter
Agustus 2026

42 / 50 pelanggan selesai
```

Daftar:

```text
Budi Santoso
PAM-00123

Meter sebelumnya
1.250

[ Catat Meter ]
```

Setelah selesai:

```text
Budi Santoso

1.250 → 1.265

Pemakaian
15 m³

✓ Sudah Dicatat
```

---

# 15. Form Catat Meter

Informasi:

```text
Budi Santoso
PAM-00123

Meter sebelumnya
1.250
```

Input:

```text
Meter sekarang
[ 1265 ]
```

Hasil otomatis:

```text
Pemakaian
15 m³
```

Optional:

```text
Foto meter
[ Ambil Foto ]
```

Button:

```text
Simpan Pencatatan
```

---

# 16. Validasi Meter

Sistem harus memastikan:

```text
Meter sekarang >= Meter sebelumnya
```

Jika:

```text
Meter sebelumnya = 1.250
Meter sekarang = 1.240
```

Tampilkan:

```text
Meter sekarang tidak boleh lebih kecil
dari meter sebelumnya.
```

---

# 17. Generate Tagihan

Setelah meter dicatat, sistem dapat membuat tagihan.

Flow:

```text
Pencatatan Meter
 ↓
Generate Tagihan
 ↓
Hitung Pemakaian
 ↓
Hitung Biaya
 ↓
Buat Tagihan
```

Tagihan dapat dibuat otomatis setelah pencatatan meter disimpan atau melalui tombol:

```text
Generate Tagihan
```

Untuk MVP disarankan otomatis.

---

# 18. Struktur Tagihan

Contoh:

```text
TAGIHAN PAM

Pelanggan
Budi Santoso

Periode
Agustus 2026

Meter sebelumnya
1.250

Meter sekarang
1.265

Pemakaian
15 m³

Biaya Air
Rp45.000

Abonemen
Rp10.000

----------------

TOTAL
Rp55.000
```

---

# 19. Status Tagihan

Gunakan status:

```text
unpaid
paid
overdue
cancelled
```

UI:

- Belum Dibayar.
- Lunas.
- Menunggak.
- Dibatalkan.

---

# 20. Halaman Tagihan

Tampilkan summary:

```text
Agustus 2026

Total Tagihan
Rp25.500.000

Sudah Dibayar
Rp20.000.000

Belum Dibayar
Rp5.500.000
```

Daftar:

```text
Budi Santoso

Agustus 2026
Rp55.000

Belum Dibayar

[ Detail ]
```

Filter:

- Semua.
- Belum Dibayar.
- Lunas.
- Menunggak.

Search:

- Nama pelanggan.
- Nomor pelanggan.

---

# 21. Detail Tagihan

Contoh:

```text
Budi Santoso
PAM-000123

Agustus 2026

Pemakaian
15 m³

Biaya Air
Rp45.000

Abonemen
Rp10.000

Total
Rp55.000
```

Status:

```text
Belum Dibayar
```

Action:

```text
[ Catat Pembayaran ]
```

---

# 22. Flow Pembayaran

```text
Tagihan
 ↓
Pilih Tagihan
 ↓
Catat Pembayaran
 ↓
Pilih Metode
 ↓
Simpan
 ↓
Tagihan = Lunas
```

---

# 23. Form Pembayaran

Contoh:

```text
Budi Santoso

Tagihan
Rp55.000
```

Input:

```text
Tanggal Pembayaran
18 Agustus 2026

Metode Pembayaran
○ Tunai
○ Transfer

Nominal
Rp55.000
```

Button:

```text
Konfirmasi Pembayaran
```

Setelah berhasil:

```text
Pembayaran berhasil dicatat.

Tagihan:
LUNAS
```

---

# 24. Metode Pembayaran MVP

Gunakan dua pilihan:

```text
cash
transfer
```

Ke depan dapat dikembangkan:

- QRIS.
- Virtual Account.
- Payment gateway.

---

# 25. Tunggakan

Jika tagihan belum dibayar melewati jatuh tempo:

```text
status = overdue
```

Contoh:

```text
Budi Santoso

Juli 2026
Rp55.000

Terlambat 28 hari

MENUNGGAK
```

---

# 26. Dashboard

Dashboard merupakan ringkasan kondisi PAM.

Header:

```text
PAM Tirta Sejahtera

Agustus 2026
```

Kartu summary:

```text
Pelanggan Aktif
425
```

```text
Sudah Dicatat
380 / 425
```

```text
Tagihan Bulan Ini
Rp31.250.000
```

```text
Pembayaran Masuk
Rp27.500.000
```

```text
Tunggakan
Rp3.750.000
```

---

# 27. Aktivitas Dashboard

Tambahkan section:

## Perlu Perhatian

Contoh:

```text
45 pelanggan
Belum dicatat meter

23 pelanggan
Belum membayar

8 pelanggan
Menunggak
```

Setiap item dapat ditekan untuk membuka daftar terkait.

---

# 28. Laporan

MVP membutuhkan laporan sederhana per bulan.

Filter:

```text
Periode
[ Agustus 2026 ]
```

Tampilkan:

```text
Total Pelanggan
425

Pelanggan Aktif
412

Total Pemakaian
6.850 m³

Total Tagihan
Rp31.250.000

Pembayaran Masuk
Rp27.500.000

Belum Dibayar
Rp2.500.000

Tunggakan
Rp1.250.000
```

---

# 29. Export Laporan

Untuk MVP dapat disediakan:

```text
Download CSV
```

PDF dapat menjadi fitur berikutnya.

---

# 30. Authentication — Passcode

Untuk MVP gunakan login sederhana berbasis passcode.

Gunakan:

```text
Supabase Database
```

untuk menyimpan user dan passcode, bukan Supabase Auth.

Metode login:

```text
Passcode
```

Passcode dapat dikonfigurasi di halaman Pengaturan → Profil PAM.

Flow:

```text
Login
 ↓
Input Passcode
 ↓
Validasi di database
 ↓
Session dibuat (cookie/DB)
 ↓
Dashboard
```

Passcode di-hash sebelum disimpan (tidak boleh disimpan plaintext).

---

# 31. Database Schema

Semua tabel diberi prefix `pam_` (contoh: `pam_customers`, `pam_bills`) agar mudah dikenali dan tidak bentrok dengan tabel internal Supabase (`auth.*`, `storage.*`).

## profiles

```text
id
user_id
name
role
created_at
updated_at
```

Role awal:

```text
admin
staff
```

Karena login menggunakan passcode, tidak ada tabel auth Supabase terpisah.
User admin diidentifikasi dari profiles, dan passcode disimpan di app_settings.

---

# 32. Table customers → pam_customers

```text
id uuid

customer_number varchar

name varchar

phone varchar

address text

meter_number varchar

join_date date

status varchar

created_at timestamptz

updated_at timestamptz
```

Status:

```text
active
inactive
```

---

# 33. Table meter_readings → pam_meter_readings

```text
id uuid

customer_id uuid

period date

previous_reading numeric

current_reading numeric

usage numeric

photo_url text nullable

recorded_by uuid

recorded_at timestamptz

created_at timestamptz
```

Relasi:

```text
customer_id
→ customers.id
```

---

# 34. Table tariffs → pam_tariffs

```text
id uuid

name varchar

price_per_m3 numeric

monthly_fee numeric

effective_date date

is_active boolean

created_at timestamptz
```

Contoh:

```text
Tarif Reguler

Rp3.000 / m³

Abonemen
Rp10.000
```

---

# 35. Table bills → pam_bills

```text
id uuid

customer_id uuid

meter_reading_id uuid

period date

usage numeric

water_amount numeric

monthly_fee numeric

total_amount numeric

due_date date

status varchar

created_at timestamptz

updated_at timestamptz
```

Status:

```text
unpaid
paid
overdue
cancelled
```

---

# 36. Table payments → pam_payments

```text
id uuid

bill_id uuid

customer_id uuid

amount numeric

payment_method varchar

payment_date timestamptz

received_by uuid

notes text nullable

created_at timestamptz
```

Metode:

```text
cash
transfer
```

---

# 37. Table app_settings → pam_app_settings

```text
id uuid

pam_name varchar

address text

phone varchar

billing_due_day integer

passcode_hash text

created_at timestamptz

updated_at timestamptz
```

Passcode admin disimpan sebagai `passcode_hash` (hash, bukan plaintext).

---

# 38. Relasi Database

```text
pam_customers

   │

   ├── pam_meter_readings

   │       │

   │       └── pam_bills

   │               │

   │               └── pam_payments

   │

   └── pam_bills
```

Flow data utama:

```text
Customer
   ↓
Meter Reading
   ↓
Bill
   ↓
Payment
```

---

# 39. Supabase Storage

Gunakan Supabase Storage untuk menyimpan foto meter.

Bucket:

```text
meter-photos
```

Path contoh:

```text
meter-photos/
2026/
08/
PAM-000123.jpg
```

---

# 40. Row Level Security

Semua tabel wajib mengaktifkan:

```text
RLS
```

Pada MVP:

Admin dan staff yang sudah login dapat mengakses data PAM.

Public user tidak boleh memiliki akses ke database.

---

# 41. Next.js Architecture

Rekomendasi:

```text
Next.js
App Router
TypeScript
```

Struktur:

```text
app/

(auth)/
   login/

(dashboard)/
   dashboard/
   customers/
   meter-readings/
   bills/
   payments/
   reports/
   settings/

api/

components/

lib/

hooks/

types/
```

---

# 42. UI Components

Gunakan shadcn/ui.

Komponen utama:

- Button.
- Card.
- Input.
- Label.
- Select.
- Badge.
- Dialog.
- Drawer.
- Sheet.
- Tabs.
- Table.
- Dropdown Menu.
- Command.
- Alert Dialog.
- Form.
- Calendar.
- Toast / Sonner.

Icons menggunakan **hugeicons**.

---

# 43. Mobile First

Karena digunakan sebagai PWA, desain harus mobile-first.

Prioritas:

```text
360px
390px
430px
```

Kemudian responsive ke desktop.

---

# 44. PWA

Aplikasi harus dapat:

- Dibuka melalui browser.
- Install ke home screen.
- Memiliki icon aplikasi.
- Memiliki splash screen.
- Berjalan fullscreen.
- Memiliki manifest.
- Menggunakan service worker.

Nama aplikasi contoh:

```text
PAM Kita
```

Short name:

```text
PAM
```

---

# 45. Offline

Untuk MVP tidak perlu full offline.

Namun PWA harus tetap dapat menampilkan:

```text
Tidak ada koneksi internet.
Periksa koneksi Anda.
```

Offline synchronization dapat dibuat pada versi berikutnya.

---

# 46. UX Mobile

Karena petugas meter kemungkinan menggunakan HP sambil berjalan dari rumah ke rumah, halaman pencatatan meter harus sangat sederhana.

Hindari:

- Terlalu banyak input.
- Modal bertumpuk.
- Tabel desktop.
- Tombol kecil.

Gunakan:

- Card.
- Input angka besar.
- Tombol besar.
- Search cepat.

---

# 47. Flow Petugas di Lapangan

Ideal:

```text
Pencatatan Meter

↓

Cari pelanggan

↓

Budi Santoso
Meter sebelumnya: 1250

↓

Input:
1265

↓

Pemakaian:
15 m³

↓

Ambil Foto

↓

Simpan

↓

Otomatis lanjut
ke pelanggan berikutnya
```

Ini menjadi salah satu UX paling penting dalam aplikasi.

---

# 48. Search Pelanggan

Search harus tersedia di:

- Pelanggan.
- Pencatatan meter.
- Tagihan.
- Pembayaran.

Search berdasarkan:

```text
Nama
Nomor pelanggan
Nomor meter
```

---

# 49. Format Mata Uang

Gunakan format Indonesia:

```text
Rp55.000
Rp1.250.000
```

Bukan:

```text
Rp 55,000.00
```

---

# 50. Format Meter

Gunakan:

```text
15 m³
```

---

# 51. Format Tanggal

UI:

```text
18 Agustus 2026
```

Database:

```text
2026-08-18
```

---

# 52. Empty State

Contoh halaman pelanggan kosong:

```text
Belum ada pelanggan.

Tambahkan pelanggan pertama untuk
mulai mengelola PAM.

[ Tambah Pelanggan ]
```

---

# 53. Loading State

Gunakan Skeleton shadcn.

Contoh:

```text
Skeleton Dashboard Card

Skeleton List Customer
```

Hindari layar kosong ketika data sedang dimuat.

---

# 54. Error State

Contoh:

```text
Data gagal dimuat.

Periksa koneksi internet dan coba lagi.

[ Coba Lagi ]
```

---

# 55. Konfirmasi Pembayaran

Karena pembayaran merupakan transaksi penting, gunakan konfirmasi.

```text
Konfirmasi Pembayaran

Anda akan mencatat pembayaran
Rp55.000 untuk Budi Santoso.

[ Batal ]

[ Konfirmasi ]
```

---

# 56. Konfirmasi Penghapusan

Untuk data transaksi seperti:

- Meter reading.
- Tagihan.
- Pembayaran.

Sebaiknya tidak menggunakan hard delete.

Gunakan:

```text
cancelled
```

atau soft delete agar histori tetap tersedia.

---

# 57. User Stories

## Pelanggan

```text
Sebagai admin,
saya ingin menambahkan pelanggan
agar pelanggan dapat dicatat penggunaan airnya.
```

## Meter

```text
Sebagai petugas,
saya ingin mencatat meter pelanggan
agar penggunaan air bulanan dapat diketahui.
```

## Tagihan

```text
Sebagai admin,
saya ingin sistem menghitung tagihan otomatis
agar tidak perlu menghitung secara manual.
```

## Pembayaran

```text
Sebagai admin,
saya ingin mencatat pembayaran
agar saya mengetahui pelanggan yang sudah lunas.
```

## Tunggakan

```text
Sebagai admin,
saya ingin melihat pelanggan yang menunggak
agar dapat melakukan penagihan.
```

## Laporan

```text
Sebagai pengurus,
saya ingin melihat laporan bulanan
agar mengetahui kondisi pembayaran PAM.
```

---

# 58. Acceptance Criteria — Pelanggan

Fitur dianggap selesai jika:

- Admin dapat menambah pelanggan.
- Admin dapat mengedit pelanggan.
- Admin dapat menonaktifkan pelanggan.
- Nomor pelanggan dibuat otomatis.
- Pelanggan dapat dicari.
- Detail pelanggan dapat dibuka.

---

# 59. Acceptance Criteria — Meter

Fitur dianggap selesai jika:

- Sistem menampilkan meter sebelumnya.
- Petugas dapat memasukkan meter sekarang.
- Sistem menghitung usage otomatis.
- Meter sekarang tidak boleh lebih kecil.
- Foto meter dapat disimpan.
- Pencatatan tersimpan berdasarkan periode.

---

# 60. Acceptance Criteria — Tagihan

Fitur dianggap selesai jika:

- Tagihan dapat dibuat dari pencatatan meter.
- Pemakaian dihitung otomatis.
- Biaya air dihitung otomatis.
- Abonemen ditambahkan.
- Total dihitung otomatis.
- Status awal menjadi belum dibayar.

---

# 61. Acceptance Criteria — Pembayaran

Fitur dianggap selesai jika:

- Admin dapat membuka tagihan.
- Admin dapat mencatat pembayaran.
- Pembayaran tersimpan.
- Status tagihan berubah menjadi lunas.
- Riwayat pembayaran tersedia.

---

# 62. Acceptance Criteria — Dashboard

Dashboard dianggap selesai jika menampilkan:

- Total pelanggan.
- Pelanggan aktif.
- Progress pencatatan meter.
- Total tagihan.
- Total pembayaran.
- Total belum dibayar.
- Total tunggakan.

---

# 63. Development Phase

## Phase 1 — Foundation

Buat:

- Next.js.
- Tailwind CSS.
- shadcn/ui.
- hugeicons.
- Supabase.
- Authentication (passcode).
- Layout.
- Navigation.
- PWA.

---

## Phase 2 — Customer Management

Buat:

- Customer table.
- Daftar pelanggan.
- Tambah pelanggan.
- Edit pelanggan.
- Detail pelanggan.
- Search.

---

## Phase 3 — Tariff

Buat:

- Pengaturan tarif.
- Tarif per m³.
- Abonemen.

---

## Phase 4 — Meter Reading

Buat:

- Periode.
- Daftar pelanggan.
- Input meter.
- Kalkulasi usage.
- Upload foto.
- History meter.

---

## Phase 5 — Billing

Buat:

- Generate tagihan.
- Daftar tagihan.
- Detail tagihan.
- Status tagihan.
- Jatuh tempo.

---

## Phase 6 — Payment

Buat:

- Form pembayaran.
- Cash.
- Transfer.
- Update status tagihan.
- Riwayat pembayaran.

---

## Phase 7 — Dashboard & Report

Buat:

- Dashboard summary.
- Report bulanan.
- Daftar tunggakan.
- Export CSV.

---

# 64. MVP Definition of Done

Aplikasi MVP dianggap dapat digunakan ketika flow berikut berjalan penuh:

```text
Admin Login

↓

Tambah Pelanggan

↓

Atur Tarif

↓

Catat Meter

↓

Sistem Menghitung Pemakaian

↓

Sistem Membuat Tagihan

↓

Admin Mencatat Pembayaran

↓

Tagihan Berubah Menjadi Lunas

↓

Dashboard dan Laporan Terupdate
```

---

# 65. Flow MVP Final

Versi paling sederhana:

```text
┌─────────────────┐
│    Pelanggan    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pencatatan Meter│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Hitung Pemakaian│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Tagihan     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Pembayaran   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lunas/Tunggakan │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Laporan     │
└─────────────────┘
```

---

# 66. Fokus Desain MVP

Prinsip utama aplikasi:

> Sedikit menu, sedikit input, dan setiap proses utama dapat diselesaikan secepat mungkin.

Untuk versi pertama, jangan membuat sistem seperti software PDAM besar.

Cukup selesaikan empat pekerjaan utama:

```text
1. Siapa pelanggan kita?

2. Berapa meter airnya?

3. Berapa tagihannya?

4. Sudah bayar atau belum?
```

Jika empat hal tersebut sudah berjalan dengan baik, fitur lain dapat dikembangkan secara bertahap.