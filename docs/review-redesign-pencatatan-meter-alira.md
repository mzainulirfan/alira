# Review & Redesign Plan — Halaman Pencatatan Meter Alira

## 1. Ringkasan

Halaman **Pencatatan Meter** saat ini sudah memiliki fondasi yang cukup baik untuk MVP:

- Periode pencatatan terlihat jelas.
- Progress pencatatan tersedia.
- Ada search pelanggan.
- Ada filter status pencatatan.
- Setiap pelanggan memiliki status yang mudah dikenali.
- Bottom navigation tetap konsisten dengan aplikasi.

Namun dari sisi UI/UX, halaman masih dapat dibuat lebih fokus pada pekerjaan utama petugas, yaitu:

> **mencari pelanggan → melihat meter sebelumnya → mencatat meter sekarang → lanjut ke pelanggan berikutnya.**

Arah redesign yang disarankan adalah membuat halaman terasa lebih seperti **work queue** atau daftar pekerjaan lapangan, bukan sekadar daftar data.

---

# 2. Review UI Saat Ini

## 2.1 Yang Sudah Baik

### Header cukup sederhana

Header:

```text
Alira
```

dengan avatar di kanan sudah cukup ringan.

Tidak terlalu banyak action di bagian atas.

---

### Judul halaman jelas

```text
Pencatatan Meter
Agustus 2026
```

Pengguna langsung mengetahui:

- sedang berada di modul pencatatan meter;
- periode pencatatan yang sedang aktif.

---

### Progress pencatatan tersedia

Informasi:

```text
100% meter tercatat dari 1 pelanggan
```

sudah membantu pengguna mengetahui progres pekerjaan.

Progress bar juga memberikan feedback visual yang baik.

---

### Ada status penyelesaian

Pesan:

```text
Semua meter sudah dicatat untuk Agustus 2026.
```

memberikan closure yang baik setelah pekerjaan selesai.

---

### Search sangat relevan

Placeholder:

```text
Cari nama, nomor pelanggan, nomor meter...
```

sesuai kebutuhan petugas lapangan.

Petugas dapat mencari pelanggan berdasarkan beberapa identifier.

---

### Filter status sudah tepat

Filter:

```text
Semua
Belum Dicatat
Sudah Dicatat
```

merupakan struktur filter yang tepat untuk proses pencatatan meter.

---

# 3. Masalah UI/UX Utama

## 3.1 Progress Section Terlalu Besar Saat Sudah 100%

Saat progress masih berjalan, card ringkasan memang penting.

Tetapi saat sudah:

```text
100%
```

dan semua pelanggan selesai dicatat, terdapat tiga informasi yang pada dasarnya mengatakan hal yang sama:

```text
100% meter tercatat
Progress bar penuh
Semua meter sudah dicatat
```

Ini menyebabkan redundancy.

### Rekomendasi

Gunakan dua state berbeda.

### Saat Belum Selesai

```text
Pencatatan Meter

38 dari 50 pelanggan
76%

████████████░░░

12 pelanggan belum dicatat
```

### Saat Sudah Selesai

Gunakan success card lebih compact:

```text
✓ Pencatatan selesai

50 dari 50 pelanggan sudah dicatat
untuk Agustus 2026.
```

Tidak perlu progress bar jika sudah 100%.

---

# 4. Periode Terlihat Dua Kali

Saat ini:

```text
Pencatatan Meter
Agustus 2026

[ Agustus 2026 ▾ ]
```

Periode ditampilkan sebagai subtitle sekaligus selector.

Ini sedikit redundant.

### Rekomendasi

Gunakan:

```text
Pencatatan Meter              [ Agustus 2026 ▾ ]
```

atau pada mobile:

```text
Pencatatan Meter

[ Agustus 2026 ▾ ]
```

Hilangkan subtitle periode di bawah heading.

Dengan demikian periode hanya muncul sekali dan jelas sebagai kontrol.

---

# 5. Selector Periode Perlu Menjadi Bagian Penting

Periode bukan sekadar filter biasa.

Semua data pencatatan bergantung pada periode tersebut.

Karena itu selector periode sebaiknya memiliki hierarchy yang cukup jelas.

