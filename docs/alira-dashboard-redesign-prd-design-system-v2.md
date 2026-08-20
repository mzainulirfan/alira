# Alira — Dashboard Redesign
## Design System + PRD Implementasi (Junior-Friendly)

**Dokumen:** Product Requirements Document + UI Design System  
**Produk:** Alira  
**Halaman:** Dashboard Admin/Petugas  
**Versi:** 2.0  
**Status:** Siap dijadikan acuan implementasi  
**Target stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui  
**Target platform:** Mobile-first Web App / PWA  
**Bahasa UI:** Indonesia  
**Prioritas:** Mobile terlebih dahulu, kemudian tablet dan desktop

---

# 0. Cara Menggunakan Dokumen Ini

Dokumen ini sengaja dibuat lebih detail agar developer junior dapat mengimplementasikan dashboard tanpa perlu banyak menebak.

Urutan kerja yang disarankan:

1. Baca bagian **Tujuan Produk** agar memahami konteks dashboard.
2. Baca **Struktur Halaman** untuk mengetahui urutan section.
3. Terapkan **Design System** terlebih dahulu.
4. Buat komponen satu per satu sesuai **Spesifikasi Komponen**.
5. Gunakan data mock sampai tampilan stabil.
6. Setelah UI selesai, hubungkan data real.
7. Tambahkan loading, empty state, error state, dan responsive.
8. Jalankan checklist QA sebelum dianggap selesai.

> Penting: jangan langsung membuat satu file `page.tsx` yang sangat besar. Dashboard wajib dipecah menjadi komponen kecil agar mudah dirawat.

---

# 1. Latar Belakang

Dashboard Alira versi saat ini sudah mampu menampilkan informasi utama seperti:

- Jumlah pelanggan.
- Progress pencatatan meter.
- Status tagihan.
- Meter yang belum dicatat.
- Arus kas.
- Aktivitas terbaru.
- Shortcut menuju fitur utama.

Masalah utamanya adalah dashboard masih terasa seperti kumpulan card dan angka.

Redesign ini mempertahankan fungsi lama, tetapi menambahkan:

- Hero illustration bertema layanan air.
- Hierarki visual yang lebih jelas.
- Quick action yang lebih menarik.
- Metric card yang lebih informatif.
- Section "Perlu Tindakan" yang lebih menonjol.
- Arus kas yang memiliki visual pendukung.
- Spacing dan typography yang lebih konsisten.
- Identitas visual Alira yang lebih kuat.

---

# 2. Tujuan Produk

## 2.1 Tujuan utama

Dashboard harus membantu admin/petugas mengetahui kondisi operasional Alira dalam waktu singkat.

Pengguna harus dapat langsung mengetahui:

1. Berapa pelanggan yang dikelola.
2. Berapa meter yang sudah dicatat.
3. Berapa meter yang belum dicatat.
4. Apakah ada tagihan belum lunas.
5. Berapa pemasukan bulan ini.
6. Berapa pengeluaran bulan ini.
7. Berapa saldo bersih.
8. Apa aktivitas terbaru.
9. Aksi apa yang paling perlu dilakukan berikutnya.

## 2.2 Tujuan visual

Dashboard baru harus terasa:

- Modern.
- Bersih.
- Ramah.
- Tidak terlalu formal.
- Tidak seperti dashboard IoT industri.
- Tetap profesional untuk aplikasi operasional.
- Lebih visual tanpa menjadi dekoratif berlebihan.

## 2.3 Non-goals

Versi ini **tidak** bertujuan:

- Membuat dashboard analytics yang kompleks.
- Menambahkan chart besar dengan banyak filter.
- Menambahkan AI.
- Menambahkan forecasting.
- Menambahkan fitur baru di luar kebutuhan dashboard.
- Mengubah seluruh navigation architecture aplikasi.
- Mengubah business rule tagihan/meter.

---

# 3. Pengguna Utama

## 3.1 Admin

Admin menggunakan dashboard untuk:

- Melihat ringkasan operasional.
- Mengelola pelanggan.
- Memantau pencatatan meter.
- Memantau tagihan.
- Melihat arus kas.
- Melihat aktivitas terbaru.

## 3.2 Petugas lapangan

Petugas lapangan terutama membutuhkan:

- Shortcut ke Catat Meter.
- Informasi meter belum dicatat.
- Progress pencatatan bulan berjalan.
- Daftar pelanggan/meter yang perlu dikunjungi.

---

# 4. Prinsip UX

## 4.1 Action first

Dashboard bukan sekadar laporan.

Informasi yang memerlukan tindakan harus lebih mudah terlihat dibanding data yang hanya bersifat informatif.

Urutan prioritas UX:

1. Quick Action.
2. Perlu Tindakan.
3. Progress Meter.
4. Status Tagihan.
5. Arus Kas.
6. Aktivitas Terbaru.

## 4.2 Scanable

Pengguna harus dapat memahami informasi tanpa membaca banyak teks.

Gunakan:

- Angka besar.
- Label singkat.
- Progress bar.
- Status badge.
- Icon.
- Warna semantic.
- Section title yang jelas.

## 4.3 Progressive disclosure

Dashboard hanya menampilkan ringkasan.

Detail dibuka melalui:

- Card click.
- `Lihat semua`.
- `Lihat detail`.
- Chevron.
- Navigation ke halaman terkait.

## 4.4 Illustration sebagai pendukung

Illustration digunakan untuk:

- Menguatkan identitas Alira.
- Memberi konteks visual.
- Membuat dashboard terasa lebih human.
- Mengurangi kesan dashboard sebagai spreadsheet.

Illustration **tidak boleh**:

- Menutupi data penting.
- Mengganggu keterbacaan.
- Mengambil area terlalu besar.
- Muncul di setiap card.
- Membuat UI terasa seperti aplikasi anak-anak.

---

# 5. Struktur Halaman

Urutan dashboard:

```text
App Header
↓
Dashboard Header + Month Selector
↓
Hero Illustration
↓
Quick Actions
↓
Operational Summary
↓
Perlu Tindakan
↓
Arus Kas
↓
Aktivitas Terbaru
↓
Bottom Navigation
```

