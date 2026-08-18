# Plan Pengelolaan Pengeluaran Alira

## 1. Ringkasan

Fitur Pengeluaran digunakan sebagai buku kas keluar untuk mencatat biaya operasional PAM, misalnya:

- Pemeliharaan rutin.
- Perbaikan saluran atau pipa.
- Pembelian keran, meter, dan sparepart.
- Biaya listrik dan pompa.
- Jasa teknisi.
- Biaya administrasi.

Data pengeluaran harus dipisahkan dari tabel pembayaran pelanggan. Pembayaran pelanggan adalah kas masuk, sedangkan pengeluaran adalah kas keluar.

Tujuan utama MVP:

1. Pengurus dapat mencatat pengeluaran dengan cepat.
2. Pengeluaran dapat dicari dan difilter berdasarkan periode serta kategori.
3. Bukti pembayaran dapat disimpan sebagai foto.
4. Data dapat diedit atau dihapus dengan perlindungan konfirmasi.
5. Laporan dapat menghitung pemasukan, pengeluaran, dan saldo bersih.

## 2. Prinsip Produk

- Sederhana untuk pengurus PAM lokal.
- Satu transaksi mewakili satu pengeluaran yang sudah dibayar.
- Nominal selalu disimpan sebagai angka positif.
- Satu transaksi memiliki satu kategori utama.
- Bukti pembayaran bersifat opsional.
- Tidak menambahkan approval, anggaran, atau inventaris pada MVP.
- Tidak menggunakan summary card atau banner yang hanya bersifat informatif.

## 3. Scope MVP

Fitur yang termasuk:

- Daftar pengeluaran.
- Filter periode.
- Filter kategori.
- Tambah pengeluaran.
- Edit pengeluaran.
- Hapus pengeluaran dengan dialog konfirmasi.
- Upload, ganti, dan hapus bukti pembayaran.
- Total pengeluaran periode aktif pada subtitle header.
- Integrasi ke halaman Laporan.
- Export CSV.
- Menu Pengeluaran di halaman Lainnya.
- Pilihan Catat Pengeluaran pada Quick Action.

Fitur yang belum termasuk:

- Pengajuan dan persetujuan pengeluaran.
- Anggaran bulanan.
- Purchase order.
- Hutang kepada vendor.
- Rincian banyak item dalam satu transaksi.
- Pengelolaan stok keran, pipa, meter, atau sparepart.
- Tutup buku bulanan.

## 4. Kategori Pengeluaran

Kategori awal menggunakan key yang stabil di database dan label Bahasa Indonesia di UI.

| Key | Label |
| --- | --- |
| `maintenance` | Pemeliharaan Rutin |
| `pipe_repair` | Perbaikan Saluran |
| `equipment` | Peralatan dan Sparepart |
| `electricity_pump` | Listrik dan Pompa |
| `technician` | Jasa Teknisi |
| `operations` | Operasional Administrasi |
| `other` | Lainnya |

Kategori disimpan sebagai `text` agar migrasi kategori baru tetap sederhana. Validasi daftar kategori dilakukan di server action.

## 5. Struktur Database

Tambahkan migration baru, misalnya:

```text
supabase/migrations/0005_expenses.sql
```

Rancangan tabel:

```sql
create table if not exists public.pam_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  title text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  payee text,
  payment_method text not null
    check (payment_method in ('cash', 'transfer')),
  receipt_url text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pam_expenses enable row level security;

create index if not exists idx_pam_expenses_date
  on public.pam_expenses (expense_date desc);

create index if not exists idx_pam_expenses_category_date
  on public.pam_expenses (category, expense_date desc);
```

RLS tetap aktif. Akses aplikasi menggunakan Supabase service role dari server, mengikuti tabel Alira lainnya.

## 6. TypeScript Types

Tambahkan type berikut pada `lib/types.ts`:

```ts
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
  receipt_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
```

Definisi kategori dan label ditempatkan pada satu registry, misalnya `lib/expenses.ts`, agar form, filter, card, dan CSV menggunakan sumber yang sama.

## 7. Data Layer

Tambahkan file:

```text
lib/data/expenses.ts
```

Fungsi utama:

```ts
getExpenses(period: string, category?: ExpenseCategory): Promise<Expense[]>
getExpenseById(id: string): Promise<Expense | null>
getExpenseTotal(period: string): Promise<number>
```

Ketentuan query:

- Filter periode menggunakan rentang tanggal awal dan akhir bulan.
- Urutkan `expense_date desc`, lalu `created_at desc`.
- Pilih hanya kolom yang diperlukan.
- Hindari query per transaksi atau pola N+1.
- Total periode dihitung oleh query agregat atau dari hasil yang sama jika volume masih kecil.

## 8. Server Actions

Tambahkan file:

```text
app/actions/expenses.ts
```

Server action utama:

```ts
saveExpenseAction(prevState, formData)
deleteExpenseAction(formData)
removeExpenseReceiptAction(formData)
```

Validasi server:

- Session wajib valid.
- Tanggal wajib valid.
- Judul wajib diisi dan di-trim.
- Kategori harus terdaftar pada registry.
- Nominal harus lebih besar dari nol.
- Metode pembayaran hanya `cash` atau `transfer`.
- Bukti hanya menerima JPEG, PNG, atau WebP.
- Ukuran bukti maksimal 5 MB.
- ID wajib valid saat edit atau hapus.

Path yang direvalidasi:

```text
/expenses
/reports
/dashboard
```

## 9. Penyimpanan Bukti

Gunakan Supabase Storage bucket:

```text
expense-receipts
```

Format path yang disarankan:

```text
YYYY-MM/{expense-id}.{extension}
```

Aturan:

- Upload dilakukan di server action.
- Edit tanpa file baru mempertahankan bukti lama.
- Upload file baru mengganti bukti lama.
- Hapus transaksi juga menghapus file bukti jika ada.
- Jika upload gagal, transaksi tidak boleh dilaporkan berhasil.

## 10. Route dan File

Route utama:

```text
/expenses
```

Struktur file yang disarankan:

```text
app/(dashboard)/expenses/page.tsx
components/expenses/expenses-client.tsx
components/expenses/expense-form.tsx
app/actions/expenses.ts
lib/data/expenses.ts
lib/expenses.ts
```

MVP tidak memerlukan route detail terpisah. Edit dan detail utama dapat ditampilkan melalui dialog form.

## 11. Header Halaman

Header mengikuti pola halaman Pelanggan dan Tarif:

```text
Pengeluaran                     [Catat Pengeluaran]
Rp2.500.000 pada Agustus 2026   [Pilih Periode]
```

Pada mobile, action boleh turun ke baris berikutnya jika ruang tidak cukup.

Tidak perlu menambahkan summary card terpisah.

## 12. Filter

Kontrol halaman:

- Period picker.
- Chip `Semua`.
- Chip kategori yang memiliki transaksi.
- Jumlah transaksi dapat ditampilkan pada chip.

Filter disimpan pada query string:

```text
/expenses?period=2026-08&category=pipe_repair
```

Perubahan filter menggunakan router dan tetap dapat dibuka ulang melalui URL.

## 13. Desain Card Pengeluaran

Card mengikuti pola daftar Pelanggan, Tarif, dan Pembayaran:

```text
┌────────────────────────────────────────────┐
│ [icon] Perbaikan saluran RT 03  Rp750.000 │
│        Perbaikan Saluran - 18 Agu          │
│        Toko Bangunan Maju                  │
│                                            │
│                              [Edit] [Hapus]│
└────────────────────────────────────────────┘
```

Ketentuan visual:

- Tidak memakai background status tambahan.
- Ikon berada di kiri.
- Judul dan kategori berada di tengah.
- Nominal berada di kanan dan menggunakan `font-semibold`.
- Vendor hanya tampil jika diisi.
- Tombol aksi berada di bagian bawah dan rata kanan.
- Hapus menggunakan variant destructive dan dialog konfirmasi.

## 14. Empty State

Jika belum ada pengeluaran:

```text
Belum ada pengeluaran
Catat pengeluaran pertama untuk periode ini.
```

CTA tidak perlu diulang apabila tombol `Catat Pengeluaran` sudah tersedia di header.

Jika filter kategori tidak menghasilkan data:

```text
Tidak ada pengeluaran pada kategori ini.
[Hapus Filter]
```

## 15. Form Tambah dan Edit

Field form:

1. Judul pengeluaran.
2. Tanggal.
3. Kategori.
4. Nominal.
5. Penerima/vendor.
6. Metode pembayaran.
7. Foto bukti.
8. Catatan.

Layout dialog:

- Judul menggunakan lebar penuh.
- Tanggal dan kategori menjadi dua kolom pada desktop.
- Nominal dan metode pembayaran menjadi dua kolom pada desktop.
- Vendor, bukti, dan catatan menggunakan lebar penuh.
- Mobile selalu satu kolom.
- Tombol `Batal` dan `Simpan` berada pada DialogFooter.
- Perubahan yang belum disimpan harus memunculkan konfirmasi sebelum dialog ditutup.

## 16. Integrasi Halaman Lainnya

Tambahkan menu:

```text
Pengeluaran
Catat dan kelola biaya operasional
```

Posisi yang disarankan adalah shortcut operasional bersama Laporan dan Pembayaran.

Jika tiga shortcut terlalu sempit pada mobile, gunakan grid dua kolom dan biarkan item ketiga memenuhi satu kolom berikutnya, atau ubah menjadi daftar horizontal compact.

## 17. Integrasi Quick Action

Tambahkan registry Quick Action:

```ts
{
  key: "expense-new",
  label: "Catat Pengeluaran",
  description: "Catat biaya operasional",
  href: "/expenses?new=true",
  icon: WalletOutgoingIcon,
}
```

Jika icon tersebut tidak tersedia, gunakan `BanknoteArrowUpIcon` atau icon pengeluaran lain yang tersedia pada Hugeicons.