Contoh:

```text
Periode Pencatatan

[ Agustus 2026      ▾ ]
```

atau cukup:

```text
Agustus 2026 ▾
```

di kanan heading jika lebar layar memungkinkan.

---

# 6. Ringkasan Harus Lebih Action-Oriented

Saat ini section diberi heading:

```text
RINGKASAN PENCATATAN
```

Ini cukup formal dan terasa seperti dashboard.

Untuk petugas lapangan, informasi yang lebih penting adalah:

```text
38 dari 50 selesai
12 belum dicatat
```

### Rekomendasi

Gunakan:

```text
Progress Pencatatan

38 dari 50 pelanggan
████████████░░ 76%

12 pelanggan belum dicatat
```

Jika belum selesai, tambahkan CTA:

```text
[ Lanjut Pelanggan Berikutnya ]
```

Ini membuat dashboard lebih actionable.

---

# 7. Search Field Sudah Baik, Tapi Bisa Lebih Efisien

Search field saat ini cukup jelas.

Namun petugas kemungkinan besar menggunakan search ketika:

- mencari pelanggan tertentu;
- mencari berdasarkan nomor meter;
- berada di lokasi rumah tertentu.

### Rekomendasi Placeholder

Lebih pendek:

```text
Cari pelanggan atau nomor meter...
```

Detail kemampuan search tidak harus dijelaskan seluruhnya di placeholder.

---

# 8. Filter Chips Perlu Hierarki Lebih Jelas

Saat ini:

```text
Semua 1
Belum Dicatat 0
Sudah Dicatat 1
```

sudah benar, tetapi ketika digunakan untuk pekerjaan lapangan, filter **Belum Dicatat** seharusnya lebih penting daripada `Semua`.

### Rekomendasi urutan

```text
Belum Dicatat
Semua
Sudah Dicatat
```

atau tetap:

```text
Semua
Belum Dicatat
Sudah Dicatat
```

tetapi saat halaman dibuka dan masih ada pekerjaan, default filter dapat diarahkan ke:

```text
Belum Dicatat
```

Ini mempercepat pekerjaan petugas.

Jika semua sudah selesai, default dapat kembali ke:

```text
Semua
```

---

# 9. Customer Card Terlalu Banyak Informasi Sejajar

Card saat ini menampilkan:

```text
Nama
Nomor pelanggan
Status
Ubah

0 m³ → 1.256 m³
Pemakaian 1.256 m³
```

Masalahnya, terlalu banyak elemen bersaing dalam satu garis horizontal.

Pada mobile, hierarchy bisa dibuat lebih kuat.

### Rekomendasi Struktur

```text
mohammad zainul irfan
PAM-000001

✓ Sudah Dicatat

Meter
0 → 1.256 m³

Pemakaian
1.256 m³

[ Lihat / Ubah ]
```

atau versi yang lebih compact:

```text
mohammad zainul irfan
PAM-000001                  ✓ Sudah Dicatat

Meter
0 → 1.256 m³

Pemakaian 1.256 m³

                                  Ubah >
```

---

# 10. Masalah Data "0 m³ → 1.256 m³"

Pada screenshot terdapat:

```text
0 m³ → 1.256 m³
Pemakaian 1.256 m³
```

Jika ini adalah pencatatan pertama pelanggan, secara UX angka `0 m³` dapat membuat pengguna mengira meter sebelumnya memang bernilai nol.

Padahal kemungkinan sebenarnya belum ada pencatatan sebelumnya.

### Rekomendasi

Untuk pelanggan tanpa histori:

```text
Meter sebelumnya
Belum ada

Meter sekarang
1.256 m³
```

Dan pemakaian dapat ditampilkan:

```text
Pemakaian periode
Belum dapat dihitung
```

atau jika aturan bisnis memang memperbolehkan baseline `0`, berikan label yang jelas:

```text
Meter awal
0 m³

Meter sekarang
1.256 m³
```

Jangan menggunakan format panah jika data awal sebenarnya belum tersedia.

---

# 11. Pemakaian Perlu Menjadi Informasi Utama

Tujuan pencatatan meter bukan hanya menyimpan angka meter, tetapi menghasilkan:

```text
Pemakaian
```

Karena itu hierarchy sebaiknya:

```text
Meter sebelumnya
1.250 m³

Meter sekarang
1.265 m³

Pemakaian
15 m³
```

Pada list, cukup:

```text
1.250 → 1.265 m³
Pemakaian 15 m³
```

Nilai `15 m³` dapat dibuat sedikit lebih bold.

---

# 12. Tombol "Ubah" Kurang Menonjol sebagai Action

Label:

```text
Ubah
```

cukup pendek, tetapi tidak menjelaskan apa yang akan diubah.

### Rekomendasi

Untuk status sudah dicatat:

```text
Lihat
```

kemudian dari detail pengguna dapat memilih:

```text
Ubah Pencatatan
```

Alternatif:

```text
Ubah Meter
```

tetapi secara domain lebih tepat:

```text
Ubah Pencatatan
```

---

# 13. Card Belum Dicatat Harus Berbeda dari Card Sudah Dicatat

Saat ini desain hanya terlihat untuk status sudah dicatat.

Untuk UX lapangan, card **Belum Dicatat** sebaiknya mempunyai CTA yang sangat jelas.

Contoh:

```text
Budi Santoso
PAM-000123

Meter sebelumnya
1.250 m³

Belum dicatat

[ Catat Meter ]
```

CTA `Catat Meter` harus menjadi primary action.

---

# 14. Rekomendasi Card — Belum Dicatat

```text
┌───────────────────────────────┐
│ Budi Santoso                  │
│ PAM-000123                    │
│                               │
│ Meter sebelumnya              │
│ 1.250 m³                      │
│                               │
│ Belum dicatat                 │
│                               │
│ [       Catat Meter       ]   │
└───────────────────────────────┘
```

Jika banyak pelanggan, versi compact:

```text
Budi Santoso
PAM-000123

Meter terakhir 1.250 m³

[ Catat Meter ]
```

---

# 15. Rekomendasi Card — Sudah Dicatat

Card selesai tidak perlu CTA besar.

```text
┌───────────────────────────────┐
│ Budi Santoso      ✓ Dicatat   │
│ PAM-000123                    │
│                               │
│ 1.250 → 1.265 m³              │
│ Pemakaian 15 m³               │
│                               │
│                          Lihat │
└───────────────────────────────┘
```

Dengan demikian card yang belum selesai akan lebih menonjol dibanding card yang sudah selesai.

---

# 16. Status Badge

Badge:

```text
Sudah Dicatat
```

sudah tepat.

Rekomendasi status:

```text
Belum Dicatat
→ Neutral / Amber

Sudah Dicatat
→ Green

Perlu Dicek
→ Amber

Bermasalah
→ Red
```

Gunakan background tint ringan, bukan warna penuh.

---

# 17. Tambahkan State "Perlu Dicek"

Akan berguna jika sistem nantinya mendeteksi:

- meter sekarang lebih kecil;
- pemakaian sangat tinggi;
- foto meter tidak jelas;
- angka tidak wajar.

Status:

```text
Perlu Dicek
```

Contoh:

```text
⚠ Pemakaian 185 m³
Jauh di atas rata-rata pelanggan.
```

Untuk MVP ini dapat disiapkan sebagai desain state meskipun logic belum dibuat.

---

# 18. Flow Petugas Harus Lebih Cepat

Flow ideal:

```text
Buka Catat Meter
↓
Default: Belum Dicatat
↓
Pilih pelanggan
↓
Input meter
↓
Simpan
↓
Kembali ke daftar
↓
Pelanggan otomatis berubah menjadi Sudah Dicatat
↓
Pelanggan belum dicatat berikutnya berada di posisi teratas
```

Lebih baik lagi:

```text
Simpan & Lanjut
```

setelah input meter.

---

# 19. Tambahkan CTA "Simpan & Lanjut"

Pada form pencatatan meter, gunakan dua opsi:

```text
[ Simpan ]

[ Simpan & Lanjut ]
```

atau cukup satu primary action:

```text
[ Simpan & Lanjut ]
```

Jika petugas mencatat rumah satu per satu, ini dapat menghemat banyak tap.

