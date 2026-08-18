# Plan Pengelolaan Admin dan Pegawai Alira

## 1. Ringkasan

Alira saat ini menggunakan satu passcode bersama dan selalu membuat session sebagai admin. Model ini cukup untuk satu pengurus, tetapi tidak dapat:

- Menentukan siapa yang melakukan transaksi.
- Membatasi akses berdasarkan tugas pegawai.
- Menonaktifkan satu pegawai tanpa mengganti passcode semua orang.
- Menampilkan histori aktivitas per pengguna.
- Memisahkan kewenangan administrasi, keuangan, dan pencatatan meter.

Fitur Admin dan Pegawai akan mengubah autentikasi menjadi akun individual dengan username dan passcode 6 digit.

## 2. Tujuan

1. Setiap admin dan pegawai memiliki akun sendiri.
2. Akses fitur dibatasi berdasarkan role.
3. Setiap transaksi menyimpan identitas petugas.
4. Admin dapat menambah, mengubah, menonaktifkan, dan mereset passcode pegawai.
5. Migrasi tidak mengunci admin yang sudah memakai aplikasi.
6. Pemeriksaan akses dilakukan di server, bukan hanya dengan menyembunyikan menu.

## 3. Kondisi Sistem Saat Ini

Autentikasi saat ini:

- Hash passcode disimpan pada `pam_app_settings.passcode_hash`.
- Login hanya meminta passcode.
- Session menggunakan `userId: "admin"` dan `role: "admin"`.
- Tabel `pam_profiles` sudah tersedia tetapi belum digunakan untuk login.
- Kolom `recorded_by`, `received_by`, dan `created_by` belum diisi dengan pengguna sebenarnya.

File utama yang perlu diubah:

```text
app/actions/auth.ts
lib/auth/session.ts
lib/auth/dal.ts
app/(auth)/login/page.tsx
app/(auth)/login/login-form.tsx
app/actions/meter-readings.ts
app/actions/payments.ts
app/actions/expenses.ts
```

## 4. Role Pengguna

Role awal:

| Role | Label | Fungsi |
| --- | --- | --- |
| `admin` | Admin | Mengelola seluruh aplikasi dan pegawai |
| `treasurer` | Bendahara | Mengelola tagihan, pembayaran, pengeluaran, dan laporan |
| `meter_reader` | Petugas Meter | Mengelola pelanggan dan pencatatan meter |

Tidak perlu menambahkan role yang terlalu rinci pada MVP. Role baru dapat ditambahkan setelah pola penggunaan nyata diketahui.

## 5. Matriks Hak Akses

| Fitur | Admin | Bendahara | Petugas Meter |
| --- | --- | --- | --- |
| Dashboard | Ya | Ya | Ya |
| Lihat pelanggan | Ya | Ya | Ya |
| Tambah/edit pelanggan | Ya | Tidak | Ya |
| Aktif/nonaktif pelanggan | Ya | Tidak | Tidak |
| Pencatatan meter | Ya | Lihat | Ya |
| Tagihan | Ya | Ya | Lihat |
| Pembayaran | Ya | Ya | Tidak |
| Pengeluaran | Ya | Ya | Tidak |
| Laporan | Ya | Ya | Tidak |
| Profil Alira | Ya | Tidak | Tidak |
| Tarif | Ya | Tidak | Tidak |
| Quick Action | Ya | Tidak | Tidak |
| Kelola pegawai | Ya | Tidak | Tidak |
| Keamanan aplikasi | Ya | Tidak | Tidak |

Hak akses harus diterapkan pada:

- Page server component.
- Data access layer.
- Server action.
- Menu dan Quick Action.

Menyembunyikan tombol di UI tidak dianggap sebagai perlindungan keamanan.

## 6. Perubahan Database

Gunakan tabel `pam_profiles` yang sudah ada. Tidak perlu membuat tabel pengguna baru.

Migration yang disarankan:

```text
supabase/migrations/0006_staff_accounts.sql
```