---

# 6. Target Ukuran Layar

## Mobile utama

Desain harus dites minimal di:

```text
360 × 800
375 × 812
390 × 844
412 × 915
430 × 932
```

## Tablet

```text
768 px
820 px
1024 px
```

## Desktop

```text
1280 px
1366 px
1440 px
```

---

# 7. Layout Global

## 7.1 Mobile

```text
Page width      : 100%
Page padding    : 16 px
Section gap     : 24 px
Card gap        : 12–16 px
Max content     : 100%
```

## 7.2 Tablet

```text
Page padding    : 24 px
Max content     : 960 px
```

## 7.3 Desktop

```text
Page padding    : 32 px
Max content     : 1200–1280 px
Center content  : yes
```

Contoh container:

```tsx
<div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
  ...
</div>
```

---

# 8. Design System

# 8.1 Typography

## Font utama

Gunakan:

```text
Inter
```

Fallback:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

## Skala typography

### Page Title

```text
Mobile:
28 px / 34 px
font-weight: 700

Desktop:
32 px / 40 px
font-weight: 700
```

### Section Title

```text
18 px / 26 px
font-weight: 600 atau 700
```

### Card Title

```text
15–16 px / 22–24 px
font-weight: 600
```

### Metric Number

```text
24–30 px
font-weight: 700
```

### Body

```text
14 px / 20 px
font-weight: 400
```

### Supporting Text

```text
13 px / 19 px
font-weight: 400
```

### Caption

```text
12 px / 18 px
font-weight: 400–500
```

---

# 8.2 Color Tokens

## Brand Blue

```css
--brand-50:  #EFF6FF;
--brand-100: #DBEAFE;
--brand-200: #BFDBFE;
--brand-300: #93C5FD;
--brand-400: #60A5FA;
--brand-500: #3B82F6;
--brand-600: #2563EB;
--brand-700: #1D4ED8;
--brand-800: #1E40AF;
--brand-900: #1E3A8A;
```

Penggunaan:

```text
Primary button       brand-600
Active nav           brand-600
Heading emphasis     brand-900
Hero accent          brand-50 / brand-100
```

## Teal

```css
--teal-50:  #F0FDFA;
--teal-100: #CCFBF1;
--teal-500: #14B8A6;
--teal-600: #0D9488;
```

Penggunaan:

- Meter.
- Progress.
- Utility status.
- Secondary accent.

## Green

```css
--green-50:  #F0FDF4;
--green-100: #DCFCE7;
--green-500: #22C55E;
--green-600: #16A34A;
```

Penggunaan:

- Lunas.
- Pemasukan.
- Success.

## Orange

```css
--orange-50:  #FFF7ED;
--orange-100: #FFEDD5;
--orange-400: #FB923C;
--orange-500: #F97316;
```

Penggunaan:

- Perlu Tindakan.
- Warning.
- Meter belum dicatat.

## Red

```css
--red-50:  #FEF2F2;
--red-500: #EF4444;
--red-600: #DC2626;
```

Penggunaan:

- Pengeluaran.
- Error.
- Overdue / critical state.

## Purple

```css
--purple-50:  #FAF5FF;
--purple-100: #F3E8FF;
--purple-500: #A855F7;
--purple-600: #9333EA;
```

Penggunaan:

- Tagihan.
- Financial secondary accent.

## Neutral

```css
--slate-50:  #F8FAFC;
--slate-100: #F1F5F9;
--slate-200: #E2E8F0;
--slate-300: #CBD5E1;
--slate-400: #94A3B8;
--slate-500: #64748B;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1E293B;
--slate-900: #0F172A;
```

---

# 8.3 Spacing

Gunakan 4 px base grid.

```text
4 px    xs
8 px    sm
12 px   md
16 px   base
20 px   lg
24 px   xl
32 px   2xl
40 px   3xl
48 px   4xl
```

Aturan:

- Jangan menggunakan spacing random seperti 13 px atau 27 px kecuali benar-benar diperlukan.
- Spacing antar section utama: 24 px.
- Spacing title ke content: 12–16 px.
- Padding card umumnya: 16 px.

---

# 8.4 Border Radius

```text
Small control       8 px
Button              10–12 px
Input               10–12 px
Standard card       16 px
Hero                20–24 px
Large section       20 px
Badge               999 px
Avatar              999 px
```

---

# 8.5 Border

Default:

```css
border: 1px solid #E2E8F0;
```

Interactive hover:

```css
border-color: #BFDBFE;
```

---

# 8.6 Shadow

Gunakan shadow ringan.

Standard card:

```css
box-shadow:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 4px 12px rgba(15, 23, 42, 0.04);
```

Primary floating action:

```css
box-shadow:
  0 8px 24px rgba(37, 99, 235, 0.18);
```

Hindari:

- Shadow hitam pekat.
- Shadow besar di semua card.
- Multiple glowing shadow.

---

# 9. Icon System

Gunakan **Lucide Icons** untuk icon UI standar.

Website resmi:

https://lucide.dev/

Rekomendasi icon:

```text
Droplet
Gauge
Users
UserPlus
ReceiptText
WalletCards
Bell
CircleAlert
CalendarDays
ChevronRight
ChevronDown
Ellipsis
House
ClipboardList
CircleDollarSign
Plus
```

## Ukuran icon

```text
16 px : compact metadata
18 px : list
20 px : standard action
24 px : navigation / metric
28 px : decorative
```

## Stroke

Rekomendasi:

```text
stroke-width: 1.75–2
```

---

# 10. Illustration System

Illustration adalah perubahan visual terbesar pada dashboard baru.

## 10.1 Penting: sumber illustration pada mockup redesign

Illustration pada konsep dashboard yang dibuat dalam percakapan ini **bukan diambil dari library pihak ketiga**.

Hero yang menampilkan:

- Petugas memakai pakaian biru.
- Tablet.
- Meter air.
- Pipa.
- Rumah.
- Pelanggan.
- Vegetasi.

serta illustration kecil pada bagian **Arus Kas** dibuat sebagai **AI-generated visual concept menggunakan OpenAI image generation**.

Artinya:

- Tidak ada file Storyset/unDraw/DrawKit tertentu yang dipakai pada mockup tersebut.
- Developer tidak boleh mengklaim bahwa illustration mockup berasal dari library tertentu.
- Untuk production, illustration sebaiknya dibuat ulang menjadi asset terpisah agar kualitas, responsivitas, dan konsistensinya terkontrol.

---

# 10.2 Strategi illustration production

Ada 3 pilihan.

## Pilihan A — Custom illustration khusus Alira

**Paling direkomendasikan.**

Buat illustration dengan identitas Alira sendiri.

Keuntungan:

- Unik.
- Konsisten dengan brand.
- Bisa menampilkan meter air dan konteks lokal.
- Tidak terlihat generik.
- Tidak perlu memaksakan asset stock.

Asset minimum:

```text
dashboard-hero
cashflow
empty-no-activity
empty-no-action
error-state
```

---

## Pilihan B — AI-generated illustration

Boleh digunakan jika ingin style sangat dekat dengan konsep mockup.

Syarat:

- Generate per asset, bukan mengambil screenshot penuh dashboard.
- Simpan master image dengan resolusi tinggi.
- Crop transparan jika memungkinkan.
- Optimalkan ke WebP/AVIF.
- Pastikan tidak ada teks yang ikut tergenerate di illustration.
- Jangan generate icon UI dengan AI; icon UI tetap pakai Lucide.

---

## Pilihan C — Illustration library

Gunakan library jika membutuhkan implementasi lebih cepat.

Rekomendasi:

### 1. unDraw

Website:

https://undraw.co/

License:

https://undraw.co/license

Kelebihan:

- Gratis.
- Bisa dipakai untuk commercial/personal project sesuai license mereka.
- Attribution tidak diwajibkan.
- SVG mudah diubah warna.

Keyword pencarian:

```text
water
maintenance
home
data
finance
payment
analytics
people
```

Catatan:

- Kemungkinan sulit menemukan scene water meter yang sangat spesifik.
- Cocok untuk empty state atau supporting illustration.

---

### 2. ManyPixels Free Illustrations

Website:

https://www.manypixels.co/gallery

Kelebihan:

- Banyak style.
- Ada kategori Finance, People, Work, Environment.
- Dapat digunakan untuk personal/commercial sesuai license gallery mereka.
- Attribution tidak diwajibkan menurut license gallery.

Keyword:

```text
accountant
finance
customer
worker
home
water
maintenance
analytics
payment
```

Cocok untuk:

- Arus kas.
- Empty state.
- Customer-related illustration.

---

### 3. DrawKit

Website:

https://www.drawkit.com/

License:

https://www.drawkit.com/license

Kelebihan:

- Banyak illustration pack.
- Free dan Pro asset tersedia.
- Warna SVG dapat disesuaikan.
- License mengizinkan commercial/non-commercial use sesuai ketentuannya.

Keyword:

```text
finance
analytics
maintenance
home
customer
worker
utility
```

Catatan:

- Jangan redistribusi asset mentah.
- Periksa license kembali sebelum production karena ketentuan dapat berubah.

---

### 4. Storyset

Website:

https://storyset.com/

FAQ:

https://storyset.com/faqs

Kelebihan:

- Mudah mengganti warna.
- Bisa mengaktifkan/nonaktifkan layer.
- Bisa export SVG.
- Style Pana/Amico/Rafiki cukup cocok untuk Alira.

Keyword:

```text
maintenance
customer
finance
payment
documents
home
worker
water
```

Catatan penting:

- Free illustration Storyset memerlukan attribution.
- Jika tidak ingin attribution, cek opsi premium/license yang berlaku saat asset diunduh.
- Jangan mengasumsikan semua asset bebas attribution.

---

# 10.3 Rekomendasi final sumber illustration

Untuk Alira:

```text
Hero dashboard:
Custom / AI-generated Alira illustration

Cash flow:
Custom illustration atau ManyPixels/DrawKit

Empty state:
unDraw atau custom

UI icons:
Lucide Icons
```

Jangan mencampur terlalu banyak library.

Ideal:

```text
1 illustration style
+
1 icon library
```

---

# 10.4 Illustration style guide

Semua illustration Alira harus memiliki karakteristik:

```text
Style            Flat/semi-flat vector
Corner           Rounded
Outline          Minimal
Shading          Soft
Dominant color   Blue
Secondary        Teal/green
Accent           Purple/orange
Detail level     Medium
Character        Friendly professional
```

Hindari:

```text
Photorealistic
3D glossy
Anime
Cartoon anak
Heavy gradients
Neon
Dark industrial style
```

---

# 10.5 Asset naming

Gunakan naming konsisten.

```text
/public/illustrations/
  dashboard-hero.webp
  dashboard-cashflow.svg
  empty-activity.svg
  empty-action.svg
  error-dashboard.svg
```

Jika menggunakan dark mode di masa depan:

```text
dashboard-hero-light.webp
dashboard-hero-dark.webp
```

---

# 10.6 Ukuran asset

## Hero

Target:

```text
Desktop source: 1600 × 500 px minimum
Mobile crop:    900 × 500 px minimum
Target filesize: < 200 KB jika WebP/AVIF
```

## Spot illustration

```text
256 × 256 atau SVG
Target filesize: < 80 KB
```

## Empty state

```text
320 × 240 atau SVG
```

---

# 10.7 Prompt referensi untuk membuat hero illustration

Jika developer/designer menggunakan image generator, gunakan prompt yang mempertahankan visual berikut:

```text
Friendly modern flat vector illustration for an Indonesian water utility
management app. A field officer wearing a clean blue uniform checks a
residential water meter using a tablet. Show a blue water pipe and meter,
a simple residential house, a customer nearby, small green plants and
subtle water-drop elements. Professional but approachable SaaS product
illustration, soft blue and teal palette, rounded shapes, subtle shading,
clean white/light-blue background, no text, no logo, no UI, no watermark.
Wide banner composition with empty space on the left for dashboard text.
```

Untuk mobile, minta composition tetap aman saat dicrop:

```text
Keep the technician and meter in the center-right safe area.
Do not place important objects at the extreme edges.
```

