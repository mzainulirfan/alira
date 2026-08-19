# Revisi Review & Redesign — Detail Tagihan Pelanggan Alira

## 1. Koreksi Konteks

Halaman ini adalah **halaman pelanggan**, bukan halaman admin/petugas.

Artinya fokus UX harus berubah.

Halaman pelanggan tidak perlu membantu proses operasional seperti:

- Mencatat pembayaran.
- Mengedit tagihan.
- Membatalkan tagihan.
- Melihat siapa petugas penerima pembayaran.
- Mengelola status tagihan.
- Melihat action administratif.

Fokus halaman pelanggan adalah:

> **Saya ditagih berapa, untuk periode apa, pemakaian saya berapa, tagihan ini terdiri dari apa, dan apakah sudah dibayar?**

---

# 2. Tujuan Halaman Pelanggan

Halaman Detail Tagihan harus menjawab lima pertanyaan utama:

```text
1. Tagihan periode apa?
2. Berapa total tagihannya?
3. Statusnya sudah lunas atau belum?
4. Pemakaian air saya berapa?
5. Dari mana nominal tagihan tersebut berasal?
```

Jika sudah lunas:

```text
Kapan saya membayarnya?
```

Jika belum lunas:

```text
Kapan jatuh temponya?
```

---

# 3. Review Desain Saat Ini

Desain saat ini sebenarnya sudah lebih cocok untuk pelanggan dibanding admin karena:

- Tidak terlalu banyak action.
- Total tagihan menjadi fokus.
- Status `Lunas` mudah ditemukan.
- Rincian biaya cukup sederhana.
- Tidak ada informasi operasional yang kompleks.
- Bottom navigation juga sudah tampak seperti area pelanggan:
  - Dashboard
  - Tagihan
  - Meter
  - Profil

Fondasinya sudah benar.

Yang perlu diperbaiki terutama:

- hierarchy;
- copywriting;
- rincian pemakaian;
- status pembayaran;
- pengurangan informasi yang redundant.

---

# 4. Jangan Tambahkan Informasi Admin

Dari review sebelumnya, beberapa rekomendasi harus dibatalkan.

## Tidak perlu

```text
Catat Pembayaran
Edit Tagihan
Batalkan Tagihan
Diterima oleh Admin
Menu tiga titik administratif
Action operasional petugas
```

Semua itu tidak relevan untuk pelanggan.

---

# 5. Identitas Pelanggan Tidak Perlu Menjadi Fokus

Pada halaman admin, nama pelanggan penting untuk memastikan tagihan milik siapa.

Pada halaman pelanggan, user sudah login ke akun miliknya sendiri.

Karena itu tidak perlu menampilkan card besar seperti:

```text
Mohammad Zainul Irfan
PAM-000001
MTR-000001
```

Jika ingin ditampilkan, cukup sebagai metadata kecil.

Contoh:

```text
PAM-000001
```

atau bahkan tidak perlu sama sekali jika konteks akun sudah jelas.

---

# 6. Sederhanakan Header

Saat ini:

```text
DETAIL TAGIHAN
Periode Agustus 2026

Ringkasan tagihan pelanggan dalam tampilan yang lebih sederhana.
```

Kalimat deskripsi terlalu teknis dan tidak perlu.

## Rekomendasi

```text
← Detail Tagihan

Agustus 2026
```

atau:

```text
← Tagihan Agustus 2026
```

Versi kedua lebih sederhana untuk pelanggan.

---

# 7. Total Tagihan Harus Menjadi Hero Utama

Untuk pelanggan, informasi terpenting adalah:

```text
Rp3.769.000
```

Jadi total tagihan sebaiknya menjadi hero utama.

Contoh:

```text
Tagihan Agustus 2026

Rp3.769.000

✓ Lunas
Dibayar 14 Agustus 2026
```

Jika belum dibayar:

```text
Rp3.769.000

Belum Dibayar
Jatuh tempo 15 Agustus 2026
```

---

# 8. Status Harus Berubah Sesuai Kondisi

## Lunas

```text
✓ Lunas
Dibayar 14 Agustus 2026
```

Gunakan green tint ringan.

## Belum Dibayar

```text
Belum Dibayar
Jatuh tempo 15 Agustus 2026
```

Gunakan amber ringan.

## Menunggak

```text
Menunggak
Lewat 4 hari
```

Diikuti:

```text
Jatuh tempo 15 Agustus 2026
```

Gunakan red tint ringan.

---

# 9. Jatuh Tempo Tidak Perlu Menjadi Informasi Utama Jika Sudah Lunas

Pada screenshot saat ini status sudah:

```text
Lunas
```

tetapi yang ditampilkan di rincian adalah:

```text
Jatuh tempo
15 Agustus 2026
```

Untuk pelanggan yang sudah lunas, informasi yang lebih relevan adalah:

```text
Dibayar
14 Agustus 2026
```

Jatuh tempo boleh tetap tersedia sebagai metadata sekunder jika memang dibutuhkan.

---

# 10. Tambahkan Rincian Pemakaian yang Lebih Transparan

