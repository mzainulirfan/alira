# Plan Redesign Dashboard — Aplikasi PAM Kita

## 1. Tujuan Redesign

Redesign dashboard bertujuan mengubah halaman dari sekadar menampilkan angka menjadi dashboard operasional yang membantu pengguna memahami:

- Kondisi PAM saat ini.
- Progress pekerjaan bulanan.
- Kondisi tagihan dan pembayaran.
- Pelanggan yang perlu ditindaklanjuti.
- Tindakan berikutnya yang harus dilakukan.

Fokus utama redesign:

> Dashboard harus menjawab: **apa kondisi PAM sekarang, apa yang belum selesai, dan apa yang harus dilakukan berikutnya?**

---

## 2. Review Desain Saat Ini

### Yang Sudah Baik

- Bottom navigation cocok untuk PWA/mobile.
- Informasi utama tidak terlalu banyak.
- Bagian **Perlu Perhatian** relevan untuk aktivitas operasional.
- Nilai seperti `1 / 1`, `Rp 0`, dan jumlah tunggakan mudah dipindai.
- Layout berbasis card cukup fleksibel untuk dikembangkan.

### Masalah Utama

#### 2.1 Nama "PAM Kita" Muncul Dua Kali

Saat ini nama aplikasi tampil pada app bar dan kembali muncul sebagai heading halaman.

Contoh saat ini:

```text
PAM Kita

PAM Kita
Agustus 2026
```

Redesign:

```text
PAM Kita

Dashboard
Agustus 2026 ▾
```

Periode dibuat interaktif agar pengguna dapat mengganti bulan.

---

#### 2.2 Warna Card Terlalu Dominan

Card merah-oranye saat ini menjadi elemen visual terbesar, padahal isinya adalah informasi normal seperti pelanggan aktif.

Merah/oranye lebih tepat digunakan untuk:

- Warning.
- Tunggakan.
- Error.
- Kondisi yang membutuhkan perhatian.

Rekomendasi warna:

```text
Primary / Brand     Blue / Sky
Success             Green
Warning             Amber
Danger              Red
Background          Light Gray
Card                White
```

Informasi normal sebaiknya menggunakan card putih/netral.

---

#### 2.3 Hierarki Metrik Belum Jelas

Saat ini:

- Pelanggan aktif.
- Sudah dicatat.
- Tagihan bulan ini.

digabung dalam satu card besar, sedangkan pembayaran memiliki card besar sendiri.

Redesign menjadi summary grid:

```text
┌──────────────────┐
│ Pelanggan Aktif  │
│ 425              │
└──────────────────┘

┌──────────────────┐
│ Meter Dicatat    │
│ 380 / 425        │
│ 89% selesai      │
└──────────────────┘

┌──────────────────┐
│ Tagihan          │
│ Rp31,2 jt        │
└──────────────────┘

┌──────────────────┐
│ Pembayaran       │
│ Rp27,5 jt        │
└──────────────────┘
```

Pada mobile gunakan grid `2 × 2`.

---

## 3. Pencatatan Meter Sebagai Fokus Operasional

Pencatatan meter merupakan salah satu pekerjaan utama petugas PAM setiap bulan.

Dashboard sebaiknya memberikan ruang khusus untuk progress pencatatan.

Contoh:

```text
Pencatatan Meter

380 dari 425 pelanggan
████████████████░░ 89%

45 pelanggan belum dicatat

[ Lanjut Catat Meter ]
```

Informasi yang ditampilkan:

- Total pelanggan yang harus dicatat.
- Jumlah yang sudah selesai.
- Persentase progress.
- Jumlah yang belum selesai.
- CTA untuk melanjutkan pencatatan.

---

## 4. Quick Actions

Dashboard saat ini lebih banyak menyajikan informasi daripada action.

Tambahkan section **Aksi Cepat**.

Contoh:

```text
Aksi Cepat

[ Catat Meter ]
[ Catat Pembayaran ]
[ Tambah Pelanggan ]
```

Untuk MVP dapat diprioritaskan:

1. Catat Meter.
2. Catat Pembayaran.

---

## 5. Redesign Section Keuangan

