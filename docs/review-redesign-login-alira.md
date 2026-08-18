# Review & Redesign Plan — Halaman Login Alira

## 1. Ringkasan

Halaman login saat ini sudah memiliki fondasi yang baik untuk aplikasi PWA:

- Branding **Alira** terlihat jelas.
- Login sederhana menggunakan passcode 6 digit.
- Tidak terlalu banyak elemen.
- Warna biru sesuai dengan konteks aplikasi air/PAM.
- Tombol masuk cukup besar untuk penggunaan mobile.

Namun dari sisi UI/UX, halaman masih terasa seperti gabungan dua card besar yang belum menyatu secara visual. Hierarki, spacing, posisi form, dan pola input passcode masih bisa dibuat lebih ringkas dan lebih nyaman untuk penggunaan sehari-hari.

Arah redesign yang disarankan:

> **Simple utility login, mobile-first, cepat dibaca, cepat diisi, dan tidak terasa seperti form login web tradisional.**

---

## 2. Review UI Saat Ini

### Yang Sudah Baik

#### Branding jelas

Bagian hero sudah menunjukkan:

- Logo.
- Nama aplikasi.
- Tagline.

```text
Alira
Kelola air, meter, dan tagihan dalam satu tempat.
```

Ini sudah cukup menjelaskan fungsi aplikasi.

#### Warna brand sesuai konteks

Biru cocok dengan aplikasi pengelolaan air karena memberi kesan bersih, aman, terpercaya, dan tenang. Warna ini sebaiknya tetap dipertahankan sebagai primary color.

#### CTA mudah ditemukan

Button **Masuk** memiliki ukuran cukup besar dan kontras yang baik. Untuk PWA/mobile ini sudah tepat.

#### Flow sederhana

```text
Buka aplikasi
↓
Masukkan passcode
↓
Masuk
```

Tidak ada langkah yang tidak perlu.

---

## 3. Masalah UI/UX Utama

### 3.1 Terlalu banyak ruang kosong di bagian atas

Hero/login card berada cukup jauh dari bagian atas layar. Akibatnya layar terasa kosong dan form terdorong terlalu jauh ke bawah.

Untuk PWA yang sering digunakan petugas, login sebaiknya terasa cepat dan langsung.

**Rekomendasi:** kurangi ruang kosong atas dan gunakan top padding sekitar `72–96px`, bukan menempatkan card mendekati tengah vertikal layar.

---

### 3.2 Hero card terlalu besar

Hero biru menggunakan area cukup tinggi padahal hanya berisi logo, nama Alira, dan tagline.

Hero tidak perlu menjadi card besar.

**Redesign:** gunakan branding yang lebih compact:

```text
        ◉
      Alira

Kelola air, meter, dan tagihan
dalam satu tempat.
```

Tidak harus menggunakan background biru penuh. Primary color cukup digunakan pada logo, button, focus state, link, dan accent.

---

### 3.3 Hero dan form kurang menyatu

Saat ini komposisinya:

```text
Hero biru
↓
Gap
↓
Card login putih
```

Secara visual terlihat seperti dua komponen berbeda.

Untuk login sederhana, tidak perlu dua card.

**Rekomendasi:** gunakan satu komposisi:

```text
Logo

Alira
Tagline

Masuk ke Alira
Masukkan passcode...

Passcode
[ • ][ • ][ • ][ • ][ • ][ • ]

[ Masuk ]
```

Hasilnya akan terasa lebih sederhana, modern, dan lebih cocok sebagai PWA.

---

## 4. Input Passcode Perlu Diubah

Ini bagian redesign paling penting.

Saat ini passcode menggunakan text input biasa dengan placeholder yang diberi letter-spacing besar. Untuk passcode 6 digit, pola ini kurang natural.

### Rekomendasi

Gunakan OTP / PIN input.

```text
Passcode

┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ •│ │ •│ │ •│ │ •│ │ •│ │ •│
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘
```

Atau:

```text
[ •  •  •  •  •  • ]
```

Pilihan pertama lebih disarankan karena jumlah digit langsung terlihat.

### UX benefit

Pengguna langsung tahu:

- Harus memasukkan 6 digit.
- Berapa digit yang sudah terisi.
- Tidak perlu membaca placeholder panjang.

Pada mobile gunakan:

```text
inputMode="numeric"
pattern="[0-9]*"
```