---

# 11. Component Architecture

Buat komponen berikut:

```text
DashboardPage
├── AppHeader
├── DashboardHeader
│   └── MonthPicker
├── HeroBanner
├── QuickActions
│   └── QuickActionCard
├── DashboardMetrics
│   └── MetricCard
├── ActionRequiredSection
│   └── ActionAlert
├── CashFlowCard
├── RecentActivitySection
│   └── ActivityItem
└── BottomNavigation
```

---

# 12. Detail Implementasi per Komponen

# 12.1 AppHeader

## Tujuan

Menampilkan identitas aplikasi dan akses akun.

## Konten

Kiri:

```text
Logo Alira
Alira aja
```

Kanan:

```text
Avatar pengguna
```

## Ukuran

```text
Height      : 56–64 px
Padding X   : 16 px
Logo icon   : 28–32 px
Avatar      : 36–40 px
```

## Behaviour

Tap avatar:

- Open dropdown menu / account sheet.

Minimal menu:

```text
Profil
Pengaturan
Keluar
```

## Mobile

Tetap satu baris.

## Accessibility

Avatar button:

```tsx
aria-label="Buka menu akun"
```

---

# 12.2 DashboardHeader

## Konten

```text
Dashboard
Ringkasan operasional Anda
```

Month selector:

```text
Agustus 2026
```

## Layout mobile

Jika ruang cukup:

```text
Title            Month
Subtitle
```

Jika 360 px dan terlalu sempit:

```text
Title
Subtitle         Month
```

atau month selector turun ke baris berikutnya.

## Copy

Jangan gunakan:

```text
Dashboard Admin Alira
```

Gunakan sederhana:

```text
Dashboard
```

---

# 12.3 MonthPicker

## Tujuan

Mengganti periode dashboard.

## Display

Contoh:

```text
[calendar icon] Agustus 2026 [chevron]
```

## Default

Bulan berjalan.

## Value format

Internal:

```text
2026-08
```

Display:

```text
Agustus 2026
```

## Interaction

Tap:

1. Open Popover desktop.
2. Open Bottom Sheet mobile jika month picker terasa sempit.
3. Pilih bulan.
4. Tutup picker.
5. Dashboard masuk loading state.
6. Fetch data sesuai bulan.
7. Render data baru.

## Edge case

Jika bulan belum memiliki data:

- Tetap tampil bulan tersebut.
- Gunakan angka 0.
- Gunakan empty state yang sesuai.

---

# 12.4 HeroBanner

## Tujuan

Memberi identitas visual Alira.

## Content

```text
Selamat datang!

Pantau operasional dan pelayanan
air bersih dengan mudah.
```

## Layout desktop/tablet

```text
-----------------------------------------
Text                     Illustration
-----------------------------------------
```

## Layout mobile

Gunakan image sebagai background/visual di kanan.

Pastikan:

- Text tidak menimpa wajah karakter.
- Contrast tetap cukup.
- Illustration bisa di-crop secara aman.

## Ukuran

Mobile:

```text
height: 180–220 px
```

Tablet/Desktop:

```text
height: 220–280 px
```

## Border radius

```text
20–24 px
```

## Background

```text
brand-50
```

## Image implementation

Jika raster:

```tsx
<Image
  src="/illustrations/dashboard-hero.webp"
  alt=""
  fill
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

Karena illustration dekoratif:

```text
alt=""
```

---

# 12.5 QuickActions

## Action wajib

```text
Catat Meter
Kelola Pelanggan
Catat Pengeluaran
```

## Route

```text
Catat Meter         → /meter/catat
Kelola Pelanggan    → /pelanggan
Catat Pengeluaran   → /pengeluaran/tambah
```

Sesuaikan route dengan project aktual jika berbeda.

## Card anatomy

```text
[Icon]
Title
Description
             [Arrow]
```

## Catat Meter

```text
Title:
Catat Meter

Description:
Catat pembacaan meter pelanggan

Icon:
Gauge
```

## Kelola Pelanggan

```text
Title:
Kelola Pelanggan

Description:
Kelola data pelanggan

Icon:
Users
```

## Catat Pengeluaran

```text
Title:
Catat Pengeluaran

Description:
Catat dan kelola pengeluaran

Icon:
ReceiptText
```

## Mobile

Pilihan rekomendasi:

### >= 390 px

```text
3 card horizontal
```

Jika terlalu kecil:

```text
overflow-x-auto
scroll-snap
```

Jangan mengecilkan font hanya agar muat.

## Touch target

Minimum:

```text
44 × 44 px
```

---

# 12.6 DashboardMetrics

Metric:

```text
Pelanggan
Meter
Tagihan
```

---

## Metric 1 — Pelanggan

Data:

```text
Label      Pelanggan
Value      7
Caption    7 total
Icon       Users
Accent     Blue
```

Click:

```text
/pelanggan
```

---

## Metric 2 — Meter

Data:

```text
Label      Meter
Value      3/7
Caption    43% selesai
Icon       Droplet / Gauge
Accent     Teal
```

Tambahkan progress bar.

Formula:

```ts
const progress =
  totalMeters === 0
    ? 0
    : Math.round((recordedMeters / totalMeters) * 100)
```

Harus handle:

```text
totalMeters = 0
```

Jangan sampai division by zero.

---

## Metric 3 — Tagihan

Data:

```text
Label      Tagihan
Value      3/3
Caption    0 belum lunas
Icon       ReceiptText
Accent     Purple
```

Jika ada belum lunas:

```text
2 belum lunas
```

Tidak perlu mengubah seluruh card menjadi merah.

Gunakan warning accent hanya pada supporting text/badge bila diperlukan.

---

# 12.7 Perlu Tindakan

## Tujuan

Menampilkan pekerjaan yang harus dilakukan.

Section title:

```text
Perlu Tindakan
```

Optional:

```text
Lihat semua
```

## Meter belum dicatat

```text
Icon:
Bell atau CircleAlert

Label:
Meter belum dicatat

Count:
4

