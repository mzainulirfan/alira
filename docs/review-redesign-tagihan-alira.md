# Review & Redesign Plan — Halaman Tagihan Alira

## 1. Ringkasan

Halaman **Tagihan** saat ini sudah memiliki struktur MVP yang cukup lengkap:

- Pemilihan periode.
- Ringkasan total tagihan.
- Progress pembayaran.
- Fitur generate tagihan.
- Filter status.
- Daftar tagihan pelanggan.
- Bottom navigation yang konsisten.

Secara fungsi, fondasinya sudah benar. Masalah utama bukan kekurangan fitur, tetapi **hierarki informasi dan conditional state**.

Saat seluruh tagihan sudah dibuat dan seluruhnya sudah lunas, halaman masih menampilkan banyak komponen yang menjelaskan kondisi yang sama:

```text
Dibayar = total
Belum = Rp0
100% sudah dibayar
Progress bar penuh
Semua tagihan sudah dibayar
Generate Tagihan disabled
Semua pencatatan sudah memiliki tagihan
```

Akibatnya halaman terasa lebih padat daripada kebutuhan sebenarnya.

Arah redesign yang disarankan:

> **Tagihan harus berfungsi sebagai pusat monitoring penagihan: berapa yang ditagihkan, berapa yang sudah masuk, siapa yang belum bayar, dan tindakan apa yang perlu dilakukan.**

---

# 2. Review UI Saat Ini

## 2.1 Yang Sudah Baik

### Struktur halaman mudah dipahami

Urutan saat ini cukup logis:

```text
Judul
↓
Ringkasan
↓
Generate Tagihan
↓
Filter
↓
Daftar Tagihan
```

Pengguna dapat memahami konteks halaman tanpa banyak belajar.

---

### Ringkasan keuangan langsung terlihat

Tiga card:

```text
Total
Dibayar
Belum
```

memberikan gambaran cepat mengenai status tagihan pada periode aktif.

Ini adalah informasi yang memang penting pada halaman Tagihan.

---

### Progress pembayaran tersedia

Informasi:

```text
100% tagihan sudah dibayar
```

membantu pengguna memahami tingkat collection secara cepat.

---

### Status pelanggan cukup mudah dikenali

Badge:

```text
Lunas
```

sudah tepat menggunakan warna hijau.

Jumlah tagihan juga ditempatkan di sisi kanan sehingga mudah dipindai.

---

### Filter status sesuai kebutuhan

Filter:

```text
Semua
Belum Dibayar
Lunas
Menunggak
```

sudah sesuai dengan workflow penagihan PAM.

---

# 3. Masalah Utama: Periode Ditampilkan Dua Kali

Saat ini terdapat:

```text
Tagihan
Agustus 2026

[ Agustus 2026 ▾ ]
```

Periode muncul sebagai subtitle sekaligus selector.

Ini redundant.

## Rekomendasi

Gunakan hanya selector periode.

Contoh:

```text
Tagihan                      [ Agustus 2026 ▾ ]
```

atau pada viewport kecil:

```text
Tagihan

Periode
[ Agustus 2026           ▾ ]
```

Jangan tampilkan periode kembali sebagai subtitle.

---

# 4. Ringkasan Terlalu Terfragmentasi

Saat ini digunakan tiga card terpisah:

```text
Total
Dibayar
Belum
```

Pada layar sekitar 360–430px, tiga card sejajar menyebabkan ruang setiap card sempit.

Label `Belum` juga terlalu singkat dan sedikit ambigu.

## Rekomendasi

Gunakan satu section **Ringkasan Tagihan** dengan dua angka utama dan satu angka sekunder.

Contoh:

```text
Ringkasan Tagihan

Total Tagihan
Rp3.769.000

Sudah Dibayar
Rp3.769.000

Sisa
Rp0
```

Atau grid 2 kolom:

```text
┌────────────────┐ ┌────────────────┐
│ Total Tagihan  │ │ Sudah Dibayar │
│ Rp3.769.000    │ │ Rp3.769.000   │
└────────────────┘ └────────────────┘

Sisa tagihan
Rp0
```

Untuk data finansial, dua card utama biasanya lebih nyaman dibanding tiga card sempit.

---

# 5. Ubah Label "Belum"

Label:

```text
Belum
```

