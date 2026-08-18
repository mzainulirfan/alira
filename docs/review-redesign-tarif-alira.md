# Review & Redesign Plan — Halaman Tarif Alira

## 1. Ringkasan

Halaman **Tarif** saat ini sudah memiliki fondasi yang benar untuk MVP:

- Kelola tarif air dan abonemen.
- Ada satu tarif aktif yang dipakai saat generate tagihan.
- Form tambah/edit tarif lengkap dengan validasi.
- Pola konfirmasi "perubahan belum disimpan" sudah diterapkan.
- Aksi edit / aktif-nonaktif / hapus tersedia.

Masalah utamanya bukan fitur, tetapi **hierarki informasi dan keamanan aksi**:

```text
Tarif aktif = elemen paling penting, tapi tampil sama mencoloknya dengan tarif lain
Aksi hapus tidak ada konfirmasi → berisiko salah hapus
Label aksi hanya icon tanpa teks → kurang jelas
Tidak terlihat sekilas tarif mana yang dipakai untuk tagihan bulan ini
```

Arah redesign:

> **Tarif adalah pengaturan yang menentukan nilai tagihan. Halaman harus membuat tarif aktif terlihat jelas, aksi berbahaya terlindungi, dan daftar mudah dibaca sekilas.**

---

## 2. Review UI Saat Ini

## 2.1 Yang Sudah Baik

### Header sudah konsisten

```text
Lainnya
Tarif
Kelola tarif air dan abonemen.
```

menggunakan `SubPageHeader` yang sama dengan halaman pengaturan lain. Sudah tepat.

---

### Form tarif lengkap dan tervalidasi

Form tambah/edit berisi:

- Nama tarif.
- Tarif per m³.
- Abonemen.
- Tanggal berlaku.
- Checkbox "Jadikan tarif aktif".

Dengan validasi inline per field (`aria-invalid`, pesan di bawah input) dan pola konfirmasi saat menutup form yang belum disimpan. Ini sudah sesuai arah desain Alira.

---

### Satu tarif aktif

Sistem memastikan hanya satu tarif aktif (`saveTariffAction` menonaktifkan yang lain saat satu diaktifkan). Fondasi bisnis sudah benar.

---

### Badge Aktif

Tarif yang sedang aktif ditandai badge `Aktif`. Sudah ada, tetapi visualnya belum cukup menonjol.

---

## 3. Masalah UI/UX Utama

### 3.1 Tarif Aktif Tidak Cukup Menonjol

Tarif aktif adalah satu-satunya yang menentukan nilai tagihan. Namun saat ini hanya dibedakan dengan badge kecil `Aktif` di samping nama.

Akibatnya pengguna sulit menjawab dengan cepat:

```text
Tarif mana yang sekarang dipakai untuk generate tagihan?
```

### Rekomendasi

Tarif aktif di-pin di paling atas dan diberi perlakuan visual berbeda:

```text
┌───────────────────────────────────────┐
│ ✓ Tarif Aktif                         │
│                                       │
│ Tarif Reguler                    Aktif│
│                                       │
│ Tarif Air         Rp3.000 / m³        │
│ Abonemen          Rp10.000            │
│ Berlaku           1 Agustus 2026      │
│                                       │
│   [Edit]                    [Nonaktifkan] │
└───────────────────────────────────────┘
```

- Border/tint success atau primary.
- Label section `Tarif Aktif` di atas card.
- Nominal tarif per m³ ditampilkan lebih besar.

---

### 3.2 Tidak Ada Ringkasan "Tarif yang Dipakai"

Halaman tidak menjelaskan dampak tarif terhadap tagihan. Pengguna harus menebak bahwa tarif aktif dipakai saat generate.

### Rekomendasi

Tambahkan baris kecil di bagian atas (hanya saat ada tarif aktif):

```text
Tarif aktif: Tarif Reguler · Rp3.000/m³ + abonemen Rp10.000
```

dengan link ke halaman tarif (jika dilihat dari tempat lain) atau langsung ditampilkan sebagai konteks halaman.

---

### 3.3 Aksi Hapus Tanpa Konfirmasi

`DeleteTariff` langsung menghapus tanpa dialog konfirmasi. Jika salah tap, data hilang permanen tanpa pemulihan.