Color:
Orange
```

Click:

```text
/meter?status=belum-dicatat&period=2026-08
```

## Jika count = 0

Jangan menampilkan alert orange.

Ganti dengan:

```text
Semua beres
Tidak ada meter yang perlu dicatat.
```

Gunakan:

- Check icon.
- Green/teal accent.

---

# 12.8 CashFlowCard

## Tujuan

Menampilkan kondisi arus kas bulan terpilih.

## Data

```text
Pemasukan
Pengeluaran
Saldo Bersih
```

Contoh:

```text
Pemasukan      Rp 4.449.000
Pengeluaran    Rp   120.000
Saldo Bersih   Rp 4.329.000
```

## Formula

```ts
net = income - expense
```

Pastikan backend dan frontend menggunakan definisi yang sama.

## Warna

```text
Pemasukan     green/teal
Pengeluaran   red
Saldo         brand blue
```

## Illustration

Desktop/tablet:

- Illustration bisa berada di kanan.

Mobile sempit:

- Illustration dapat dikecilkan atau disembunyikan.
- Jangan mengorbankan keterbacaan angka.

## CTA

```text
Lihat detail
```

Route:

```text
/laporan/arus-kas?period=2026-08
```

---

# 12.9 RecentActivitySection

## Tujuan

Menampilkan aktivitas terakhir untuk memberi awareness.

## Maksimal item

```text
5
```

Jangan menampilkan 20 aktivitas di dashboard.

## Header

```text
Aktivitas Terbaru
Lihat semua
```

## Activity type

Minimal support:

```text
customer_created
meter_recorded
payment_received
expense_created
bill_created
```

## Contoh mapping

### Customer created

```text
Icon:
UserPlus

Primary:
bapak indrajaya

Secondary:
Pelanggan baru
```

### Payment received

```text
Icon:
WalletCards

Primary:
sani p

Secondary:
Pembayaran Rp 601.000

Badge:
Lunas
```

### Expense created

```text
Icon:
ReceiptText

Primary:
isi pulsa

Secondary:
Pengeluaran Rp 100.000
```

## Timestamp

Hari yang sama:

```text
15.05
```

Hari berbeda:

```text
18 Agu
```

Tahun berbeda:

```text
18 Agu 2025
```

---

# 12.10 BottomNavigation

Item:

```text
Home
Pelanggan
Catat Meter
Tagihan
Lainnya
```

## Active state

```text
Icon: brand-600
Label: brand-600
```

Inactive:

```text
slate-500
```

## Catat Meter

Karena ini aksi utama, boleh dibuat sebagai center action.

Contoh:

```text
        (+)
     Catat Meter
```

Jangan gunakan tombol center besar jika membuat navigation terasa tidak seimbang di layar kecil.

---

# 13. Responsive Behaviour

# 13.1 Mobile < 640 px

```text
Hero            full width
Quick actions   scroll horizontal atau compact grid
Metrics         3 columns jika cukup, jika tidak horizontal scroll
Cash flow       text dominant
Activity        single column
Bottom nav      visible
```

## Jangan

- Mengecilkan angka metric menjadi 14 px.
- Memaksa semua content sangat rapat.
- Membuat horizontal page overflow.

---

# 13.2 Tablet 640–1023 px

```text
Quick actions   3 columns
Metrics         3 columns
Hero            wider
Cash flow       2-part layout
```

---

# 13.3 Desktop >= 1024 px

Dashboard dapat menggunakan layout:

```text
----------------------------------------------------
Hero
----------------------------------------------------

Quick     Quick     Quick

Metric    Metric    Metric

Perlu Tindakan         Arus Kas
                       Arus Kas

Aktivitas Terbaru      Additional summary
----------------------------------------------------
```

Jika Alira masih fokus mobile, desktop layout boleh tetap single-main-column dengan max-width.

---

# 14. Data Contract

Gunakan satu response dashboard agar frontend tidak perlu melakukan terlalu banyak request terpisah.

Contoh:

```json
{
  "period": "2026-08",
  "customers": {
    "total": 7
  },
  "meters": {
    "total": 7,
    "recorded": 3,
    "unrecorded": 4,
    "progress": 43
  },
  "bills": {
    "total": 3,
    "paid": 3,
    "unpaid": 0
  },
  "cashflow": {
    "income": 4449000,
    "expense": 120000,
    "net": 4329000
  },
  "recentActivities": [
    {
      "id": "activity_1",
      "type": "customer_created",
      "title": "bapak indrajaya",
      "description": "Pelanggan baru",
      "amount": null,
      "status": null,
      "createdAt": "2026-08-20T15:05:00+07:00"
    }
  ]
}
```

---

# 15. TypeScript Types

```ts
export type DashboardSummary = {
  period: string;

  customers: {
    total: number;
  };

  meters: {
    total: number;
    recorded: number;
    unrecorded: number;
    progress: number;
  };

  bills: {
    total: number;
    paid: number;
    unpaid: number;
  };

  cashflow: {
    income: number;
    expense: number;
    net: number;
  };

  recentActivities: DashboardActivity[];
};

export type DashboardActivityType =
  | "customer_created"
  | "meter_recorded"
  | "payment_received"
  | "expense_created"
  | "bill_created";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  amount: number | null;
  status: "paid" | "unpaid" | null;
  createdAt: string;
};
```

---

# 16. Formatting Utility

# 16.1 Rupiah

```ts
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
```

Jika desain membutuhkan output:

```text
Rp 4.449.000
```

cek apakah browser menghasilkan spasi non-breaking.

Jika consistency visual penting, buat formatter helper khusus.

---

# 16.2 Percentage

```ts
export function getPercentage(value: number, total: number) {
  if (total <= 0) return 0;

  return Math.round((value / total) * 100);
}
```

---

# 17. Folder Structure

Rekomendasi:

```text
src/
├── app/
│   └── dashboard/
│       ├── loading.tsx
│       ├── error.tsx
│       └── page.tsx
│
├── components/
│   ├── dashboard/
│   │   ├── app-header.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── hero-banner.tsx
│   │   ├── quick-actions.tsx
│   │   ├── quick-action-card.tsx
│   │   ├── dashboard-metrics.tsx
│   │   ├── metric-card.tsx
│   │   ├── action-required-section.tsx
│   │   ├── action-alert.tsx
│   │   ├── cash-flow-card.tsx
│   │   ├── recent-activity-section.tsx
│   │   ├── activity-item.tsx
│   │   └── bottom-navigation.tsx
│   │
│   └── shared/
│       ├── section-header.tsx
│       ├── status-badge.tsx
│       └── month-picker.tsx
│
├── lib/
│   ├── format-currency.ts
│   ├── format-date.ts
│   └── dashboard.ts
│
├── types/
│   └── dashboard.ts
│
└── public/
    └── illustrations/
        ├── dashboard-hero.webp
        ├── dashboard-cashflow.svg
        ├── empty-activity.svg
        ├── empty-action.svg
        └── error-dashboard.svg