---

# 20. Sort Order

Urutan daftar sebaiknya membantu pekerjaan.

Default:

```text
Belum Dicatat
↓
Sudah Dicatat
```

Bukan semata alfabetis.

Di dalam kelompok dapat diurutkan berdasarkan:

- nomor pelanggan;
- nama;
- zona/blok jika nanti tersedia.

---

# 21. Empty State

### Jika Tidak Ada Pelanggan

```text
Belum ada pelanggan

Tambahkan pelanggan terlebih dahulu
sebelum melakukan pencatatan meter.

[ Tambah Pelanggan ]
```

### Jika Filter Belum Dicatat Kosong

```text
✓ Semua selesai

Tidak ada meter yang belum dicatat
untuk Agustus 2026.
```

### Jika Search Tidak Menemukan Data

```text
Pelanggan tidak ditemukan

Coba nama atau nomor meter lainnya.
```

---

# 22. Sticky Search / Filter

Jika jumlah pelanggan banyak, search dan filter sebaiknya dapat tetap mudah diakses.

Pada daftar panjang, pertimbangkan:

```text
Sticky:
Search
Filter tabs
```

ketika pengguna scroll.

Header utama tidak harus sticky jika ruang layar terbatas.

---

# 23. Bottom Navigation

Bottom navigation saat ini:

```text
Home
Pelanggan
Catat Meter
Tagihan
Lainnya
```

sudah cukup cocok.

`Catat Meter` sebagai label lebih baik dibanding `Pencatatan Meter` karena:

- lebih pendek;
- lebih action-oriented;
- mudah dibaca pada layar kecil.

Active state biru sudah tepat.

---

# 24. Dev Overlay di Sudut Kiri Bawah

Pada screenshot terlihat lingkaran merah dengan huruf `N`.

Jika itu berasal dari development tooling, pastikan tidak tampil pada build production/PWA yang digunakan pengguna.

Ini bukan bagian dari UI aplikasi dan dapat mengganggu bottom navigation.

---

# 25. Spacing

Secara umum spacing saat ini sudah cukup lega, tetapi area daftar dapat dibuat sedikit lebih efisien.

Rekomendasi:

```text
Page horizontal padding    16px
Section gap                20–24px
Card padding               16px
Card radius                14–16px
Input height               44–48px
Filter chip height         32–36px
Bottom nav                 64–72px
```

---

# 26. Typography

Rekomendasi hierarchy:

```text
Page title
22–24px / Semibold

Customer name
15–16px / Semibold

Section label
12px / Semibold / uppercase optional

Body
14px / Regular

Secondary text
12–14px / Regular

Important meter value
16–18px / Semibold
```

Hindari penggunaan terlalu banyak bold di dalam satu card.

---

# 27. Recommended Layout

```text
┌────────────────────────────────┐
│ 💧 Alira                    A  │
├────────────────────────────────┤
│                                │
│ Pencatatan Meter               │
│                                │
│ Periode                        │
│ [ Agustus 2026             ▾ ] │
│                                │
│ Progress Pencatatan            │
│                                │
│ 38 dari 50 pelanggan      76%  │
│ █████████████░░░░              │
│                                │
│ 12 pelanggan belum dicatat     │
│                                │
│ [ Cari pelanggan / meter... ]  │
│                                │
│ [Belum Dicatat 12] [Semua 50] │
│ [Sudah Dicatat 38]             │
│                                │
│ ┌────────────────────────────┐ │
│ │ Budi Santoso               │ │
│ │ PAM-000123                 │ │
│ │                            │ │
│ │ Meter sebelumnya           │ │
│ │ 1.250 m³                   │ │
│ │                            │ │
│ │ [      Catat Meter      ]  │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ Siti Aminah     ✓ Dicatat │ │
│ │ PAM-000124                 │ │
│ │                            │ │
│ │ 1.132 → 1.145 m³           │ │
│ │ Pemakaian 13 m³       Lihat│ │
│ └────────────────────────────┘ │
│                                │
├────────────────────────────────┤
│ Home Pelanggan Meter Tagihan … │
└────────────────────────────────┘
```

---