Halaman `/expenses` membaca query `new=true` untuk langsung membuka form tambah.

## 18. Integrasi Laporan

Laporan periode perlu menghitung:

```text
Pemasukan       = total pembayaran pelanggan
Pengeluaran     = total pam_expenses
Saldo bersih    = pemasukan - pengeluaran
```

Data pengeluaran juga harus masuk ke export CSV.

Opsi CSV:

- File pelanggan/tagihan tetap seperti saat ini.
- Tambahkan file khusus `pengeluaran-YYYY-MM.csv`.
- Atau tambahkan tombol export terpisah pada halaman Pengeluaran.

Untuk MVP, export khusus pengeluaran lebih sederhana dan tidak mencampur struktur kolom yang berbeda.

## 19. Integrasi Dashboard

Dashboard tidak wajib diubah pada fase awal.

Jika diperlukan pada fase berikutnya, tampilkan pengeluaran hanya sebagai bagian dari nilai keuangan bulanan, bukan kartu tambahan yang berdiri sendiri.

## 20. Keamanan dan Audit

- Semua query dan mutation wajib memanggil `verifySession()`.
- File bukti tidak boleh menerima tipe file selain yang diizinkan.
- Nama file dari pengguna tidak digunakan langsung sebagai storage path.
- Hapus transaksi membutuhkan dialog konfirmasi.
- Simpan `created_at` dan `updated_at` untuk audit dasar.
- `created_by` disiapkan untuk saat sistem memiliki lebih dari satu pengguna.

## 21. Performa

- Index utama pada `expense_date`.
- Index gabungan pada `category, expense_date`.
- Query daftar dibatasi per periode, bukan mengambil seluruh histori.
- Upload bukti tidak dilakukan saat page load.
- Hindari fetch ulang terpisah untuk setiap transaksi.
- Jika volume sudah besar, tambahkan pagination atau infinite scroll.

## 22. Urutan Implementasi

### Fase 1 - Fondasi

1. Tambahkan migration `pam_expenses` dan index.
2. Tambahkan type dan registry kategori.
3. Tambahkan data layer.
4. Tambahkan server actions.

### Fase 2 - UI Pengeluaran

1. Tambahkan halaman `/expenses`.
2. Tambahkan header, period picker, dan filter kategori.
3. Tambahkan card daftar dan empty state.
4. Tambahkan dialog tambah/edit.
5. Tambahkan konfirmasi hapus.

### Fase 3 - Bukti dan Integrasi

1. Tambahkan bucket dan upload bukti.
2. Tambahkan menu Lainnya.
3. Tambahkan registry Quick Action.
4. Tambahkan export CSV pengeluaran.
5. Tambahkan pemasukan, pengeluaran, dan saldo bersih ke data laporan.

### Fase 4 - Verifikasi

1. Jalankan lint.
2. Jalankan build.
3. Uji tambah, edit, hapus, dan filter.
4. Uji upload serta penggantian bukti.
5. Uji nominal laporan dan CSV.
6. Uji tampilan mobile dan desktop.

## 23. Acceptance Criteria

Fitur dianggap selesai jika:

- Pengurus dapat mencatat pengeluaran baru.
- Pengurus dapat mengedit transaksi.
- Pengurus dapat menghapus transaksi setelah konfirmasi.
- Nominal nol atau negatif ditolak.
- Kategori dan metode pembayaran divalidasi di server.
- Daftar hanya menampilkan transaksi pada periode aktif.
- Filter kategori bekerja melalui query string.
- Total pengeluaran periode sesuai dengan transaksi yang tampil.
- Bukti valid dapat diunggah dan dibuka kembali.
- File yang terlalu besar atau tidak didukung ditolak.
- Menu Pengeluaran tersedia pada halaman Lainnya.
- Catat Pengeluaran tersedia sebagai pilihan Quick Action.
- CSV pengeluaran dapat diunduh.
- Lint dan production build berhasil.

## 24. Risiko dan Mitigasi

### Salah hapus

Mitigasi: dialog konfirmasi dengan nama transaksi dan nominal.

### Nominal laporan tidak sesuai

Mitigasi: semua agregasi menggunakan data server dan periode tanggal yang sama.

### Bukti gagal diunggah

Mitigasi: jangan menampilkan status sukses sebelum upload dan penyimpanan selesai.

### Kategori berkembang

Mitigasi: gunakan key string dan registry terpusat. Pindahkan ke tabel kategori hanya jika pengurus perlu membuat kategori sendiri.

### Data semakin besar

Mitigasi: index tanggal, query per bulan, dan pagination saat dibutuhkan.

## 25. Pengembangan Lanjutan

Setelah MVP stabil, fitur dapat dikembangkan menjadi:

- Anggaran per kategori.
- Approval pengeluaran.
- Rincian material dan jasa dalam satu transaksi.
- Data vendor.
- Inventaris sparepart.
- Pengingat biaya rutin.
- Tutup buku bulanan.
- Audit log per pengguna.