```

---

# 18. shadcn/ui Mapping

Gunakan:

```text
Card
Button
Badge
Avatar
Progress
Separator
Popover
DropdownMenu
Sheet
Skeleton
ScrollArea
```

Month picker dapat dibangun dari:

```text
Button + Popover
```

atau:

```text
Button + Sheet
```

pada mobile.

---

# 19. Recommended Component Props

## MetricCard

```ts
type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  accent: "blue" | "teal" | "purple";
  progress?: number;
  href?: string;
};
```

## QuickActionCard

```ts
type QuickActionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  accent: "blue" | "teal" | "purple";
};
```

## ActivityItem

```ts
type ActivityItemProps = {
  activity: DashboardActivity;
};
```

---

# 20. Loading State

Gunakan skeleton.

Jangan menampilkan spinner fullscreen kecuali benar-benar perlu.

Skeleton minimum:

```text
Hero
3 quick actions
3 metric cards
Perlu Tindakan
Cash Flow
5 activity rows
```

Contoh:

```tsx
<Skeleton className="h-[200px] rounded-3xl" />
```

---

# 21. Empty State

# 21.1 Tidak ada aktivitas

```text
Belum ada aktivitas

Aktivitas terbaru akan muncul di sini.
```

Optional illustration:

```text
empty-activity.svg
```

---

# 21.2 Tidak ada tindakan

```text
Semua beres

Tidak ada pekerjaan yang perlu ditindaklanjuti saat ini.
```

Gunakan success visual.

---

# 21.3 Tidak ada pelanggan

Jika database masih kosong:

```text
Belum ada pelanggan

Tambahkan pelanggan pertama untuk mulai menggunakan Alira.

[Tambah Pelanggan]
```

Dashboard metric tetap:

```text
Pelanggan 0
Meter 0/0
Tagihan 0/0
```

---

# 22. Error State

Copy:

```text
Data belum berhasil dimuat

Coba muat ulang beberapa saat lagi.

[Muat ulang]
```

Jangan tampilkan:

```text
Failed to fetch
500 Internal Server Error
```

kepada pengguna biasa.

Error teknis hanya untuk log/dev console.

---

# 23. Interaction States

Semua clickable card wajib memiliki:

```text
default
hover
focus-visible
pressed
disabled (jika relevan)
```

## Hover desktop

```text
translateY(-1px)
border lebih jelas
shadow sedikit meningkat
```

## Press mobile

```text
scale(0.98)
```

## Duration

```text
150–200 ms
```

---

# 24. Accessibility

Wajib:

- Contrast WCAG AA.
- Touch target minimal 44 px.
- Icon-only button memiliki `aria-label`.
- Jangan mengandalkan warna saja untuk status.
- Semua navigation bisa dipakai keyboard.
- Focus ring terlihat.
- Illustration dekoratif `alt=""`.
- Illustration informatif memiliki alt yang deskriptif.

Contoh:

```tsx
<button aria-label="Pilih bulan dashboard">
```

---

# 25. Performance

Illustration harus dioptimalkan.

## Target

Hero:

```text
< 200 KB
```

Spot illustration:

```text
< 80 KB
```

## Next.js

Untuk raster:

```tsx
import Image from "next/image";
```

Hero:

```text
priority = true
```

Illustration di bawah fold:

```text
lazy loading
```

---

# 26. Copywriting Final

Gunakan copy berikut sebagai baseline.

## Header

```text
Dashboard
Ringkasan operasional Anda
```

## Hero

```text
Selamat datang!

Pantau operasional dan pelayanan air bersih dengan mudah.
```

## Quick actions

```text
Catat Meter
Catat pembacaan meter pelanggan

Kelola Pelanggan
Kelola data pelanggan

Catat Pengeluaran
Catat dan kelola pengeluaran
```

## Metrics

```text
Pelanggan
7 total

Meter
43% selesai

