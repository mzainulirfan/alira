# Plan Fitur Scan QR Pencatatan Meter Alira

## 1. Latar Belakang

Pencatatan meter saat ini dilakukan dengan memilih pelanggan dari daftar. Pada kondisi lapangan, petugas dapat membuka pelanggan yang salah lalu memasukkan angka meter milik pelanggan lain.

Fitur scan QR ditambahkan untuk memperkecil risiko tersebut. Setiap pelanggan memiliki QR Alira yang ditempel di meter atau lokasi pelanggan. Petugas memindai QR sebelum membuka form pencatatan.

Scan tidak langsung menyimpan pencatatan. Identitas pelanggan dan angka meter tetap harus dikonfirmasi oleh petugas.

## 2. Tujuan

- Mengurangi kesalahan pemilihan pelanggan.
- Mempercepat pencarian pelanggan di lapangan.
- Memastikan form meter dibuka dari identitas yang tepat.
- Tetap menyediakan fallback ketika kamera atau QR tidak dapat digunakan.
- Mendukung penggunaan melalui PWA pada Android dan iPhone.

## 3. Batasan MVP

Fitur MVP mencakup:

- QR dibuat oleh sistem Alira.
- QR menggunakan nomor pelanggan yang sudah tersedia.
- Scan melalui kamera belakang perangkat.
- Konfirmasi identitas sebelum form meter dibuka.
- Cetak QR satu pelanggan.
- Cetak QR massal untuk Admin.
- Input kode manual sebagai fallback.

Fitur MVP tidak mencakup:

- NFC.
- GPS pelanggan.
- Pengenalan angka meter dari foto.
- Scan tanpa login.
- Perubahan otomatis data pelanggan dari isi QR.
- Sinkronisasi dengan barcode produsen meter.

## 4. Sumber Nomor QR

Gunakan `pam_customers.customer_number` sebagai identitas QR.

Contoh:

```text
PAM-000123
```

Nomor pelanggan sudah:

- Dibuat otomatis oleh sistem.
- Unik di database.
- Ditampilkan pada card dan detail pelanggan.
- Tidak dapat diubah melalui UI saat ini.

Jangan menggunakan `meter_number` sebagai identitas utama karena dapat kosong, berubah ketika meter diganti, atau belum dijamin unique.

Tidak diperlukan migration database baru selama `customer_number` tetap immutable.

## 5. Format Payload QR

Gunakan payload teks dengan namespace dan versi:

```text
ALIRA|v1|PAM-000123
```

Struktur:

```text
ALIRA | versi | nomor_pelanggan
```

Alasan tidak menggunakan URL langsung:

- Tidak bergantung pada domain deployment.
- Tetap dapat dipindai ketika domain berubah.
- Lebih mudah divalidasi.
- Dapat diproses pada mode PWA.

Parser hanya menerima format exact:

```regex
^ALIRA\|v1\|PAM-\d{6}$
```

Nomor pelanggan tetap divalidasi lagi di server. Regex bukan pengganti pemeriksaan database.

## 6. Keamanan

QR hanya berfungsi sebagai identifier, bukan credential.

QR tidak boleh memuat:

- Passcode.
- Session token.
- Nomor telepon.
- Alamat.
- UUID internal jika tidak diperlukan.
- Informasi tagihan.

Aturan keamanan:

- Pengguna harus login sebelum menggunakan scanner.
- Server tetap memeriksa role untuk pencatatan meter.
- Hasil scan tidak boleh dipercaya langsung oleh client.
- Nomor pelanggan harus dicari dengan exact match di server/data layer.
- Scan tidak boleh langsung membuat atau mengubah pencatatan.
- Petugas meter hanya dapat menjalankan action sesuai `METER_ROLES`.

## 7. Role dan Hak Akses

| Fitur | Admin | Bendahara | Petugas Meter |
| --- | --- | --- | --- |
| Scan QR | Ya | Lihat hasil | Ya |
| Membuka form pencatatan dari scan | Ya | Tidak | Ya |
| Cetak QR satu pelanggan | Ya | Tidak | Lihat opsional |
| Cetak QR massal | Ya | Tidak | Tidak |

Bendahara dapat diarahkan ke Detail Pelanggan jika memindai kode, tetapi tidak boleh membuka mutation form pencatatan.

## 8. Alur Utama Scan