Tagihan dan pembayaran sebaiknya ditampilkan dalam satu konteks agar hubungannya lebih mudah dipahami.

Contoh:

```text
Keuangan Bulan Ini

┌────────────────┐ ┌────────────────┐
│ Tagihan        │ │ Dibayar        │
│ Rp31,2 jt      │ │ Rp27,5 jt      │
└────────────────┘ └────────────────┘

87% tagihan sudah dibayar
██████████████░░░

Belum dibayar
Rp3,7 jt
```

Informasi utama:

- Total tagihan.
- Total pembayaran.
- Persentase pembayaran.
- Sisa tagihan.

---

## 6. Redesign "Perlu Perhatian"

Saat ini semua item tetap ditampilkan walaupun nilainya `0`.

Contoh:

```text
Belum dicatat meter    0
Belum membayar         0
Menunggak              0
```

Hal ini menggunakan ruang tanpa memberikan informasi penting.

### Jika Ada Masalah

Tampilkan hanya kondisi yang membutuhkan perhatian:

```text
Perlu Perhatian

45  Meter belum dicatat    >
23  Belum membayar         >
8   Menunggak              >
```

Gunakan warna status secara terbatas:

```text
Amber   → Meter belum dicatat
Amber   → Belum membayar
Red     → Menunggak
```

### Jika Tidak Ada Masalah

Tampilkan empty/success state:

```text
✓ Semua aman

Tidak ada pelanggan yang
memerlukan perhatian.
```

---

## 7. Aktivitas Terbaru

Tambahkan informasi aktivitas terbaru agar admin dapat mengetahui perubahan terakhir.

Contoh:

```text
Aktivitas Terbaru

Budi Santoso
Pembayaran Rp55.000
10:32
Lunas

Siti Aminah
Meter dicatat 1.245 m³
09:51

Ahmad
Pelanggan baru
Kemarin
```

Cukup tampilkan 3–5 aktivitas terakhir.

---

## 8. Redesign Header

### Saat Ini

```text
PAM Kita                  Logout

PAM Kita
Agustus 2026
```

### Redesign

```text
PAM Kita                     ⋯

Dashboard
Agustus 2026 ▾
```

Logout sebaiknya tidak ditempatkan langsung di header karena bukan action yang sering digunakan.

Pindahkan ke:

```text
Lainnya
└── Akun
    └── Keluar
```

---

## 9. Bottom Navigation

Struktur saat ini sudah cukup tepat:

```text
Dashboard
Pelanggan
Pencatatan Meter
Tagihan
Lainnya
```

Namun label dapat dibuat lebih singkat:

```text
Home
Pelanggan
Catat Meter
Tagihan
Lainnya
```

`Pencatatan Meter` terlalu panjang untuk bottom navigation.

Untuk MVP, gunakan bottom navigation standar terlebih dahulu agar implementasi tetap sederhana.

---

## 10. Arah Visual

Gunakan pendekatan:

> **Airtable-inspired utility UI + mobile-first**

Karakter desain:

- Clean.
- Light.
- Structured.
- Data-oriented.
- Sedikit warna dekoratif.
- Warna digunakan untuk fungsi/status.
- Card sederhana.
- Border halus.
- Radius konsisten.
- Fokus pada keterbacaan data.

### Rekomendasi Color Token

```text
Background
#F8FAFC

Card
#FFFFFF

Border
#E2E8F0

Text Primary
#0F172A

Text Secondary
#64748B

Primary
#0EA5E9

Primary Dark
#0284C7

Success
#16A34A

Warning
#F59E0B

Danger
#DC2626
```

---

## 11. Penggunaan Warna Status

```text
Lunas
→ Green

Belum Dibayar
→ Amber

Menunggak
→ Red

Meter Sudah Dicatat
→ Blue / Green

Meter Belum Dicatat
→ Neutral / Amber
```

Hindari penggunaan block warna merah/hijau besar untuk informasi biasa.

Gunakan warna sebagai accent:

- Badge.
- Icon.
- Status dot.
- Progress.
- Border kecil.
- Background tint ringan.

---

## 12. Struktur Dashboard Baru

Wireframe sederhana:

```text
┌────────────────────────────────┐
│ PAM Kita                    ⋯  │
│                                │
│ Dashboard                      │
│ Agustus 2026 ▾                 │
│                                │
│ RINGKASAN                      │
│                                │
│ ┌───────────┐ ┌─────────────┐ │
│ │ Pelanggan │ │ Meter       │ │
│ │ 425       │ │ 380 / 425   │ │
│ │ aktif     │ │ 89%         │ │
│ └───────────┘ └─────────────┘ │
│                                │
│ PENCATATAN METER               │
│                                │
│ 380 dari 425 pelanggan         │
│ ███████████████░░ 89%          │
│                                │
│ 45 belum dicatat               │
│                                │
│ [ Lanjut Catat Meter ]         │
│                                │
│ KEUANGAN BULAN INI             │
│                                │
│ ┌───────────┐ ┌─────────────┐ │
│ │ Tagihan   │ │ Dibayar     │ │
│ │ Rp31,2 jt │ │ Rp27,5 jt   │ │
│ └───────────┘ └─────────────┘ │
│                                │
│ 87% tagihan sudah dibayar      │
│ ██████████████░░               │
│                                │
│ PERLU PERHATIAN                │
│                                │
│ ● 45 Meter belum dicatat    > │
│ ● 23 Belum membayar         > │
│ ●  8 Menunggak              > │
│                                │
│ AKTIVITAS TERBARU              │
│                                │
│ Budi Santoso                   │
│ Pembayaran Rp55.000     Lunas  │
│                                │
│ Siti Aminah                    │
│ Meter dicatat 1.245 m³         │
│                                │
├────────────────────────────────┤
│ Home  Pelanggan Meter Tagihan …│
└────────────────────────────────┘
```

---

## 13. Prioritas Redesign

Urutan pengerjaan yang disarankan:

### Priority 1 — Struktur

1. Hilangkan duplikasi nama **PAM Kita**.
2. Ganti heading menjadi **Dashboard**.
3. Jadikan periode dapat dipilih.
4. Pindahkan logout ke halaman Lainnya.

### Priority 2 — Visual

5. Ganti card warna besar menjadi card netral.
6. Gunakan blue/sky sebagai primary.
7. Gunakan warna status hanya untuk kondisi tertentu.
8. Rapikan spacing, radius, border, dan typography.

### Priority 3 — Operasional

9. Buat progress pencatatan meter.
10. Tambahkan CTA **Lanjut Catat Meter**.
11. Tambahkan quick actions.

### Priority 4 — Keuangan

12. Gabungkan informasi Tagihan + Pembayaran.
13. Tambahkan progress pembayaran.
14. Tampilkan sisa tagihan.

### Priority 5 — Attention & Activity

15. Buat section **Perlu Perhatian** menjadi conditional.
16. Jangan tampilkan item dengan nilai `0` jika tidak diperlukan.
17. Tambahkan **Aktivitas Terbaru**.

---

## 14. Prinsip UX Dashboard

Dashboard tidak boleh hanya menjadi halaman statistik.

Dashboard harus membantu pengguna menjawab:

### 1. Bagaimana kondisi PAM sekarang?

Contoh:

```text
425 pelanggan aktif
89% meter sudah dicatat
87% tagihan sudah dibayar
```

### 2. Apa yang belum selesai?

Contoh:

```text
45 meter belum dicatat
23 pelanggan belum membayar
8 pelanggan menunggak
```

### 3. Apa yang harus saya lakukan berikutnya?

Contoh:

```text
[ Lanjut Catat Meter ]

[ Catat Pembayaran ]
```

---

## 15. Hasil yang Diharapkan

Setelah redesign, dashboard harus terasa:

- Lebih ringan.
- Lebih profesional.
- Lebih mudah dipindai.
- Tidak didominasi warna.
- Lebih fokus pada pekerjaan petugas.
- Lebih mudah memahami kondisi keuangan.
- Lebih jelas menunjukkan tugas yang belum selesai.
- Nyaman digunakan sebagai PWA di smartphone.

Fokus utama:

> **Bukan sekadar menampilkan data, tetapi mengarahkan pengguna ke pekerjaan berikutnya.**