agar keyboard angka langsung muncul.

---

## 5. Autofocus

Ketika halaman login dibuka, input passcode sebaiknya langsung aktif.

```text
Aplikasi dibuka
↓
Passcode autofocus
↓
Keyboard angka muncul
↓
User mengetik 6 digit
```

Ini penting untuk aplikasi yang digunakan berulang kali.

---

## 6. Auto Submit

Karena passcode selalu 6 digit, aplikasi dapat mendukung auto-submit setelah digit ke-6 dimasukkan.

```text
123456
↓
Validasi
↓
Login
```

Untuk MVP, tombol **Masuk** tetap disarankan agar flow lebih eksplisit. Auto-submit dapat menjadi enhancement berikutnya.

---

## 7. Copywriting

### Saat ini

```text
Masuk
Gunakan passcode 6 digit untuk mengelola Alira.
```

### Rekomendasi

Heading:

```text
Masuk ke Alira
```

Description:

```text
Masukkan passcode 6 digit untuk melanjutkan.
```

Button:

```text
Masuk
```

Copy ini lebih singkat dan langsung.

---

## 8. Footer

Teks:

```text
Dikelola oleh pengurus PAM setempat
```

tidak terlalu penting untuk proses login.

Jika tetap ingin digunakan sebagai trust message, pindahkan ke footer halaman agar tidak terlalu dekat dengan tombol login.

Contoh:

```text
Alira
Dikelola oleh pengurus PAM setempat
```

---

## 9. Icon pada Tombol

Icon gembok dapat dipertahankan, tetapi tidak wajib. CTA sederhana:

```text
Masuk
```

sudah cukup jelas.

Jika icon digunakan, jadikan secondary cue dan jangan terlalu dominan.

---

## 10. Border, Radius, dan Card

Form sekarang memiliki card putih, border, dan radius besar. Pola ini masih aman, tetapi untuk arah desain Alira yang clean sebaiknya lebih ringan.

Rekomendasi:

```text
Border radius card : 16–20px
Border              : #E2E8F0
Shadow              : sangat tipis / none
```

Hindari terlalu banyak shadow.

---

## 11. Background

Background abu-abu sangat muda sudah cocok.

Rekomendasi:

```text
Page Background
#F8FAFC

Surface
#FFFFFF
```

Alternatif: gunakan `#FFFFFF` penuh untuk login yang lebih minimal.

---

## 12. Rekomendasi Color System

```text
Primary
#0EA5E9

Primary Hover
#0284C7

Background
#F8FAFC

Surface
#FFFFFF

Text Primary
#0F172A

Text Secondary
#64748B

Border
#E2E8F0

Error
#DC2626
```

---

## 13. Error State

Login harus memiliki error state yang jelas dan dekat dengan input.

Contoh:

```text
Passcode

[ • ][ • ][ • ][ • ][ • ][ • ]

Passcode tidak sesuai.
Silakan coba lagi.
```

Input dapat menggunakan border merah tipis.

Jangan hanya mengandalkan toast karena error langsung berkaitan dengan field passcode.

---

## 14. Loading State

Setelah tombol **Masuk** ditekan:

```text
[ Memeriksa... ]
```

Button harus:

- Disabled.
- Menampilkan loading spinner.
- Mencegah double submit.

---

## 15. Failed Attempt UX

Jika passcode salah:

```text
Passcode salah.
Silakan coba lagi.
```

Setelah itu:

- Input dikosongkan.
- Autofocus kembali.
- Keyboard tetap aktif.

Ini membuat proses retry lebih cepat.

---

## 16. Touch Target

Untuk PWA/mobile:

```text
Button height      : 48–52px
OTP field height   : 48–56px
Minimum touch area : 44px
```

OTP field jangan terlalu kecil.

---

## 17. Typography

Rekomendasi hierarchy:

```text
Alira
24–28px / Semibold

Heading
22–24px / Semibold

Description
14–16px / Regular

Label
14px / Medium

Button
14–16px / Medium/Semibold
```

Hindari terlalu banyak variasi ukuran font.

---

## 18. Layout Redesign

Struktur yang disarankan:

```text
┌───────────────────────────────┐
│                               │
│             ◉                 │
│           Alira               │
│                               │
│ Kelola air, meter, dan        │
│ tagihan dalam satu tempat.    │
│                               │
│        Masuk ke Alira         │
│                               │
│ Masukkan passcode 6 digit     │
│ untuk melanjutkan.            │
│                               │
│ Passcode                      │
│                               │
│ [_] [_] [_] [_] [_] [_]      │
│                               │
│ [          Masuk          ]   │
│                               │
│                               │
│ Dikelola oleh pengurus        │
│ PAM setempat                  │
│                               │
└───────────────────────────────┘
```

---

## 19. Alternatif Layout yang Lebih Minimal

Untuk aplikasi internal PAM, versi ini lebih disarankan:

```text
┌───────────────────────────────┐
│                               │
│             💧                │
│            Alira              │
│                               │
│ Kelola air, meter, dan        │
│ tagihan dalam satu tempat.    │
│                               │
│                               │
│ Masuk ke Alira                │
│                               │
│ Masukkan passcode Anda.       │
│                               │
│ [_] [_] [_] [_] [_] [_]      │
│                               │
│ [          Masuk          ]   │
│                               │
│                               │
│          Alira v1.0           │
│                               │
└───────────────────────────────┘
```

Tidak perlu hero card biru besar.

Primary color tetap terasa melalui:

- Logo.
- Focus ring.
- Button.

---

## 20. Recommended Final Direction

Arah yang paling direkomendasikan:

> **Minimal single-column login tanpa hero card besar.**

Komposisi:

```text
Logo
↓
Alira
↓
Tagline
↓
Masuk ke Alira
↓
Helper text
↓
OTP / Passcode Input
↓
Button
↓
Footer kecil
```

Alasannya:

- Login hanya memiliki satu pekerjaan.
- Tidak membutuhkan banyak card.
- Lebih cepat digunakan petugas.
- Lebih terasa seperti aplikasi mobile daripada website.
- Visual lebih bersih.
- Brand tetap kuat tanpa mendominasi layar.

---

## 21. Prioritas Redesign

### Priority 1 — UX Passcode

1. Ubah text input menjadi OTP/PIN input 6 digit.
2. Gunakan numeric keyboard.
3. Autofocus input saat halaman dibuka.
4. Tambahkan error state.
5. Tambahkan loading state.

### Priority 2 — Layout

6. Kurangi ruang kosong bagian atas.
7. Hilangkan hero card biru besar.
8. Gabungkan branding dan form menjadi satu komposisi.
9. Perkecil jumlah container/card.

### Priority 3 — Copywriting

10. Ubah heading menjadi **Masuk ke Alira**.
11. Ubah description menjadi:

```text
Masukkan passcode 6 digit untuk melanjutkan.
```

12. Pindahkan teks pengurus PAM ke footer.

### Priority 4 — Visual

13. Pertahankan biru sebagai primary.
14. Gunakan background netral.
15. Kurangi border dan dekorasi.
16. Konsistenkan spacing dan radius.

---

## 22. Flow Login Baru

```text
Buka Alira
↓
Input passcode langsung autofocus
↓
Keyboard angka muncul
↓
Masukkan 6 digit
↓
Tekan Masuk
↓
Loading
↓
Validasi
├── Benar → Dashboard
└── Salah → Error + input reset + autofocus
```

---

## 23. Acceptance Criteria Redesign

Redesign dianggap berhasil jika:

- Pengguna langsung memahami bahwa mereka harus memasukkan passcode.
- Keyboard angka muncul secara otomatis.
- Jumlah digit passcode terlihat jelas.
- User dapat login dengan satu flow sederhana.
- Error dapat dipahami tanpa toast tambahan.
- Retry dapat dilakukan tanpa tap input lagi.
- CTA mudah dijangkau dengan satu tangan.
- Halaman tetap terlihat baik pada layar 360–430px.
- Branding Alira tetap terlihat tanpa mendominasi layar.

---

## 24. Kesimpulan

Halaman login saat ini tidak memiliki masalah besar secara fungsi. Masalah utamanya adalah komposisi yang masih terasa seperti halaman web dengan dua card besar.

Redesign sebaiknya tidak menambah elemen baru, tetapi justru **mengurangi elemen**.

Prinsip utamanya:

> **Logo → Passcode → Masuk.**

Untuk aplikasi Alira yang digunakan secara rutin oleh pengurus/petugas PAM, login harus terasa seperti pintu masuk cepat ke aplikasi, bukan halaman pemasaran.