```text
Buka Pencatatan Meter
        ↓
Tekan Scan Kode
        ↓
Izinkan kamera
        ↓
Scan QR di meter pelanggan
        ↓
Parse dan validasi payload
        ↓
Cari pelanggan exact match
        ↓
Tampilkan konfirmasi identitas
        ↓
Tekan Catat Meter
        ↓
Buka form pencatatan
        ↓
Konfirmasi pencatatan sebelum simpan
```

## 9. Konfirmasi Identitas Hasil Scan

Setelah QR berhasil dibaca, scanner harus berhenti sementara dan menampilkan:

```text
Pelanggan Ditemukan

Siti Aminah
PAM-000123
Meter MTR-0087
Dusun Sukamaju

[ Scan Ulang ] [ Catat Meter ]
```

Informasi minimum:

- Nama pelanggan.
- Nomor pelanggan.
- Nomor meter.
- Alamat singkat jika tersedia.
- Status pelanggan.
- Status pencatatan untuk periode aktif.

Jangan membuka form secara otomatis segera setelah kamera membaca kode. Konfirmasi identitas merupakan kontrol pencegahan kesalahan.

## 10. Kondisi Hasil Scan

### Pelanggan Aktif dan Belum Dicatat

Tampilkan CTA `Catat Meter`.

### Pelanggan Sudah Dicatat

Tampilkan:

```text
Meter periode Agustus 2026 sudah dicatat.
```

CTA:

- `Lihat Pencatatan`.
- `Ubah` jika role dan status tagihan mengizinkan.

### Tagihan Sudah Dibayar

Pencatatan dikunci. Tampilkan:

```text
Pencatatan tidak dapat direvisi karena tagihan sudah dibayar.
```

### Pelanggan Nonaktif

Jangan membuka form. Tampilkan status nonaktif dan link Detail Pelanggan untuk Admin.

### Kode Tidak Dikenali

Tampilkan pesan generik:

```text
Kode bukan QR Alira atau formatnya tidak valid.
```

### Pelanggan Tidak Ditemukan

Tampilkan:

```text
Pelanggan dari kode ini tidak ditemukan.
```

Sediakan `Scan Ulang` dan input kode manual.

## 11. UI Halaman Pencatatan Meter

Tambahkan tombol pada header atau filter bar:

```text
[ Scan Kode ]
```

Prioritas mobile:

- Tombol mudah dijangkau ibu jari.
- Tidak menggeser filter periode dan status secara berlebihan.
- Scanner menggunakan dialog atau sheet hampir penuh.
- Preview kamera memiliki frame scan yang jelas.
- Terdapat tombol flash jika perangkat mendukung.
- Terdapat tombol tutup dan input manual.

Desktop tetap dapat membuka scanner jika perangkat memiliki kamera.

## 12. Komponen Scanner

Komponen yang disarankan:

```text
components/meter-readings/qr-scanner.tsx
```

Tanggung jawab:

- Meminta izin kamera saat dialog dibuka.
- Memilih kamera belakang dengan `facingMode: environment`.
- Memulai dan menghentikan stream.
- Membaca QR.
- Mencegah scan berulang dalam waktu singkat.
- Menghentikan kamera setelah hasil valid ditemukan.
- Membersihkan stream saat dialog ditutup atau component unmount.
- Menampilkan error izin/perangkat.

Gunakan library lintas browser seperti:

```text
@zxing/browser
```

Jangan hanya bergantung pada `BarcodeDetector` karena dukungan browser, terutama Safari/iPhone, dapat berbeda.

Library harus dibundel dalam aplikasi agar scanner tetap tersedia setelah aset PWA tersimpan.

## 13. Resolusi Hasil Scan

Tambahkan data function server-only:

```text
getCustomerByScanCode(customerNumber, period)
```

Data yang dikembalikan:

```ts
type ScannedCustomer = {
  customer: Customer;
  reading: MeterReading | null;
  billStatus: Bill["status"] | null;
};
```

Pencarian harus menggunakan exact match:

```ts
.eq("customer_number", customerNumber)
```

Jangan menggunakan pencarian `ilike` untuk hasil scan.

Pilihan implementasi komunikasi client-server:

- Server action untuk resolve kode.
- Route handler internal yang memeriksa session dan role.

Untuk pola project saat ini, server action lebih sederhana selama return value hanya berisi data pelanggan yang aman ditampilkan.

## 14. Membuka Form Meter

Setelah pengguna menekan `Catat Meter`, gunakan mekanisme event yang sudah digunakan Reading Form:

```text
alira:open-reading
```

Jika pelanggan tidak sedang dirender karena filter/search:

1. Navigasikan halaman ke periode terkait.
2. Hapus search yang menghalangi.
3. Pastikan card pelanggan dirender.
4. Baru dispatch event pembuka form.

Alternatif yang lebih stabil adalah memindahkan Reading Form hasil scan ke dalam scanner result dialog sehingga tidak bergantung pada card yang sedang dirender.

Rekomendasi MVP: gunakan result dialog yang memiliki trigger langsung ke Reading Form agar scan tetap bekerja walaupun filter aktif.

## 15. Generator QR Pelanggan

Tambahkan aksi pada Detail Pelanggan:

```text
[ Lihat QR ]
```

Dialog QR menampilkan:

- QR berukuran cukup besar.
- Nama pelanggan.
- Nomor pelanggan.
- Nomor meter.
- Tombol Cetak.
- Tombol Unduh PNG/SVG opsional.

Gunakan generator QR berbasis SVG agar hasil cetak tetap tajam.

Nama file:

```text
qr-PAM-000123.svg
```

## 16. Cetak Label Massal

Tambahkan route Admin:

```text
/more/customer-qr
```

Fitur:

- Pilih pelanggan aktif.
- Cari nama atau nomor pelanggan.
- Pilih semua pelanggan aktif.
- Preview label.
- Cetak melalui browser.

Contoh label:

```text
┌────────────────────┐
│       [ QR ]       │
│                    │
│ Siti Aminah        │
│ PAM-000123         │
│ Meter MTR-0087     │
│ Scan dengan Alira  │
└────────────────────┘
```

CSS print harus:

- Menyembunyikan sidebar, header, dan bottom navigation.
- Menjaga QR tidak terpotong antarhalaman.
- Mendukung ukuran label yang disepakati.
- Menggunakan warna hitam-putih dengan kontras tinggi.

## 17. Input Manual

Jika kamera ditolak atau rusak, tampilkan field:

```text
Masukkan nomor pelanggan
[ PAM-000123 ] [ Cari ]
```

Input manual melalui resolver dan konfirmasi identitas yang sama. Input manual tidak boleh melewati tahap konfirmasi.

## 18. Penanganan Kamera

### Izin Ditolak

Tampilkan instruksi singkat untuk mengaktifkan izin kamera pada browser.

### Tidak Ada Kamera

Langsung tampilkan input manual.

### Kamera Digunakan Aplikasi Lain

Tampilkan error dan tombol `Coba Lagi`.

### QR Sulit Dibaca

Sediakan:

- Instruksi jarak scan.
- Frame scan.
- Tombol flash jika tersedia.
- Input manual.

### Dialog Ditutup

Semua track kamera wajib dihentikan:

```ts
stream.getTracks().forEach((track) => track.stop());
```

## 19. Pencegahan Scan Ganda

Scanner dapat membaca QR yang sama berkali-kali dalam beberapa frame.

Aturan:

- Abaikan hasil setelah scan valid pertama.
- Hentikan scanner selama result dialog tampil.
- Terapkan cooldown jika pengguna memilih `Scan Ulang`.
- Jangan membuka beberapa form sekaligus.

## 20. Offline dan PWA

Kamera dan decoder dapat bekerja tanpa jaringan jika aset aplikasi sudah tersimpan, tetapi pencarian pelanggan tetap membutuhkan data.

MVP:

- Tampilkan pesan ketika resolve pelanggan gagal karena offline.
- Jangan menyimpan pencatatan offline secara otomatis.
- Sediakan retry setelah koneksi tersedia.

Fase lanjutan dapat menyimpan index pelanggan aktif dan antrean pencatatan secara offline, tetapi membutuhkan strategi konflik dan sinkronisasi yang terpisah.

## 21. Aksesibilitas

- Tombol scan memiliki label `Scan QR pelanggan`.
- Dialog memiliki judul dan deskripsi.
- Status scanner tidak hanya disampaikan melalui warna.
- Hasil scan diumumkan melalui live region.
- Semua tindakan dapat diakses keyboard.
- Input manual selalu tersedia.
- Tombol tutup scanner memiliki label yang jelas.

## 22. Telemetri Minimal

Tidak perlu menyimpan isi kamera atau gambar QR.

Jika audit dibutuhkan, simpan event minimal:

- Scan berhasil.
- Kode tidak valid.
- Pelanggan tidak ditemukan.
- Form dibuka dari scan.

Jangan menyimpan frame kamera.

## 23. Tahapan Implementasi

### Fase 1 - Kontrak QR

1. Tetapkan payload `ALIRA|v1|customer_number`.
2. Tambahkan parser dan validator.
3. Tambahkan test payload valid/tidak valid.

### Fase 2 - Generator dan Cetak

1. Tambahkan dependency generator QR.
2. Tambahkan QR pada Detail Pelanggan.
3. Tambahkan mode cetak satu QR.
4. Tambahkan halaman cetak QR massal khusus Admin.

### Fase 3 - Scanner

1. Tambahkan dependency scanner lintas browser.
2. Implementasikan lifecycle kamera.
3. Tambahkan tombol Scan Kode.
4. Tambahkan input manual.
5. Tambahkan parse dan error state.

### Fase 4 - Resolve dan Integrasi Meter

1. Tambahkan resolver server-side.
2. Tampilkan konfirmasi identitas.
3. Hubungkan hasil ke Reading Form.
4. Tangani sudah dicatat, terkunci, dan nonaktif.
5. Pastikan role authorization tetap berlaku.

### Fase 5 - Verifikasi

1. Uji Android Chrome.
2. Uji iPhone Safari/PWA.
3. Uji kamera belakang dan depan.
4. Uji izin kamera ditolak.
5. Uji QR tidak valid.
6. Uji pelanggan tidak ditemukan.
7. Uji scan berulang.
8. Uji input manual.
9. Uji print satu dan massal.
10. Jalankan lint dan production build.

## 24. Acceptance Criteria

Fitur dianggap selesai jika:

- Sistem dapat menghasilkan QR untuk setiap pelanggan.
- QR menggunakan `customer_number` dengan format versioned.
- QR dapat dicetak dan tetap terbaca.
- Petugas dapat membuka scanner dari Pencatatan Meter.
- Kamera berhenti ketika modal ditutup.
- Scan valid menemukan pelanggan dengan exact match.
- Identitas pelanggan tampil sebelum form dibuka.
- Kode tidak valid tidak membuka form.
- Pelanggan nonaktif tidak dapat dicatat.
- Pencatatan yang sudah dibayar tetap terkunci.
- Scan tidak melewati server authorization.
- Input manual tersedia.
- Scanner bekerja pada Android dan iPhone target.
- Tidak ada data kamera yang disimpan.
- Lint dan production build berhasil.

## 25. Risiko dan Mitigasi

### QR Tertukar Saat Pemasangan

Mitigasi:

- Label menampilkan nama dan nomor pelanggan.
- Petugas pemasangan memverifikasi Detail Pelanggan.
- Form tetap memiliki konfirmasi identitas.

### Label Rusak atau Pudar

Mitigasi:

- Gunakan kontras hitam-putih.
- Cetak nomor pelanggan dalam teks.
- Sediakan cetak ulang dan input manual.

### Customer Number Berubah

Mitigasi:

- Perlakukan `customer_number` sebagai immutable.
- Jika perubahan nomor pelanggan dibutuhkan pada masa depan, tambahkan `scan_code` dedicated dan redirect kode lama.

### Dukungan Kamera Berbeda

Mitigasi:

- Gunakan library lintas browser.
- Uji pada perangkat nyata.
- Selalu sediakan input manual.

### Scan Membuka Pelanggan yang Salah

Mitigasi:

- Exact match.
- Namespace dan versi payload.
- Konfirmasi nama, nomor pelanggan, nomor meter, dan alamat.
- Tidak ada autosave setelah scan.

## 26. Keputusan MVP

Keputusan yang direkomendasikan:

- Jenis kode: QR Code.
- Sumber kode: `customer_number`.
- Payload: `ALIRA|v1|PAM-000123`.
- Penyimpanan kode baru: tidak diperlukan.
- Posisi label: meter atau lokasi pelanggan.
- Scanner: library lintas browser.
- Fallback: input nomor pelanggan manual.
- Hasil scan: konfirmasi identitas, bukan autosave.
- Cetak massal: hanya Admin.

Jika meter yang digunakan sudah memiliki barcode produsen dan barcode tersebut ingin dipakai, buat fase terpisah untuk registrasi barcode ke pelanggan. Jangan mencampurkan barcode produsen dengan QR Alira pada MVP pertama.