Tagihan
0 belum lunas
```

## Action

```text
Perlu Tindakan
Meter belum dicatat
```

## Financial

```text
Arus Kas
Pemasukan
Pengeluaran
Saldo Bersih
Lihat detail
```

## Activity

```text
Aktivitas Terbaru
Lihat semua
```

---

# 27. Implementation Plan untuk Developer Junior

## Step 1 — Buat branch

Contoh:

```bash
git checkout -b feat/dashboard-redesign
```

---

## Step 2 — Jangan hapus dashboard lama dulu

Simpan referensi behaviour lama.

Pastikan semua fitur yang sudah ada tetap diketahui:

- Navigation.
- Data retrieval.
- Month filter.
- Action link.
- Activity detail.

---

## Step 3 — Buat design tokens

Set:

- Color.
- Radius.
- Typography.
- Spacing.

Jangan styling komponen satu per satu dengan nilai berbeda tanpa sistem.

---

## Step 4 — Buat halaman menggunakan mock data

Gunakan data berikut:

```ts
const mockDashboard = {
  customers: { total: 7 },
  meters: {
    total: 7,
    recorded: 3,
    unrecorded: 4,
    progress: 43,
  },
  bills: {
    total: 3,
    paid: 3,
    unpaid: 0,
  },
  cashflow: {
    income: 4449000,
    expense: 120000,
    net: 4329000,
  },
};
```

Tujuan:

- Pastikan UI benar sebelum debugging backend.

---

## Step 5 — Implement AppHeader

Checklist:

- Logo benar.
- Avatar benar.
- Height konsisten.
- Mobile tidak overflow.

---

## Step 6 — Implement DashboardHeader + MonthPicker

Checklist:

- Bulan default benar.
- Change event tersedia.
- Long month text tidak rusak.

---

## Step 7 — Tambahkan HeroBanner

Mulai dengan placeholder:

```text
/public/illustrations/dashboard-hero.webp
```

Jika asset belum siap:

- Gunakan div placeholder.
- Jangan menunggu illustration untuk menyelesaikan struktur UI.

---

## Step 8 — Implement QuickActions

Gunakan array:

```ts
const quickActions = [
  {
    title: "Catat Meter",
    description: "Catat pembacaan meter pelanggan",
    href: "/meter/catat",
  },
  ...
];
```

Render menggunakan `.map()`.

Jangan copy-paste 3 card secara manual jika komponennya sama.

---

## Step 9 — Implement metric card

Pastikan satu komponen bisa menangani:

- Pelanggan.
- Meter.
- Tagihan.
- Optional progress.

---

## Step 10 — Implement Perlu Tindakan

Logic:

```ts
if (meters.unrecorded > 0) {
  show warning
} else {
  show success state
}
```

---

## Step 11 — Implement CashFlowCard

Gunakan formatter rupiah.

Jangan:

```ts
"Rp " + number
```

secara manual untuk setiap value.

---

## Step 12 — Implement activity

Buat helper berdasarkan type.

Contoh:

```ts
function getActivityIcon(type: DashboardActivityType) {
  switch (type) {
    case "customer_created":
      return UserPlus;
    case "payment_received":
      return WalletCards;
    case "expense_created":
      return ReceiptText;
    default:
      return Circle;
  }
}
```

---

## Step 13 — Hubungkan API / database

Setelah mock UI stabil:

1. Ambil period.
2. Fetch dashboard data.
3. Transform response jika diperlukan.
4. Pass ke komponen.
5. Test bulan dengan data.
6. Test bulan tanpa data.

---

## Step 14 — Loading + error

Tambahkan:

```text
loading.tsx
error.tsx
```

---

## Step 15 — Responsive test

Tes satu per satu:

```text
360
390
430
768
1024
1280
```

Jangan hanya drag browser secara random.

---

# 28. Developer Do / Don't

## Do

- Pecah UI menjadi komponen.
- Gunakan data mapping.
- Gunakan formatter.
- Gunakan semantic colors.
- Gunakan SVG/WebP teroptimasi.
- Gunakan Lucide untuk icon UI.
- Gunakan `next/image`.
- Test loading/empty/error.

## Don't

- Jangan memasukkan seluruh dashboard dalam satu component 500+ baris.
- Jangan menggunakan icon dari 4 library berbeda.
- Jangan menggunakan emoji sebagai icon utama.
- Jangan menggunakan screenshot hero sebagai bagian UI final.
- Jangan hardcode semua nominal.
- Jangan hardcode bulan Agustus 2026.
- Jangan membuat status hanya berdasarkan warna.
- Jangan mengubah business logic tagihan hanya untuk menyesuaikan UI.

---

# 29. QA Test Cases

## TC-01 Dashboard normal

Given:

```text
7 pelanggan
7 meter
3 sudah dicatat
4 belum
3 tagihan
3 lunas
```

Expected:

```text
Pelanggan = 7
Meter = 3/7
Progress = 43%
Tagihan = 3/3
Belum lunas = 0
Meter belum dicatat = 4
```

---

## TC-02 Tidak ada meter

Given:

```text
meter total = 0
```

Expected:

```text
0/0
0% selesai
```

Tidak boleh ada:

```text
NaN
Infinity
```

---

## TC-03 Semua meter selesai

Given:

```text
7/7
```

Expected:

```text
100% selesai
```

Perlu tindakan:

```text
Tidak menampilkan warning "Meter belum dicatat".
```

---

## TC-04 Ada tagihan belum lunas

Given:

```text
total = 8
paid = 5
unpaid = 3
```

Expected:

```text
3 belum lunas
```

---

## TC-05 Cash flow negatif

Given:

```text
income = 100000
expense = 200000
```

Expected:

```text
Saldo Bersih = -Rp 100.000
```

Pastikan layout tidak rusak.

---

## TC-06 Nama pelanggan panjang

Given:

```text
Muhammad Nur Hidayatullah Pratama
```

Expected:

- Tidak mendorong timestamp keluar layar.
- Gunakan truncate bila perlu.

---

## TC-07 Loading

Expected:

- Skeleton muncul.
- Layout tidak meloncat berlebihan.

---

## TC-08 Error

Expected:

```text
Data belum berhasil dimuat
[Muat ulang]
```

---

# 30. Acceptance Criteria

## App Header

- [ ] Logo tampil.
- [ ] Nama aplikasi tampil.
- [ ] Avatar dapat ditekan.
- [ ] Tidak overflow pada 360 px.

## Dashboard Header

- [ ] Title dan subtitle tampil.
- [ ] Month selector tampil.
- [ ] Bulan dapat berubah.
- [ ] Dashboard mengikuti bulan yang dipilih.

## Hero

- [ ] Illustration tampil.
- [ ] Copy terbaca.
- [ ] Image tidak pecah.
- [ ] Crop aman di mobile.
- [ ] Tidak menghambat LCP secara signifikan.

## Quick Actions

- [ ] Catat Meter bekerja.
- [ ] Kelola Pelanggan bekerja.
- [ ] Catat Pengeluaran bekerja.
- [ ] Seluruh card clickable.
- [ ] Focus state tersedia.

## Metrics

- [ ] Pelanggan benar.
- [ ] Meter benar.
- [ ] Progress benar.
- [ ] Tagihan benar.
- [ ] Zero state aman.

## Perlu Tindakan

- [ ] Count benar.
- [ ] Klik membuka data relevan.
- [ ] Jika 0, warning tidak tampil.

## Cash Flow

- [ ] Pemasukan benar.
- [ ] Pengeluaran benar.
- [ ] Saldo benar.
- [ ] Format rupiah benar.
- [ ] Negative balance aman.

## Activity

- [ ] Maksimal 5 item.
- [ ] Type mapping benar.
- [ ] Timestamp benar.
- [ ] Empty state tersedia.

## Responsive

- [ ] 360 px aman.
- [ ] 390 px aman.
- [ ] 430 px aman.
- [ ] Tablet aman.
- [ ] Desktop aman.
- [ ] Tidak ada horizontal page scroll.

---

# 31. Definition of Done

Dashboard dianggap selesai jika:

- Semua section di PRD sudah diimplementasikan.
- Hero illustration sudah menggunakan asset production.
- Quick action dapat dinavigasikan.
- Data summary berasal dari source yang benar.
- Progress calculation benar.
- Perlu Tindakan menggunakan data real.
- Cash flow menggunakan data real.
- Activity menggunakan data real.
- Loading tersedia.
- Empty state tersedia.
- Error state tersedia.
- Mobile responsive.
- Accessibility minimum dipenuhi.
- Illustration teroptimasi.
- Tidak ada console error.
- Tidak ada TypeScript error.
- Tidak ada broken route.
- QA checklist lulus.

---

# 32. Illustration Asset Checklist

Sebelum release:

- [ ] Tentukan source final hero illustration.
- [ ] Simpan informasi license/source.
- [ ] Pastikan boleh digunakan commercial.
- [ ] Optimalkan ukuran.
- [ ] Gunakan SVG/WebP.
- [ ] Jangan include teks di dalam gambar.
- [ ] Pastikan background/crop aman.
- [ ] Pastikan style konsisten.
- [ ] Pastikan illustration tidak menyerupai logo pihak lain.
- [ ] Simpan file sumber/master jika ada.

---

# 33. Asset Source Documentation

Developer/designer harus menyimpan sumber asset.

Contoh file:

```text
docs/assets.md
```

Format:

```md
## dashboard-hero.webp