Saat ini hanya ada:

```text
Pemakaian
1.256 m³
```

Untuk pelanggan, akan lebih baik jika dijelaskan bagaimana pemakaian tersebut diperoleh.

Contoh:

```text
Pemakaian Air

Meter sebelumnya
1.250 m³

Meter sekarang
1.265 m³

Pemakaian
15 m³
```

Ini meningkatkan transparansi dan mengurangi kebingungan saat tagihan berubah.

---

# 11. Jangan Gunakan "0 m³ → 1.256 m³" Jika Itu Pencatatan Pertama

Jika pelanggan baru dan belum memiliki meter sebelumnya, jangan memberi kesan bahwa meter sebelumnya benar-benar nol.

Gunakan:

```text
Meter awal
1.256 m³
```

atau:

```text
Pencatatan pertama
1.256 m³
```

sesuai aturan bisnis.

---

# 12. Rincian Biaya Harus Mudah Dipahami

Gunakan section:

```text
Rincian Tagihan
```

Contoh:

```text
Biaya air
Rp3.768.000

Abonemen
Rp1.000

─────────────────

Total
Rp3.769.000
```

Tarif dapat ditampilkan sebagai secondary information:

```text
Tarif air
Rp3.000 / m³
```

---

# 13. Gunakan Bahasa yang Lebih Natural

Beberapa label dapat dibuat lebih customer-friendly.

## Saat Ini

```text
Harga per m3
```

## Revisi

```text
Tarif air
Rp3.000 / m³
```

Gunakan simbol:

```text
m³
```

bukan:

```text
m3
```

---

# 14. Struktur Informasi yang Direkomendasikan

Urutan halaman pelanggan:

```text
Periode
↓
Total Tagihan
↓
Status
↓
Tanggal pembayaran / jatuh tempo
↓
Pemakaian Air
↓
Rincian Tagihan
↓
Riwayat / bukti pembayaran jika tersedia
```

Tidak perlu mencampurkan action administratif.

---

# 15. Recommended Layout — Tagihan Lunas

```text
┌────────────────────────────────┐
│ ← Detail Tagihan               │
├────────────────────────────────┤
│                                │
│ Agustus 2026                   │
│                                │
│ Total Tagihan                  │
│ Rp3.769.000                    │
│                                │
│ ✓ Lunas                        │
│ Dibayar 14 Agustus 2026       │
│                                │
│ ────────────────────────────── │
│                                │
│ Pemakaian Air                  │
│                                │
│ Meter sebelumnya     1.250 m³  │
│ Meter sekarang       1.265 m³  │
│                                │
│ Pemakaian               15 m³  │
│                                │
│ ────────────────────────────── │
│                                │
│ Rincian Tagihan                │
│                                │
│ Biaya air             Rp45.000 │
│ Abonemen              Rp10.000 │
│                                │
│ ────────────────────────────── │
│ Total                  Rp55.000│
│                                │
│ Tarif air          Rp3.000 /m³ │
│                                │
│ [     Lihat Pembayaran      ]  │
│                                │
└────────────────────────────────┘
```

Jika belum ada halaman pembayaran terpisah, tombol `Lihat Pembayaran` tidak wajib.

---

# 16. Recommended Layout — Belum Dibayar

```text
┌────────────────────────────────┐
│ ← Detail Tagihan               │
├────────────────────────────────┤
│                                │
│ Agustus 2026                   │
│                                │
│ Total Tagihan                  │
│ Rp55.000                       │
│                                │
│ Belum Dibayar                  │
│ Jatuh tempo 20 Agustus 2026   │
│                                │
│ ────────────────────────────── │
│                                │
│ Pemakaian Air                  │
│                                │
│ Meter sebelumnya     1.250 m³  │
│ Meter sekarang       1.265 m³  │
│ Pemakaian               15 m³  │
│                                │
│ Rincian Tagihan                │
│                                │
│ Biaya air             Rp45.000 │
│ Abonemen              Rp10.000 │
│ ────────────────────────────── │
│ Total                  Rp55.000│
│                                │
└────────────────────────────────┘
```

Jika nantinya Alira menyediakan pembayaran digital, barulah tambahkan:

```text
[ Bayar Sekarang ]
```

Tetapi jika pembayaran masih dilakukan melalui pengurus PAM, jangan menampilkan CTA pembayaran palsu.

---

# 17. Recommended Layout — Menunggak

```text
Agustus 2026

Total Tagihan
Rp55.000

Menunggak
Lewat 8 hari

Jatuh tempo
11 Agustus 2026

Pemakaian Air
15 m³

Rincian Tagihan
Rp55.000
```

Jika diperlukan, dapat ditambahkan informasi:

```text
Hubungi pengurus PAM untuk informasi pembayaran.
```

---

# 18. Card di Dalam Card Bisa Dikurangi

Saat ini ada:

```text
Card Ringkasan
└── Card Total Tagihan
```

Untuk pelanggan, cukup satu surface/card.

