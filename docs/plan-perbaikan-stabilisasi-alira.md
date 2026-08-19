# Rencana Perbaikan & Stabilisasi Alira

Dokumen ini memecah perbaikan hasil audit awal aplikasi ke dalam fase yang
berurutan. Prioritasnya adalah melindungi data sensitif, mengembalikan build
produksi, lalu memastikan kualitas kode dan alur utama tetap berjalan.

## Prinsip Pelaksanaan

- Jangan menimpa perubahan lokal pengguna yang sudah ada.
- Perbaikan keamanan dan kegagalan build didahulukan dari perapian kode.
- Setiap fase diverifikasi sebelum melanjutkan ke fase berikutnya.
- Perubahan pada autentikasi dan transaksi harus diuji terhadap role yang
  relevan: admin, bendahara, petugas meter, dan pelanggan.

## Fase 0 — Baseline & Perlindungan Perubahan Lokal

### Tujuan

Memastikan pekerjaan yang sudah ada di working tree teridentifikasi dan tidak
tertimpa oleh perbaikan.

### Ruang lingkup

- Catat perubahan lokal pada `app/customer/profile/ProfileContent.tsx`,
  `package.json`, dan `package-lock.json`.
- Bandingkan perubahan tersebut dengan kebutuhan perbaikan build agar edit
  hanya menyentuh bagian yang diperlukan.
- Hindari perubahan mekanis yang tidak terkait dengan temuan audit.

### Kriteria selesai

- Setiap file yang diedit memiliki alasan yang jelas dan terkait langsung
  dengan fase aktif.
- Tidak ada perubahan lokal pengguna yang dihapus atau dikembalikan.

## Fase 1 — Keamanan Autentikasi Pelanggan

### Tujuan

Menghilangkan kebocoran data kredensial dan menjadikan pencatatan percobaan
login konsisten dengan skema database.

### Ruang lingkup

- Hapus seluruh `console.log` atau `console.error` yang dapat memuat passcode,
  hash, token, atau detail sesi pelanggan.
- Pertahankan pesan kesalahan login yang generik agar tidak membantu enumerasi
  akun secara berlebihan.
- Perbaiki fungsi audit login gagal: skema saat ini mensyaratkan
  `pam_customer_login_logs.customer_id` tidak boleh kosong, sementara percobaan
  untuk nomor pelanggan yang tidak ditemukan menggunakan nilai kosong.
- Tentukan pendekatan yang konsisten: hanya catat percobaan ketika pelanggan
  teridentifikasi, atau sesuaikan skema log secara eksplisit bila audit untuk
  nomor yang tidak ditemukan memang dibutuhkan.
- Pastikan pergantian passcode dan pembaruan `session_epoch` tetap membatalkan
  sesi lama.

### Kriteria selesai

- Tidak ada passcode atau data sesi sensitif di output log aplikasi.
- Login pelanggan gagal dan berhasil tidak menghasilkan error database yang
  diabaikan.
- Lockout setelah lima percobaan gagal dan login setelah masa lockout tetap
  berfungsi.

## Fase 2 — Pemulihan Build Produksi

### Tujuan

Membuat `next build` kembali berhasil tanpa mengubah perilaku halaman profil
pelanggan.

### Ruang lingkup

- Perbaiki penggunaan ikon Hugeicons pada
  `app/customer/profile/ProfileContent.tsx`. Objek ikon harus dirender melalui
  komponen `HugeiconsIcon`, bukan dipakai langsung sebagai elemen JSX.
- Perbaiki typing yang memicu error ESLint `no-explicit-any` pada halaman profil.
- Pastikan halaman tetap responsif dan seluruh informasi profil tetap tampil.

### Kriteria selesai

- `npm.cmd run build` selesai dengan status sukses.
- TypeScript tidak lagi melaporkan ikon sebagai elemen JSX yang tidak valid.
- Halaman profil pelanggan dapat dirender tanpa kesalahan runtime.

## Fase 3 — Kebersihan Lint & Konsistensi Kode

### Tujuan

Menghilangkan error lint dan peringatan yang relevan agar hasil pemeriksaan
kualitas kode bersih.

### Ruang lingkup

- Hapus atau gunakan import, tipe, dan handler yang tidak dipakai di portal
  pelanggan.
- Rapikan komponen tabel tagihan dan meter agar handler pagination hanya ada
  jika memang dipakai.
- Hapus sisa kode eksperimen atau implementasi setengah jadi, tanpa mengubah
  UI maupun kontrak API.

### Kriteria selesai

- `npm.cmd run lint` selesai tanpa error dan tanpa peringatan.
- Tidak ada penghapusan fitur yang disengaja saat merapikan kode.

## Fase 4 — Verifikasi Alur & Regresi

### Tujuan

Memastikan perbaikan tidak merusak fungsi operasional utama.

### Skenario verifikasi

1. Login staf dengan role admin, bendahara, dan petugas meter; pastikan menu
   serta otorisasi sesuai role.
2. Login pelanggan, termasuk passcode salah, lockout, login berhasil, dan ganti
   passcode.
3. Lihat profil pelanggan, tagihan, dan riwayat meter melalui portal pelanggan.
4. Catat meter, revisi atau batalkan pencatatan yang belum dibayar, lalu
   pastikan tagihan terkait tetap konsisten.
5. Buat tagihan dan catat pembayaran untuk memeriksa alur finansial utama.
6. Jalankan `npm.cmd run lint` dan `npm.cmd run build` sebagai pemeriksaan akhir.

### Kriteria selesai

- Semua pemeriksaan otomatis berhasil.
- Tidak ada kredensial yang keluar ke log.
- Alur staf dan portal pelanggan yang terdampak dapat digunakan kembali.

## Urutan Eksekusi

```text
Fase 0: Lindungi perubahan lokal
   ↓
Fase 1: Keamanan autentikasi pelanggan
   ↓
Fase 2: Build produksi dan TypeScript
   ↓
Fase 3: Lint dan perapian kode
   ↓
Fase 4: Verifikasi regresi
```

## Definisi Selesai

Rencana dianggap selesai apabila Fase 1–4 memenuhi seluruh kriteria selesai,
working tree pengguna tetap terjaga, dan lint serta build produksi berhasil.