Ini melanggar pola keamanan yang sudah diterapkan di form lain (konfirmasi destruktif).

### Rekomendasi

Gunakan dialog konfirmasi:

```text
Hapus tarif "Tarif Reguler"?

Tarif tidak dapat dikembalikan setelah dihapus.

[ Batal ]  [ Hapus Tarif ]
```

Tombol konfirmasi menggunakan variant `destructive`.

---

### 3.4 Aksi Hanya Icon, Kurang Jelas

Tiga tombol icon (`Edit01Icon`, `Tick02Icon`, `Delete01Icon`) berjejal di kanan atas tanpa teks. `Tick02Icon` untuk toggle aktif/nonaktif terlihat ambigu (terkesan "centang selesai").

### Rekomendasi

Tampilkan aksi dengan teks pendek atau icon + teks:

```text
[Edit]  [Nonaktifkan / Aktifkan]  [Hapus]
```

Untuk tarif aktif, aksi toggle berubah menjadi **Nonaktifkan**; untuk tarif nonaktif menjadi **Aktifkan**.

Gunakan `Button variant="ghost"` dengan ukuran `sm`, atau tempatkan aksi di bagian bawah card agar tidak berdesakan.

---

### 3.5 Card Terlalu Rapat

Saat ini nama + badge + tiga icon aksi sejajar dalam satu baris, lalu detail di baris berikutnya. Pada layar 360–430px, baris aksi menjadi sempit.

### Rekomendasi

Struktur card lebih teratur:

```text
┌────────────────────────────────┐
│ Tarif Reguler             Aktif │
│                                │
│ Tarif Air        Rp3.000 / m³  │
│ Abonemen         Rp10.000      │
│ Berlaku          1 Agustus 2026│
│                                │
│ [Edit]        [Aktifkan/Nonaktifkan] │
└────────────────────────────────┘
```

Detail harga memakai label-atas seperti pola `InfoRow` di halaman lain.

---

### 3.6 Empty State Kurang Informatif

Saat belum ada tarif:

```text
Belum ada tarif. Tambahkan tarif pertama untuk membuat tagihan.
```

tidak ada icon, tidak ada CTA, dan tidak menjelaskan konsekuensi (tanpa tarif aktif, generate tagihan gagal).

### Rekomendasi

Empty state dengan icon + CTA:

```text
┌────────────────────────────────┐
│           (icon tarif)          │
│                                 │
│ Belum ada tarif                 │
│ Tambahkan tarif pertama agar    │
│ tagihan dapat dibuat.           │
│                                 │
│       [ Tambah Tarif ]          │
└────────────────────────────────┘
```

---

### 3.7 Tidak Ada Peringatan Saat Tarif Nonaktif

Tanpa tarif aktif, generate tagihan akan gagal ("Belum ada tarif aktif"). Halaman tarif tidak menampilkan warning ini.

### Rekomendasi

Saat `getActiveTariff()` mengembalikan `null`, tampilkan banner warning di atas daftar:

```text
⚠ Belum ada tarif aktif.
Aktifkan satu tarif agar tagihan dapat dibuat.

[ Aktifkan Tarif ]
```

---

### 3.8 Urutan Daftar Kurang Bermakna

Daftar diurutkan `created_at` descending, sehingga tarif aktif yang mungkin dibuat lebih lama bisa berada di bawah.

### Rekomendasi

Urutan:

```text
Tarif aktif (paling atas)
↓
Tarif nonaktif (oleh effective_date / created_at)
```

---

## 4. Rekomendasi Card — Tarif Aktif

```text
┌───────────────────────────────────┐
│ Tarif Reguler                Aktif│
│                                  │
│ Tarif Air        Rp3.000 / m³    │
│ Abonemen         Rp10.000        │
│ Berlaku          1 Agustus 2026  │
│                                  │
│ [Edit]                [Nonaktifkan] │
└───────────────────────────────────┘
```

- Badge `Aktif` menggunakan variant `success`.
- Card border `border-success/30` + tint `bg-success/5` (ringan, bukan blok penuh).
- Icon centang kecil di samping badge.

---

## 5. Rekomendasi Card — Tarif Nonaktif