kurang spesifik.

Gunakan salah satu:

```text
Belum Dibayar
```

atau:

```text
Sisa Tagihan
```

Untuk summary keuangan, **Sisa Tagihan** lebih direkomendasikan.

Untuk filter/status pelanggan, gunakan **Belum Dibayar**.

---

# 6. Progress 100% Terlalu Redundant

Saat semua tagihan sudah dibayar, halaman menampilkan:

```text
100% tagihan sudah dibayar
████████████████
Semua tagihan sudah dibayar
```

Ketiga elemen menyampaikan informasi yang sama.

## Saat Belum 100%

Progress bar berguna:

```text
Pembayaran

Rp2.800.000 dari Rp3.769.000
74%

████████████░░░

Sisa Rp969.000
```

## Saat Sudah 100%

Gunakan success state compact:

```text
✓ Semua tagihan lunas

Rp3.769.000 dari Rp3.769.000
sudah diterima.
```

Tidak perlu progress bar ketika nilai sudah 100%.

---

# 7. Section Generate Tagihan Terlalu Dominan

Saat ini card **Generate Tagihan** tetap mengambil ruang besar meskipun:

```text
Semua 1 pencatatan sudah memiliki tagihan untuk periode ini.
```

dan tombol Generate dalam kondisi disabled.

Ini membuat komponen yang sudah tidak actionable tetap menjadi salah satu section terbesar di halaman.

## Rekomendasi

Gunakan conditional state.

### Jika Masih Ada Pencatatan Belum Dibuatkan Tagihan

Tampilkan card:

```text
Tagihan Belum Dibuat

12 pencatatan meter belum memiliki tagihan.

[ Generate 12 Tagihan ]
```

CTA harus jelas menyebut jumlah.

### Jika Semua Sudah Dibuat

Jangan tampilkan card besar.

Cukup gunakan status kecil:

```text
✓ Semua tagihan periode ini sudah dibuat
```

atau hilangkan section sepenuhnya.

Prinsip:

> **Jika tidak ada action yang bisa dilakukan, jangan berikan ruang besar pada action tersebut.**

---

# 8. Generate Tagihan Sebaiknya Berbasis Jumlah

Label saat ini:

```text
Generate Tagihan
```

cukup teknis.

Copywriting yang lebih mudah dipahami:

```text
Buat Tagihan
```

CTA:

```text
Buat 12 Tagihan
```

Description:

```text
12 pencatatan meter belum memiliki tagihan untuk Agustus 2026.
```

Ini lebih jelas daripada:

```text
Buat tagihan untuk Agustus 2026 menggunakan tarif air.
```

Tarif adalah detail sistem; pengguna lebih membutuhkan informasi tentang jumlah pekerjaan yang akan dilakukan.

---

# 9. Gunakan Konfirmasi Sebelum Generate Massal

Jika tombol menghasilkan banyak tagihan sekaligus, tampilkan konfirmasi.

Contoh:

```text
Buat 42 Tagihan?

Tagihan akan dibuat dari pencatatan meter
periode Agustus 2026 menggunakan tarif aktif.

42 pelanggan
Rp3.000 / m³
Abonemen Rp10.000

[ Batal ]
[ Buat Tagihan ]
```

Tujuannya mengurangi risiko generate dengan periode atau tarif yang salah.

---

# 10. Filter Status Sudah Tepat, Tapi Bisa Lebih Contextual

Filter sekarang:

```text
Semua 1
Belum Dibayar 0
Lunas 1
Menunggak 0
```

Secara fungsi sudah tepat.

Namun ketika semua status selain `Lunas` bernilai 0, banyak chip menjadi noise.

## Rekomendasi MVP

Tetap tampilkan seluruh filter agar pattern konsisten.

Tetapi hierarchy visual diperhalus:

```text
Semua 1
Belum Dibayar 0
Lunas 1
Menunggak 0
```

Filter dengan nilai `0` menggunakan visual lebih muted.

---

# 11. Default Filter Harus Mengikuti Kondisi

Halaman Tagihan seharusnya membantu penagihan.

Jika terdapat pelanggan yang belum bayar, default dapat diarahkan ke:

```text
Belum Dibayar
```

atau tetap `Semua`, tetapi section **Perlu Ditagih** ditampilkan sebelum daftar.