Kolom baru:

```sql
alter table public.pam_profiles
  add column if not exists username text,
  add column if not exists passcode_hash text,
  add column if not exists status text not null default 'active',
  add column if not exists must_change_passcode boolean not null default true,
  add column if not exists failed_attempts integer not null default 0,
  add column if not exists locked_until timestamptz,
  add column if not exists last_login_at timestamptz;
```

Role lama `staff` perlu dimigrasikan:

```sql
update public.pam_profiles
set role = 'meter_reader'
where role = 'staff';
```

Perbarui constraint role:

```sql
alter table public.pam_profiles
  drop constraint if exists pam_profiles_role_check;

alter table public.pam_profiles
  add constraint pam_profiles_role_check
  check (role in ('admin', 'treasurer', 'meter_reader'));
```

Tambahkan constraint status:

```sql
alter table public.pam_profiles
  add constraint pam_profiles_status_check
  check (status in ('active', 'inactive'));
```

Username harus unik tanpa membedakan huruf besar/kecil:

```sql
create unique index if not exists idx_pam_profiles_username_lower
  on public.pam_profiles (lower(username));
```

Index pendukung:

```sql
create index if not exists idx_pam_profiles_status_role
  on public.pam_profiles (status, role);
```

## 7. Migrasi Admin Lama

Passcode lama harus dipindahkan menjadi akun admin pertama sebelum login lama dinonaktifkan.

Contoh akun hasil migrasi:

```text
Nama       : Administrator
Username   : admin
Role       : admin
Status     : active
Passcode   : menggunakan hash lama
```

Migration dapat menyalin hash lama:

```sql
insert into public.pam_profiles (
  name,
  username,
  role,
  status,
  passcode_hash,
  must_change_passcode
)
select
  'Administrator',
  'admin',
  'admin',
  'active',
  passcode_hash,
  false
from public.pam_app_settings
where passcode_hash is not null
  and not exists (
    select 1
    from public.pam_profiles
    where lower(username) = 'admin'
  );
```

Urutan rollout:

1. Tambahkan kolom akun.
2. Buat admin dari passcode lama.
3. Deploy login username dan passcode.
4. Verifikasi akun admin dapat masuk.
5. Hentikan penggunaan `pam_app_settings.passcode_hash`.
6. Hapus kolom lama pada migration terpisah setelah sistem stabil.

## 8. TypeScript Types

Tambahkan type:

```ts
export type StaffRole = "admin" | "treasurer" | "meter_reader";
export type StaffStatus = "active" | "inactive";

export type StaffProfile = {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  must_change_passcode: boolean;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};
```

`passcode_hash` tidak boleh dikirim ke Client Component.

## 9. Session

Session tetap menggunakan JWT server-side, tetapi payload memakai data akun sebenarnya:

```ts
type SessionPayload = {
  userId: string;
  role: StaffRole;
  expiresAt: number;
};
```

Session tidak perlu menyimpan nama atau username karena data tersebut dapat berubah. Ambil profil aktif berdasarkan `userId` saat diperlukan.

Session harus ditolak jika:

- Profil tidak ditemukan.
- Status pengguna `inactive`.
- Role tidak valid.
- Token kedaluwarsa.

## 10. Login Baru

Login meminta:

```text
Username
[________________________]

Passcode
[_] [_] [_] [_] [_] [_]

[Masuk]
```

Alur login:

1. Normalisasi username menjadi lowercase dan trim.
2. Cari profil aktif berdasarkan username.
3. Periksa apakah akun sedang terkunci.
4. Verifikasi passcode hash.
5. Tambah `failed_attempts` jika salah.
6. Kunci sementara jika percobaan gagal melewati batas.
7. Reset percobaan gagal jika berhasil.
8. Simpan `last_login_at`.
9. Buat session dengan ID dan role profil.
10. Redirect ke Dashboard atau halaman ganti passcode sementara.

## 11. Perlindungan Percobaan Login

Aturan awal yang disarankan:

- Maksimal 5 percobaan gagal.
- Kunci akun selama 15 menit.
- Login berhasil mereset `failed_attempts` menjadi nol.
- Admin dapat mereset status terkunci dari halaman pegawai.
- Pesan login tidak membedakan username tidak ditemukan dan passcode salah.

Pesan yang aman:

```text
Username atau passcode salah.
```

## 12. Authorization Helper

Tambahkan helper pada auth DAL:

```ts
requireRole(["admin"]);
requireRole(["admin", "treasurer"]);
requireRole(["admin", "meter_reader"]);
```

Contoh implementasi:

```ts
export async function requireRole(allowed: StaffRole[]) {
  const session = await verifySession();
  if (!allowed.includes(session.role)) {
    redirect('/dashboard');
  }
  return session;
}
```

Server action sebaiknya mengembalikan error `Tidak memiliki akses` daripada hanya melakukan return kosong.

## 13. Data Layer Pegawai

Tambahkan:

```text
lib/data/staff.ts
```

Fungsi:

```ts
getStaffProfiles(): Promise<StaffProfile[]>
getStaffProfile(id: string): Promise<StaffProfile | null>
getCurrentProfile(): Promise<StaffProfile>
```

Ketentuan:

- Jangan select `passcode_hash` pada query daftar.
- Urutkan akun aktif lebih dulu.
- Admin lebih dulu, kemudian nama.
- Seluruh fungsi harus memverifikasi session dan role.

## 14. Server Actions Pegawai

Tambahkan:

```text
app/actions/staff.ts
```

Action utama:

```ts
saveStaffAction(prevState, formData)
setStaffStatusAction(formData)
resetStaffPasscodeAction(prevState, formData)
unlockStaffAction(formData)
changeOwnPasscodeAction(prevState, formData)
```

Validasi tambah/edit:

- Hanya admin.
- Nama wajib diisi.
- Username wajib diisi dan unik tanpa case-sensitive.
- Username hanya berisi huruf kecil, angka, titik, garis bawah, atau tanda minus.
- Role harus valid.
- Passcode sementara tepat 6 digit.
- Akun baru selalu `must_change_passcode = true`.

## 15. Perlindungan Admin

Aturan wajib:

- Admin tidak dapat menonaktifkan akunnya sendiri.
- Admin tidak dapat menurunkan role dirinya sendiri.
- Admin aktif terakhir tidak dapat dinonaktifkan.
- Admin aktif terakhir tidak dapat diubah menjadi role lain.
- Akun dengan histori transaksi tidak dihapus permanen.
- Gunakan status `inactive` sebagai pengganti delete.

Pemeriksaan ini wajib dilakukan ulang di server action.

## 16. Halaman Kelola Pegawai

Route:

```text
/more/staff
```

Header:

```text
Admin & Pegawai                  [Tambah Pegawai]
3 aktif dari 4 akun
```

Card akun:

```text
┌─────────────────────────────────────────┐
│ [icon] Budi Santoso              Aktif │
│        budi.meter - Petugas Meter       │
│        Login terakhir 18 Agu 08:42      │
│                                         │
│       [Edit] [Reset Passcode] [Nonaktifkan]
└─────────────────────────────────────────┘
```

Ketentuan visual:

- Gunakan pola card Pelanggan dan Pengeluaran.
- Badge role dan status harus mudah dibedakan.
- Aksi akun aktif dan nonaktif memakai label yang jelas.
- Tidak menambahkan summary card atau banner informatif.

## 17. Form Tambah dan Edit Pegawai

Field tambah:

1. Nama.
2. Username.
3. Role.
4. Passcode sementara 6 digit.
5. Konfirmasi passcode.

Field edit:

1. Nama.
2. Username.
3. Role.

Passcode tidak diedit melalui form profil. Gunakan action Reset Passcode terpisah.

Form menggunakan dialog dengan:

- Validasi inline.
- Konfirmasi perubahan belum disimpan.
- Tombol Batal dan Simpan pada footer.
- Field role menggunakan select.