```text
┌───────────────────────────────────┐
│ Tarif Lama                   Nonaktif│
│                                  │
│ Tarif Air        Rp2.500 / m³    │
│ Abonemen         Rp8.000         │
│ Berlaku          1 Januari 2026  │
│                                  │
│ [Edit]                 [Aktifkan] │
└───────────────────────────────────┘
```

- Badge `Nonaktif` variant `secondary`.
- Card tanpa tint / border default.
- Aksi utama yang disarankan adalah **Aktifkan** (jika hanya ada satu tarif).

---

## 6. Toggle Aktif/Nonaktif yang Lebih Jelas

### Saat Tarif Nonaktif

Tombol:

```text
[ Aktifkan ]
```

menjadi primary action jika tidak ada tarif aktif lain; menjadi outline jika sudah ada tarif aktif (perlu konfirmasi penggantian).

### Saat Tarif Aktif

Tombol:

```text
[ Nonaktifkan ]
```

dengan variant outline/ghost.

### Pertimbangan Konfirmasi

Mengaktifkan tarif baru akan **mengganti** tarif aktif sebelumnya. Ini berdampak pada nilai tagihan periode berikutnya. Gunakan konfirmasi singkat saat sudah ada tarif aktif lain:

```text
Jadikan "Tarif Baru" sebagai tarif aktif?
Tarif aktif lama akan dinonaktifkan.
```

---

## 7. Form Tarif — Polish

Form sudah baik. Beberapa penyempurnaan opsional:

### Auto-calculate konteks

Saat pengguna mengisi tarif per m³ dan abonemen, tampilkan contoh hitung:

```text
Contoh tagihan: pemakaian 15 m³
Biaya air       Rp45.000
Abonemen        Rp10.000
Total           Rp55.000
```

membantu pengguna memastikan nilai yang dimasukkan wajar sebelum disimpan.

### Radio "Jadikan Aktif"

Checkbox saat ini:

```text
☑ Jadikan tarif aktif
```

Saat edit tarif aktif, checkbox ini tidak perlu ditampilkan (sudah jelas aktif). Saat tambah tarif baru, bisa diganti radio:

```text
Jadikan sebagai tarif aktif?
○ Ya, jadikan aktif
○ Tidak, simpan sebagai nonaktif
```

atau pertahankan checkbox — keduanya valid untuk MVP.

---

## 8. Aksi Delete — Konfirmasi

### Saat Menghapus Tarif Nonaktif

```text
Hapus tarif "Tarif Lama"?

Tarif tidak dapat dikembalikan setelah dihapus.
```

Tombol `destructive` + `Hapus Tarif`.

### Saat Menghapus Tarif Aktif

Blokir atau beri peringatan lebih kuat:

```text
Tarif ini sedang aktif.

Hapus tarif "Tarif Reguler"?
Aplikasi akan tanpa tarif aktif dan tagihan tidak dapat dibuat
sampai tarif lain diaktifkan.
```

---

## 9. Ringkasan Atas — Konteks Cepat

Tambahkan baris konteks (hanya saat ada tarif aktif):

```text
Tarif aktif dipakai saat membuat tagihan:

Tarif Reguler · Rp3.000/m³ · Abonemen Rp10.000
```

Sebagai card kecil `border-primary/20 bg-primary/5` atau teks muted.

---

## 10. Status & Label yang Konsisten

| Kondisi | Label | Badge |
|---|---|---|
| `is_active === true` | Aktif | success |
| `is_active === false` | Nonaktif | secondary |
| Belum ada tarif aktif | — | warning banner |

Hindari istilah campuran seperti `Aktif` vs `Dipilih`.

---

## 11. Spacing

```text
Page horizontal padding   16px
Section gap               16–20px
Card padding              14–16px
Card radius               14–16px
Badge height              ~20–24px
Input height              44–48px
```

---

## 12. Typography

```text
Page title        20px / Semibold
Tariff name       15–16px / Semibold
Tariff per m³     16–18px / Semibold (nilai utama)
Label detail      12px / Medium / muted
Body              14px / Regular
Action label      14px / Medium
```

---

## 13. Recommended Layout — Normal (Ada Tarif Aktif)