Untuk MVP, opsi paling aman:

```text
Default = Semua
```

tetapi beri shortcut:

```text
8 pelanggan perlu ditagih
[ Lihat ]
```

---

# 12. Tambahkan "Perlu Ditagih" Jika Ada

Halaman akan lebih actionable jika menampilkan kondisi yang membutuhkan perhatian.

Contoh:

```text
Perlu Ditagih

8 pelanggan belum membayar
Rp760.000

3 di antaranya sudah melewati jatuh tempo

[ Lihat Pelanggan ]
```

Section ini hanya muncul jika count > 0.

Jika semuanya lunas, tampilkan success state kecil atau tidak perlu section.

---

# 13. Customer Bill Card Perlu Hierarki Lebih Jelas

Saat ini card pelanggan menampilkan:

```text
mohammad zainul irfan      Lunas
PAM-000001 · Pemakaian 1.256 m³

Rp3.769.000 >
```

Secara dasar sudah baik, tetapi nominal tagihan adalah informasi utama dan status sebaiknya memiliki hubungan visual yang lebih jelas dengan nominal.

## Redesign

```text
mohammad zainul irfan
PAM-000001                    ✓ Lunas

Pemakaian
1.256 m³

Rp3.769.000                       >
```

atau versi lebih compact:

```text
mohammad zainul irfan       ✓ Lunas
PAM-000001 · 1.256 m³

Rp3.769.000                         >
```

---

# 14. Card Belum Dibayar Harus Lebih Actionable

Untuk tagihan yang belum dibayar:

```text
Budi Santoso          Belum Dibayar
PAM-000123 · 15 m³

Rp55.000
Jatuh tempo 20 Agustus

[ Catat Pembayaran ]
```

CTA `Catat Pembayaran` lebih berguna daripada hanya chevron menuju detail.

Pada list panjang, CTA dapat ditampilkan di detail untuk menjaga card compact.

---

# 15. Card Menunggak Harus Menunjukkan Umur Tunggakan

Status:

```text
Menunggak
```

saja belum cukup.

Tambahkan:

```text
Lewat 12 hari
```

atau:

```text
Jatuh tempo 6 Agustus
```

Contoh:

```text
Budi Santoso               Menunggak
PAM-000123

Rp55.000
Lewat 12 hari

                              Detail >
```

Ini membantu admin memprioritaskan penagihan.

---

# 16. Definisi Status Harus Konsisten

Disarankan:

```text
unpaid
→ Belum Dibayar

paid
→ Lunas

overdue
→ Menunggak

cancelled
→ Dibatalkan
```

Jangan menggunakan campuran istilah seperti:

```text
Dibayar
Lunas
Paid
```

untuk konteks yang sama.

Gunakan:

- **Sudah Dibayar** untuk summary uang.
- **Lunas** untuk status invoice pelanggan.

---

# 17. Bedakan "Tagihan Dibayar" dan "Pembayaran Diterima"

Summary sebaiknya mengikuti bahasa keuangan yang konsisten.

Contoh:

```text
Total Tagihan
Rp3.769.000

Pembayaran Masuk
Rp3.769.000

Sisa Tagihan
Rp0
```

Ini bahkan lebih mudah dipahami dibanding:

```text
Total
Dibayar
Belum
```

Rekomendasi final:

```text
Total Tagihan
Pembayaran Masuk
Sisa Tagihan
```

---

# 18. Tambahkan Indikator Collection Rate

Saat belum 100%:

```text
74% tertagih
```

lebih meaningful daripada sekadar:

```text
74% tagihan sudah dibayar
```

Namun karena target pengguna bukan akuntan profesional, copy sederhana lebih baik:

```text
74% sudah dibayar
```

---

# 19. Empty State

## Tidak Ada Tagihan

```text
Belum ada tagihan

Catat meter pelanggan terlebih dahulu,
lalu buat tagihan untuk periode ini.

[ Ke Pencatatan Meter ]
```

## Tidak Ada Tagihan Belum Dibayar

```text
✓ Semua tagihan lunas

Tidak ada tagihan yang belum dibayar
untuk Agustus 2026.
```

## Tidak Ada Tunggakan

```text
Tidak ada tunggakan

Semua tagihan masih dalam periode pembayaran
atau sudah lunas.
```

---