## 18. Reset Passcode

Reset passcode dilakukan dari dialog tersendiri:

```text
Reset Passcode Budi Santoso

Passcode sementara
[_] [_] [_] [_] [_] [_]

Konfirmasi passcode
[_] [_] [_] [_] [_] [_]

[Batal] [Reset Passcode]
```

Setelah reset:

- Hash baru disimpan.
- `must_change_passcode` menjadi `true`.
- `failed_attempts` menjadi nol.
- `locked_until` menjadi null.

## 19. Ganti Passcode Sendiri

Halaman Keamanan harus berubah menjadi halaman akun pribadi.

Setiap pengguna dapat:

- Memasukkan passcode saat ini.
- Memasukkan passcode baru 6 digit.
- Mengonfirmasi passcode baru.

Admin tidak lagi mengganti passcode bersama pada `pam_app_settings`.

Jika `must_change_passcode = true`, pengguna harus diarahkan ke halaman ini sebelum mengakses fitur lain.

## 20. Menu dan Navigasi Berbasis Role

Menu Lainnya:

- `Admin & Pegawai` hanya tampil untuk admin.
- `Profil Alira` hanya tampil untuk admin.
- `Tarif` hanya tampil untuk admin.
- `Quick Action` hanya tampil untuk admin.
- `Keamanan` tampil untuk semua pengguna sebagai pengaturan akun pribadi.
- `Pengeluaran`, `Pembayaran`, dan `Laporan` tampil untuk admin dan bendahara.

Quick Action:

- Filter daftar berdasarkan role saat dashboard dirender.
- Konfigurasi yang tidak diizinkan tidak boleh ditampilkan.
- Link manual tetap harus dilindungi di page dan server action.

## 21. Pencatatan Identitas Petugas

Gunakan `session.userId` untuk mengisi:

```text
pam_meter_readings.recorded_by
pam_payments.received_by
pam_expenses.created_by
```

Perubahan action:

```ts
const session = await requireRole([...]);

recorded_by: session.userId
received_by: session.userId
created_by: session.userId
```

Jangan menerima ID petugas dari hidden input karena dapat dimanipulasi client.

## 22. Tampilan Aktivitas

Aktivitas dapat menampilkan petugas:

```text
Budi Santoso
Mencatat meter PAM-000123
```

atau:

```text
Pembayaran Ibu Siti - Rp125.000
Dicatat oleh Dewi
```

Untuk MVP, nama petugas cukup ditampilkan pada halaman detail atau aktivitas terbaru. Audit log lengkap dapat dibuat pada fase berikutnya.

## 23. Audit Log Lanjutan

Fase lanjutan dapat menambahkan tabel:

```sql
create table public.pam_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.pam_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

Contoh event:

- `staff.created`
- `staff.role_changed`
- `staff.deactivated`
- `staff.passcode_reset`
- `payment.created`
- `expense.created`
- `reading.updated`

Audit log belum wajib pada MVP jika kolom petugas transaksi sudah diisi.

## 24. Perubahan Halaman Akun

Route `/more/account` sebaiknya menampilkan:

- Nama pengguna.
- Username.
- Role.
- Tombol Ganti Passcode.
- Tombol Keluar.

Logout tetap membutuhkan dialog konfirmasi.

## 25. Keamanan

- Passcode selalu disimpan sebagai hash.
- Hash tidak pernah dikirim ke browser.
- Username dinormalisasi sebelum query.
- Gunakan pesan login generik.
- Terapkan temporary lock setelah percobaan gagal.
- Session pengguna nonaktif harus langsung ditolak.
- Setiap server action harus memeriksa role.
- Jangan mempercayai role atau user ID dari FormData.
- Reset passcode harus memutus session aktif pengguna pada fase lanjutan.

## 26. Performa

- Index `lower(username)` untuk login.
- Index `(status, role)` untuk daftar pegawai.
- Query profil session berdasarkan primary key.
- Gunakan React `cache()` untuk profil session dalam satu request.
- Jangan query profil ulang pada setiap card.
- Ambil nama petugas melalui relation/join, bukan query per transaksi.

## 27. Urutan Implementasi

### Fase 1 - Database dan Auth

1. Tambahkan migration profil akun.
2. Migrasikan admin lama.
3. Tambahkan type role dan profil.
4. Ubah login menjadi username dan passcode.
5. Ubah session menjadi ID profil sebenarnya.
6. Tambahkan lock percobaan login.

### Fase 2 - Authorization

1. Tambahkan `requireRole()`.
2. Lindungi page berdasarkan role.
3. Lindungi server action berdasarkan role.
4. Filter menu dan Quick Action.

### Fase 3 - Pengelolaan Pegawai

1. Tambahkan data layer pegawai.
2. Tambahkan halaman `/more/staff`.
3. Tambahkan form tambah/edit.
4. Tambahkan aktif/nonaktif akun.
5. Tambahkan reset passcode.
6. Tambahkan unlock akun.

### Fase 4 - Identitas Transaksi

1. Isi `recorded_by` pada meter.
2. Isi `received_by` pada pembayaran.
3. Isi `created_by` pada pengeluaran.
4. Tampilkan nama petugas pada aktivitas atau detail.

### Fase 5 - Verifikasi dan Rollout

1. Uji migrasi admin lama.
2. Uji setiap role.
3. Uji akses URL langsung.
4. Uji server action tanpa izin.
5. Uji akun nonaktif dan terkunci.
6. Uji admin terakhir tidak dapat dinonaktifkan.
7. Jalankan lint dan build.
8. Deploy dan verifikasi login admin.

## 28. Acceptance Criteria

Fitur dianggap selesai jika:

- Admin lama tetap dapat masuk setelah migration.
- Setiap pengguna login dengan username dan passcode sendiri.
- Akun nonaktif tidak dapat login.
- Akun terkunci tidak dapat login sebelum waktunya.
- Admin dapat menambah pegawai.
- Admin dapat mengubah nama, username, dan role.
- Admin dapat mereset passcode pegawai.
- Admin dapat mengaktifkan dan menonaktifkan pegawai.
- Admin tidak dapat menonaktifkan dirinya sendiri.
- Admin terakhir tidak dapat dinonaktifkan atau diturunkan rolenya.
- Bendahara tidak dapat membuka pengaturan admin.
- Petugas meter tidak dapat mencatat pembayaran atau pengeluaran.
- URL langsung tetap ditolak jika role tidak sesuai.
- Server action tetap ditolak meskipun dipanggil langsung.
- Pencatatan meter menyimpan petugas.
- Pembayaran menyimpan penerima pembayaran.
- Pengeluaran menyimpan pembuat transaksi.
- Menu dan Quick Action menyesuaikan role.
- Lint dan production build berhasil.

## 29. Risiko dan Mitigasi

### Admin terkunci setelah migration

Mitigasi: buat akun admin dari hash passcode lama sebelum login baru diaktifkan.

### Semua admin dinonaktifkan

Mitigasi: larang menonaktifkan atau menurunkan role admin aktif terakhir.

### Pegawai berbagi passcode

Mitigasi: akun individual, passcode sementara, dan kewajiban mengganti passcode.

### Brute force passcode 6 digit

Mitigasi: batas percobaan, temporary lock, dan audit login gagal.

### Authorization hanya di UI

Mitigasi: pemeriksaan role wajib pada page, data layer, dan server action.

### Histori kehilangan nama pegawai

Mitigasi: akun dinonaktifkan, bukan dihapus permanen.

## 30. Pengembangan Lanjutan

Setelah MVP stabil:

- Audit log lengkap.
- Session management dan logout semua perangkat.
- Undangan akun melalui email atau WhatsApp.
- Foto profil.
- Jadwal kerja petugas.
- Approval pengeluaran oleh admin.
- Permission custom per pengguna.
- Autentikasi dua faktor untuk admin.