Tujuannya agar angka utama lebih terasa ringan dan halaman tidak tampak seperti dashboard admin.

---

# 19. Tombol "Kembali ke Daftar Tagihan"

Tombol full-width:

```text
Kembali ke daftar tagihan
```

tidak perlu.

Gunakan:

```text
← Detail Tagihan
```

di header.

Ini lebih sesuai pola mobile/PWA.

---

# 20. Bottom Navigation

Karena ini adalah halaman pelanggan, bottom navigation yang terlihat pada screenshot justru sudah relevan:

```text
Dashboard
Tagihan
Meter
Profil
```

Saya akan mempertahankannya.

Ini juga memperjelas bahwa aplikasi pelanggan memiliki information architecture yang berbeda dari aplikasi/admin area.

---

# 21. Halaman Meter Pelanggan

Karena terdapat menu `Meter`, maka detail tagihan tidak perlu memasukkan semua informasi meter yang terlalu teknis.

Cukup tampilkan:

```text
Meter sebelumnya
Meter sekarang
Pemakaian
```

Detail seperti:

- serial meter;
- kode QR;
- riwayat pemasangan;
- status perangkat;

lebih cocok berada pada halaman `Meter`.

---

# 22. Halaman Detail Jangan Terlalu Panjang

Pelanggan biasanya membuka detail karena ingin mengecek:

```text
Kenapa tagihan saya segini?
```

Karena itu informasi terpenting cukup:

```text
Rp55.000

Pemakaian 15 m³

15 × Rp3.000 = Rp45.000
Abonemen = Rp10.000
```

Bisa ditambahkan detail kalkulasi seperti:

```text
15 m³ × Rp3.000
Rp45.000
```

Ini bahkan lebih mudah dipahami daripada hanya `Biaya air`.

---

# 23. Rekomendasi Breakdown yang Lebih Transparan

Contoh:

```text
Rincian Tagihan

Pemakaian air
15 m³ × Rp3.000
Rp45.000

Abonemen
Rp10.000

────────────────

Total
Rp55.000
```

Saya lebih menyarankan pola ini untuk halaman pelanggan.

---

# 24. Foto Meter — Future Enhancement

Karena Alira memiliki proses pencatatan meter, nantinya detail tagihan bisa menyediakan:

```text
Lihat foto pencatatan meter
```

Ini berguna jika pelanggan ingin memverifikasi angka meter.

Tidak perlu menjadi fitur MVP, tetapi cukup baik untuk roadmap karena dapat meningkatkan transparansi.

---

# 25. Prioritas Redesign

## Priority 1 — Customer Context

1. Hapus semua action admin.
2. Jangan menjadikan identitas pelanggan sebagai hero.
3. Fokuskan halaman pada tagihan milik user yang sedang login.

## Priority 2 — Hero

4. Jadikan nominal tagihan sebagai informasi utama.
5. Dekatkan status dengan total.
6. Untuk status lunas, tampilkan tanggal pembayaran.
7. Untuk status belum bayar, tampilkan jatuh tempo.

## Priority 3 — Transparansi

8. Tampilkan meter sebelumnya.
9. Tampilkan meter sekarang.
10. Tampilkan pemakaian.
11. Buat rincian biaya yang memperlihatkan rumus sederhana.

## Priority 4 — Navigation

12. Gunakan back button di header.
13. Hapus tombol besar kembali.
14. Pertahankan bottom navigation pelanggan.

## Priority 5 — Future

15. Lihat bukti pembayaran.
16. Lihat foto meter.
17. Bayar Sekarang jika payment gateway ditambahkan.

---

# 26. Prinsip UX Pelanggan

Halaman ini sebaiknya mengikuti urutan mental pelanggan:

```text
Berapa tagihan saya?
↓
Sudah bayar atau belum?
↓
Pemakaian saya berapa?
↓
Kenapa jumlahnya segitu?
↓
Kapan saya bayar / kapan jatuh tempo?
```

Bukan:

```text
Apa yang harus admin lakukan terhadap invoice ini?
```

---

# 27. Kesimpulan Revisi

Setelah konteksnya dikoreksi menjadi **halaman pelanggan**, saya tidak akan menambahkan:

```text
Catat Pembayaran
Edit Tagihan
Batalkan Tagihan
Admin action
Operational controls
```

Justru saya akan membuat halaman lebih sederhana.

Fokus final:

> **Total Tagihan → Status → Pemakaian → Perhitungan Biaya → Informasi Pembayaran**

Untuk desain yang Anda kirim, perubahan terbesar yang saya sarankan adalah:

1. Hapus helper text di bawah judul.
2. Jadikan `Rp3.769.000` sebagai hero utama.
3. Gabungkan status `Lunas` dengan hero tagihan.
4. Jika lunas, tampilkan tanggal pembayaran daripada menonjolkan jatuh tempo.
5. Tambahkan meter awal dan meter akhir.
6. Buat breakdown `pemakaian × tarif`.
7. Hilangkan tombol besar `Kembali ke daftar tagihan`.
8. Pertahankan bottom navigation pelanggan.