# 20. Flow Halaman Tagihan yang Direkomendasikan

```text
Buka Tagihan
↓
Pilih Periode
↓
Lihat Total / Pembayaran / Sisa
↓
Jika ada meter tanpa tagihan
→ Buat Tagihan
↓
Jika ada tagihan belum bayar
→ Lihat pelanggan
↓
Buka Detail
↓
Catat Pembayaran
↓
Status menjadi Lunas
↓
Summary otomatis terupdate
```

---

# 21. Recommended Layout — Kondisi Normal

```text
┌────────────────────────────────┐
│ 💧 Alira                    A  │
├────────────────────────────────┤
│                                │
│ Tagihan                        │
│                                │
│ Periode                        │
│ [ Agustus 2026             ▾ ] │
│                                │
│ Ringkasan Tagihan              │
│                                │
│ ┌────────────┐ ┌─────────────┐ │
│ │ Total      │ │ Pembayaran  │ │
│ │ Rp3,76 jt  │ │ Rp2,80 jt   │ │
│ └────────────┘ └─────────────┘ │
│                                │
│ Sisa Tagihan                   │
│ Rp969.000                      │
│                                │
│ 74% sudah dibayar              │
│ ████████████░░░░               │
│                                │
│ Perlu Ditagih                  │
│                                │
│ 8 pelanggan belum membayar  > │
│ 3 sudah melewati jatuh tempo  │
│                                │
│ [Semua 50] [Belum 8]          │
│ [Lunas 42] [Menunggak 3]      │
│                                │
│ ┌────────────────────────────┐ │
│ │ Budi Santoso    Menunggak │ │
│ │ PAM-000123 · 15 m³         │ │
│ │                            │ │
│ │ Rp55.000                   │ │
│ │ Lewat 12 hari          >   │ │
│ └────────────────────────────┘ │
│                                │
├────────────────────────────────┤
│ Home Pelanggan Meter Tagihan … │
└────────────────────────────────┘
```

---

# 22. Recommended Layout — Semua Sudah Lunas

Untuk kondisi pada screenshot saat ini, halaman bisa jauh lebih compact:

```text
┌────────────────────────────────┐
│ 💧 Alira                    A  │
├────────────────────────────────┤
│                                │
│ Tagihan                        │
│                                │
│ [ Agustus 2026             ▾ ] │
│                                │
│ Ringkasan Tagihan              │
│                                │
│ ┌────────────┐ ┌─────────────┐ │
│ │ Total      │ │ Pembayaran  │ │
│ │ Rp3,76 jt  │ │ Rp3,76 jt   │ │
│ └────────────┘ └─────────────┘ │
│                                │
│ ✓ Semua tagihan lunas          │
│ Rp3.769.000 sudah diterima.    │
│                                │
│ ✓ Semua tagihan sudah dibuat   │
│                                │
│ [Semua 1] [Lunas 1]           │
│                                │
│ mohammad zainul irfan   ✓ Lunas│
│ PAM-000001 · 1.256 m³          │
│                                │
│ Rp3.769.000                  > │
│                                │
├────────────────────────────────┤
│ Home Pelanggan Meter Tagihan … │
└────────────────────────────────┘
```

Tidak perlu:

- progress bar 100%;
- pesan 100%;
- success message kedua;
- card Generate Tagihan besar dan disabled.

---

# 23. Arah Visual

Tetap gunakan arah desain Alira:

> **Clean utility UI, mobile-first, data-oriented, dengan blue/sky sebagai primary.**

Gunakan warna secara fungsional.

```text
Primary
Blue / Sky

Lunas
Green

Belum Dibayar
Amber / Neutral

Menunggak
Red

Dibatalkan
Gray
```

Hindari membuat seluruh card berwarna sesuai status.

Gunakan:

- badge;
- icon;
- tint ringan;
- border kecil;
- text status.

---

# 24. Spacing

Rekomendasi:

```text
Page horizontal padding   14–16px
Section gap               20–24px
Card padding              14–16px
Card radius               14–16px
Summary card min-height   80–92px
Filter chip               32–36px
Bottom nav                64–72px
```

Pada halaman keuangan, whitespace sangat penting agar angka tidak terasa padat.

---

# 25. Typography

Rekomendasi:

```text
Page Title
22–24px / Semibold

Amount utama
18–22px / Semibold

Customer Name
15–16px / Semibold

Section Label
12–13px / Semibold

Body
14px / Regular

Secondary
12–14px / Regular
```

Nominal uang harus mempunyai hierarchy lebih tinggi daripada metadata seperti nomor pelanggan.

---

# 26. Bottom Navigation

Bottom navigation saat ini sudah tepat:

```text
Home
Pelanggan
Catat Meter
Tagihan
Lainnya
```

Active state biru pada `Tagihan` sudah sesuai.

Tidak perlu perubahan struktur untuk MVP.

---

# 27. Development Overlay

Pada bagian kiri bawah screenshot terlihat:

```text
2 Issues
```

beserta indikator merah.

Ini tampaknya berasal dari development tooling.

Pastikan elemen tersebut:

- tidak muncul pada production build;
- tidak masuk ke screenshot promosi;
- tidak mengganggu bottom navigation.

---

# 28. Prioritas Redesign

## Priority 1 — Hierarki

1. Hilangkan periode yang tampil dua kali.
2. Perjelas summary menjadi:
   - Total Tagihan.
   - Pembayaran Masuk.
   - Sisa Tagihan.
3. Ubah label `Belum` menjadi `Sisa Tagihan` atau `Belum Dibayar`.

## Priority 2 — Conditional State

4. Hilangkan progress bar jika sudah 100%.
5. Gunakan success state compact saat semua lunas.
6. Jangan tampilkan card Generate Tagihan besar jika tidak ada tagihan yang perlu dibuat.
7. Tampilkan Generate hanya jika actionable.

## Priority 3 — Workflow Penagihan

8. Tambahkan section `Perlu Ditagih` jika ada tagihan belum dibayar.
9. Tampilkan jatuh tempo / umur tunggakan.
10. Arahkan detail tagihan ke action `Catat Pembayaran`.

## Priority 4 — Daftar Tagihan

11. Perkuat hierarchy customer, status, nominal, dan pemakaian.
12. Gunakan status badge konsisten.
13. Buat card menunggak lebih informatif.

## Priority 5 — Polish

14. Muted filter dengan count `0`.
15. Rapikan spacing.
16. Pastikan development overlay hilang di production.

---

# 29. UX Principle

Halaman Tagihan harus menjawab empat pertanyaan dalam beberapa detik:

```text
1. Berapa total tagihan bulan ini?
2. Berapa pembayaran yang sudah masuk?
3. Berapa yang masih harus ditagih?
4. Siapa pelanggan yang perlu ditindaklanjuti?
```

Jika semua sudah selesai, halaman tidak perlu tetap terlihat sibuk.

Gunakan prinsip:

> **Semakin sedikit pekerjaan yang tersisa, semakin sederhana tampilan halaman.**

---

# 30. Acceptance Criteria Redesign

Redesign dianggap berhasil jika:

- Periode aktif hanya ditampilkan sekali.
- Total tagihan, pembayaran masuk, dan sisa dapat dipahami dalam 2–3 detik.
- Status `Lunas`, `Belum Dibayar`, dan `Menunggak` memiliki arti yang konsisten.
- Section Generate hanya terlihat jika ada pekerjaan yang perlu dilakukan.
- Kondisi 100% lunas tampil compact.
- Admin dapat mengetahui pelanggan yang perlu ditagih tanpa membuka satu per satu.
- Umur tunggakan atau jatuh tempo mudah terlihat.
- Nominal tagihan menjadi informasi utama pada card.
- Tampilan tetap nyaman untuk 1 maupun ratusan tagihan.
- Halaman nyaman pada viewport 360–430px.

---

# 31. Kesimpulan

Desain saat ini sudah cukup matang untuk MVP dan tidak membutuhkan perubahan layout secara total.

Redesign sebaiknya berfokus pada tiga hal:

1. **Kurangi redundancy** ketika semua tagihan sudah selesai/lunas.
2. **Tampilkan action hanya ketika memang bisa dilakukan.**
3. **Jadikan halaman sebagai alat penagihan, bukan sekadar daftar invoice.**

Target akhirnya:

> **Admin membuka halaman Tagihan dan langsung memahami uang yang sudah masuk, sisa yang harus ditagih, serta pelanggan mana yang perlu ditindaklanjuti.**