Source:
Custom AI-generated illustration for Alira

Created:
2026

Usage:
Dashboard hero

Notes:
Do not redistribute as stock asset.
```

Jika pakai pihak ketiga:

```md
## empty-activity.svg

Source:
unDraw

Original page:
<URL>

License:
unDraw License

Downloaded:
YYYY-MM-DD

Modified:
Primary color changed to Alira blue.
```

Ini penting agar beberapa bulan kemudian tim masih tahu asal asset.

---

# 34. Referensi Resmi Asset dan License

## Lucide Icons

Website:

https://lucide.dev/

License:

ISC License.

Digunakan untuk:

- Navigation.
- Quick action icon.
- Status icon.
- UI control.

---

## unDraw

Website:

https://undraw.co/

License:

https://undraw.co/license

Ringkasan saat dokumen ini dibuat:

- Personal/commercial usage diizinkan.
- Attribution tidak diwajibkan.
- Ada pembatasan terhadap redistribusi dan penggunaan tertentu.

Tetap cek license terbaru sebelum release.

---

## ManyPixels Free Gallery

Website:

https://www.manypixels.co/gallery

Ringkasan saat dokumen ini dibuat:

- Free illustration gallery dapat digunakan untuk personal/commercial.
- Attribution tidak diwajibkan menurut license gallery.
- Jangan mendistribusikan asset sebagai pack/library.

Tetap cek license asset yang dipilih sebelum release.

---

## DrawKit

Website:

https://www.drawkit.com/

License:

https://www.drawkit.com/license

Ringkasan:

- Commercial dan non-commercial use tersedia sesuai license.
- Attribution tidak diwajibkan pada license yang ditampilkan.
- Redistribusi raw asset tidak diperbolehkan.

---

## Storyset

Website:

https://storyset.com/

FAQ:

https://storyset.com/faqs

Ringkasan:

- Free illustrations dapat digunakan dengan attribution sesuai ketentuan mereka.
- Storyset menyediakan SVG/PNG dan customization.
- Jika tidak ingin attribution, gunakan license/plan yang memang mengizinkannya.

---

# 35. Search Keywords untuk Mencari Illustration

Jika mencari di Pinterest, Dribbble, Storyset, DrawKit, atau library lain:

```text
water utility illustration
water meter illustration
field service illustration
utility worker illustration
water service app illustration
maintenance worker illustration
customer service utility illustration
home water meter vector
billing finance illustration
cash flow illustration
payment dashboard illustration
utility SaaS illustration
```

Untuk gaya:

```text
flat vector
semi flat
soft gradient
minimal illustration
SaaS illustration
friendly professional
blue teal illustration
```

---

# 36. Final Visual Direction

Formula desain:

```text
Modern SaaS Dashboard
+
Utility / Billing Product
+
Field Service Workflow
+
Friendly Professional Illustration
```

Tujuan akhirnya adalah membuat Dashboard Alira tetap operasional, tetapi tidak terasa kaku.

Illustration menjadi pembeda visual, sementara:

- progress,
- action,
- status,
- nominal,
- dan navigation

tetap menjadi prioritas utama pengguna.

---

# 37. Final Checklist untuk Junior Developer

Sebelum meminta review:

- [ ] Saya sudah membaca PRD sampai selesai.
- [ ] Saya tidak mengubah business rule.
- [ ] Saya sudah membuat komponen terpisah.
- [ ] Saya sudah menggunakan mock data.
- [ ] Saya sudah menghubungkan data real.
- [ ] Saya sudah membuat loading.
- [ ] Saya sudah membuat empty state.
- [ ] Saya sudah membuat error state.
- [ ] Saya sudah test 360 px.
- [ ] Saya sudah test 390 px.
- [ ] Saya sudah test 430 px.
- [ ] Saya sudah test tablet.
- [ ] Saya sudah test desktop.
- [ ] Saya sudah test long text.
- [ ] Saya sudah test angka 0.
- [ ] Saya sudah test negative cash flow.
- [ ] Saya sudah test navigation.
- [ ] Saya sudah test month selector.
- [ ] Saya sudah cek console.
- [ ] Saya sudah cek TypeScript.
- [ ] Saya sudah optimize illustration.
- [ ] Saya sudah mencatat source/license illustration.
- [ ] Saya sudah membandingkan hasil akhir dengan desain referensi.