# 28. Layout Saat 100% Selesai

Saat semua meter selesai, redesign sebaiknya lebih compact.

```text
Pencatatan Meter

[ Agustus 2026 ▾ ]

┌───────────────────────────────┐
│ ✓ Pencatatan selesai         │
│                               │
│ 50 dari 50 pelanggan sudah   │
│ dicatat untuk Agustus 2026.  │
└───────────────────────────────┘

[ Cari pelanggan / meter... ]

[ Semua 50 ] [ Sudah Dicatat 50 ]

Siti Aminah              ✓ Dicatat
PAM-000124

1.132 → 1.145 m³
Pemakaian 13 m³

                              Lihat
```

Tidak perlu progress bar penuh karena status selesai sudah cukup jelas.

---

# 29. Prioritas Redesign

## Priority 1 — Hierarki

1. Hilangkan periode yang tampil dua kali.
2. Buat selector periode sebagai satu-satunya sumber periode.
3. Sederhanakan summary progress.
4. Bedakan card `Belum Dicatat` dan `Sudah Dicatat`.

## Priority 2 — Workflow Petugas

5. Jadikan `Belum Dicatat` sebagai fokus utama ketika masih ada pekerjaan.
6. Tambahkan CTA `Catat Meter`.
7. Setelah simpan, arahkan ke pelanggan berikutnya.
8. Pertimbangkan `Simpan & Lanjut`.

## Priority 3 — Data Display

9. Perjelas `Meter sebelumnya`, `Meter sekarang`, dan `Pemakaian`.
10. Jangan tampilkan `0 m³` sebagai meter sebelumnya jika sebenarnya belum ada histori.
11. Perkuat hierarchy nilai pemakaian.

## Priority 4 — Search & Filter

12. Pendekkan placeholder search.
13. Pertahankan count di filter.
14. Pertimbangkan sticky search/filter untuk daftar panjang.

## Priority 5 — State

15. Buat empty state.
16. Buat success state 100%.
17. Siapkan state `Perlu Dicek`.
18. Pastikan dev overlay tidak tampil di production.

---

# 30. UX Principle

Halaman ini sebaiknya mengikuti prinsip:

> **Belum dikerjakan harus lebih terlihat daripada yang sudah selesai.**

Karena pekerjaan petugas adalah menyelesaikan sisa pencatatan, bukan membaca histori.

Urutan informasi:

```text
Apa periodenya?
↓
Berapa yang belum selesai?
↓
Siapa yang harus dicatat?
↓
Berapa meter sebelumnya?
↓
Catat meter sekarang
↓
Lanjut pelanggan berikutnya
```

---

# 31. Acceptance Criteria Redesign

Redesign dianggap berhasil jika:

- Pengguna memahami periode aktif tanpa informasi duplikat.
- Pengguna dapat mengetahui progress dalam kurang dari 2 detik.
- Pelanggan yang belum dicatat lebih mudah ditemukan.
- Action `Catat Meter` terlihat jelas.
- Petugas dapat mencari pelanggan dengan cepat.
- Data meter sebelumnya, sekarang, dan pemakaian mudah dibedakan.
- Status selesai tidak mendominasi halaman.
- Daftar tetap nyaman digunakan untuk puluhan hingga ratusan pelanggan.
- Flow pencatatan dapat dilakukan dengan jumlah tap minimal.
- Halaman tetap nyaman pada viewport 360–430px.

---

# 32. Kesimpulan

Desain saat ini sudah cukup baik sebagai MVP dan tidak membutuhkan perubahan total.

Redesign sebaiknya fokus pada **workflow**, bukan sekadar visual.

Perubahan paling penting:

1. Hilangkan duplikasi periode.
2. Ringkas progress saat sudah 100%.
3. Jadikan pelanggan `Belum Dicatat` sebagai fokus.
4. Bedakan visual card belum/sudah dicatat.
5. Perjelas data meter dan pemakaian.
6. Optimalkan flow `Catat → Simpan → Lanjut`.

Target akhirnya:

> **Petugas membuka halaman dan langsung tahu siapa yang belum dicatat serta bisa menyelesaikan pencatatan dengan sesedikit mungkin tap.**