```text
Lainnya
Tarif
Kelola tarif air dan abonemen.

[ + Tambah Tarif ]

Tarif aktif dipakai saat membuat tagihan:
Tarif Reguler · Rp3.000/m³ · Abonemen Rp10.000

Tarif Aktif
┌───────────────────────────────────┐
│ Tarif Reguler                Aktif│
│ Tarif Air        Rp3.000 / m³    │
│ Abonemen         Rp10.000        │
│ Berlaku          1 Agustus 2026  │
│ [Edit]                [Nonaktifkan] │
└───────────────────────────────────┘

Tarif Lainnya
┌───────────────────────────────────┐
│ Tarif Lama                  Nonaktif│
│ Tarif Air        Rp2.500 / m³    │
│ Abonemen         Rp8.000         │
│ Berlaku          1 Januari 2026  │
│ [Edit]                  [Aktifkan] │
└───────────────────────────────────┘
```

---

## 14. Recommended Layout — Tanpa Tarif Aktif

```text
Tarif

⚠ Belum ada tarif aktif.
Aktifkan satu tarif agar tagihan dapat dibuat.

[ + Tambah Tarif ]

┌───────────────────────────────────┐
│ Tarif Lama                  Nonaktif│
│ Tarif Air        Rp2.500 / m³    │
│ Abonemen         Rp8.000         │
│ Berlaku          1 Januari 2026  │
│ [Edit]                  [Aktifkan] │
└───────────────────────────────────┘
```

---

## 15. Prioritas Redesign

### Priority 1 — Hierarki Tarif Aktif

1. Pin tarif aktif di atas + badge `Aktif` variant success.
2. Tambah ringkasan "tarif aktif dipakai saat generate tagihan".
3. Bedakan visual card aktif vs nonaktif.

### Priority 2 — Keamanan Aksi

4. Konfirmasi hapus tarif (dialog destruktif).
5. Blokir / peringatan saat menghapus tarif aktif.
6. Label aksi jelas (Edit / Aktifkan / Nonaktifkan), bukan hanya icon.

### Priority 3 — State

7. Warning banner saat tidak ada tarif aktif.
8. Empty state dengan icon + CTA Tambah Tarif.
9. Konfirmasi saat mengaktifkan tarif yang menggantikan tarif aktif lama.

### Priority 4 — Form & Data

10. Contoh perhitungan tagihan di form.
11. Sembunyikan checkbox "Jadikan aktif" saat edit tarif aktif.

### Priority 5 — Polish

12. Urutan daftar: aktif dulu, nonaktif setelahnya.
13. Rapikan spacing card.

---

## 16. UX Principle

> **Tarif aktif harus selalu terlihat dan satu tarif aktif harus selalu ada untuk menjaga penagihan tetap jalan.**

Urutan informasi:

```text
Tarif mana yang dipakai sekarang?
↓
Nilai tarif per m³ & abonemen
↓
Kapan berlaku?
↓
Aksi: edit / aktifkan / nonaktifkan / hapus
```

---

## 17. Acceptance Criteria Redesign

- Pengguna langsung tahu tarif aktif tanpa perlu membaca satu per satu.
- Nilai tarif per m³ dan abonemen terbaca dalam 2–3 detik.
- Aksi hapus selalu dilindungi konfirmasi.
- Label aksi dapat dipahami tanpa tooltip.
- Tanpa tarif aktif, pengguna mendapat warning dan arah yang jelas.
- Halaman tetap nyaman pada viewport 360–430px.
- Empty state memandu pengguna membuat tarif pertama.
- Menghapus tarif aktif tidak menyebabkan data tagihan korup (blockir/peringatan).

---

## 18. Kesimpulan

Halaman tarif secara fungsi sudah benar. Redesign fokus pada:

1. **Menonjolkan tarif aktif** — ini elemen paling penting.
2. **Melindungi aksi destruktif** — konfirmasi hapus.
3. **Memperjelas aksi** — label teks, bukan icon ambigu.
4. **Menjaga kesinambungan penagihan** — warning saat tidak ada tarif aktif.

Target akhirnya:

> **Admin membuka halaman Tarif dan langsung tahu tarif mana yang berlaku, nilai tagihannya, serta perubahan apa yang perlu dilakukan — tanpa risiko menghapus atau mengganti tarif secara tidak sengaja.**
