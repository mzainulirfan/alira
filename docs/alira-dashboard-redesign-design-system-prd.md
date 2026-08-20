# Alira Dashboard Redesign
## Design System + PRD Implementasi

**Dokumen:** Design System & Product Requirements Document  
**Produk:** Alira  
**Fokus:** Redesign Dashboard Admin/Petugas  
**Versi:** 1.0  
**Target stack:** Next.js, Tailwind CSS, shadcn/ui  
**Bahasa UI:** Indonesia  
**Target utama:** Mobile-first web app / PWA

---

# 1. Ringkasan

Dashboard Alira saat ini sudah berfungsi secara informasional, tetapi secara visual masih didominasi oleh card, angka, dan list. Redesign ini bertujuan membuat dashboard terasa lebih ramah, modern, dan mudah dipahami tanpa mengurangi efisiensi kerja admin/petugas.

Arah desain baru menggunakan kombinasi:

- Hero illustration bertema pengelolaan air.
- Quick action dengan icon/spot illustration.
- Summary card dengan hierarki visual lebih kuat.
- Status operasional yang mudah dipindai.
- Cash flow yang lebih visual.
- Activity list yang tetap compact.
- Warna biru-air, teal, hijau, ungu, dan orange sebagai semantic accent.
- Mobile-first, tetapi tetap adaptif untuk tablet/desktop.

---

# 2. Tujuan Redesign

## 2.1 Tujuan utama

1. Membuat dashboard lebih visual dan tidak terasa seperti kumpulan angka.
2. Membantu admin/petugas memahami kondisi operasional dalam beberapa detik.
3. Menonjolkan pekerjaan yang perlu segera dilakukan.
4. Menyediakan shortcut ke aktivitas utama.
5. Memperkuat identitas visual Alira sebagai aplikasi pengelolaan air.
6. Menjaga tampilan tetap sederhana dan tidak terlalu dekoratif.

## 2.2 Success criteria

Dashboard dianggap berhasil jika pengguna dapat menjawab pertanyaan berikut dalam waktu singkat:

- Berapa jumlah pelanggan aktif?
- Berapa meter yang sudah dicatat bulan ini?
- Apakah ada meter yang belum dicatat?
- Apakah semua tagihan sudah lunas?
- Berapa pemasukan dan pengeluaran bulan berjalan?
- Apa aktivitas terbaru?
- Bagaimana cara masuk ke Catat Meter, Pelanggan, dan Pengeluaran?

---

# 3. Pengguna Utama

## 3.1 Admin

Kebutuhan:

- Melihat ringkasan operasional.
- Mengelola pelanggan.
- Melihat status pencatatan meter.
- Memantau tagihan.
- Melihat arus kas.
- Memantau aktivitas terbaru.

## 3.2 Petugas pencatat meter

Kebutuhan:

- Langsung masuk ke Catat Meter.
- Mengetahui jumlah meter yang belum dicatat.
- Mengetahui progres pencatatan bulan berjalan.
- Mengurangi risiko salah pelanggan/meter.

---

# 4. Prinsip UX

## 4.1 Action first

Dashboard bukan laporan statis. Elemen yang perlu dilakukan harus lebih menonjol daripada informasi pasif.

Urutan prioritas:

1. Perlu Tindakan
2. Quick Action
3. Status meter/tagihan
4. Arus kas
5. Aktivitas terbaru

## 4.2 Scanable

Gunakan:

- Angka besar.
- Label singkat.
- Warna semantic.
- Icon yang konsisten.
- Progress bar.
- Badge status.

Hindari paragraf panjang di dashboard.

## 4.3 Progressive disclosure

Dashboard hanya menampilkan ringkasan.

Detail dibuka melalui:

- "Lihat semua"
- "Lihat detail"
- Card click
- Chevron

## 4.4 Visual, tetapi tetap fungsional

Illustration digunakan sebagai:

- Brand reinforcement.
- Context setter.
- Empty state.
- Accent.

Illustration tidak boleh mengalahkan informasi operasional.

---

# 5. Information Architecture Dashboard

Urutan section:

1. App Header
2. Page Header + Month Selector
3. Hero Illustration
4. Quick Actions
5. Operational Summary
6. Perlu Tindakan
7. Arus Kas
8. Aktivitas Terbaru
9. Bottom Navigation

---

# 6. Struktur Halaman

## 6.1 App Header

### Konten

- Logo Alira.
- Nama "Alira aja" atau "Alira".
- Avatar pengguna.

### Behaviour

- Sticky hanya jika dibutuhkan.
- Avatar dapat membuka profile/account menu.

---

## 6.2 Page Header

### Konten

**Title:** Dashboard  
**Subtitle:** Ringkasan operasional Anda

### Month Selector

Contoh:

`Agustus 2026`

Saat ditekan:

- Buka month picker.
- Data seluruh dashboard mengikuti bulan yang dipilih.

### Default

Bulan berjalan.

---

# 7. Hero Illustration

## 7.1 Tujuan

Memberikan identitas visual pada dashboard sekaligus konteks aplikasi.

## 7.2 Konten

### Copy

**Heading:**  
Selamat datang!

**Body:**  
Pantau operasional dan pelayanan air bersih dengan mudah.

### Illustration

Scene utama:

- Petugas memakai seragam biru.
- Membawa tablet.
- Memeriksa meter air.
- Pipa air.
- Rumah pelanggan.
- Pelanggan.
- Elemen air/tetes air.
- Vegetasi ringan.

## 7.3 Style illustration

Gunakan:

- Flat vector.
- Soft gradient.
- Friendly professional.
- Rounded shapes.
- Sedikit detail.
- Warna sesuai brand.

Hindari:

- 3D realistis.
- Cartoon anak-anak.
- Stock illustration generik yang tidak berhubungan dengan air.
- Background terlalu ramai.

## 7.4 Ukuran

Mobile:

- Width: 100%.
- Height rekomendasi: 180–220 px.
- Border radius: 20–24 px.

Desktop:

- Height: 220–280 px.

---

# 8. Quick Actions

Tampilkan tiga aksi utama:

1. Catat Meter
2. Kelola Pelanggan
3. Catat Pengeluaran

## 8.1 Card structure

Setiap card memiliki:

- Icon/spot illustration.
- Judul.
- Deskripsi singkat.
- Chevron / arrow.

### Catat Meter

**Title:** Catat Meter  
**Description:** Catat pembacaan meter pelanggan

### Kelola Pelanggan

**Title:** Kelola Pelanggan  
**Description:** Kelola data pelanggan

### Catat Pengeluaran

**Title:** Catat Pengeluaran  
**Description:** Catat dan kelola pengeluaran

## 8.2 Interaction

Seluruh card clickable.

Touch target minimum:

`44 × 44 px`

## 8.3 Mobile layout

Untuk layar sempit:

- Gunakan horizontal scroll, atau
- 1 kolom/2 kolom adaptive.

Rekomendasi:

- `< 480 px`: horizontal scroll snap.
- `>= 480 px`: grid 3 kolom.

---

# 9. Operational Summary

Tiga metric utama:

## 9.1 Pelanggan

Contoh:

- Label: Pelanggan
- Value: 7
- Supporting text: 7 total

Icon:

- Users.

Accent:

- Blue.

---

## 9.2 Meter

Contoh:

- Label: Meter
- Value: 3/7
- Supporting text: 43% selesai
- Progress bar: 43%

Accent:

- Teal.

### Formula

```text
progress = meter_sudah_dicatat / total_meter × 100
```

---

## 9.3 Tagihan

Contoh:

- Label: Tagihan
- Value: 3/3
- Supporting text: 0 belum lunas

Accent:

- Purple.

---

# 10. Perlu Tindakan

Section ini harus menjadi status operasional yang mudah terlihat.

## 10.1 Header

**Title:** Perlu Tindakan

Optional:

`Lihat semua`

## 10.2 Alert item

Contoh:

- Icon: Bell / Alert
- Label: Meter belum dicatat
- Count: 4
- Chevron

### Semantic color

Orange / amber.

### Interaction

Tap membuka daftar pelanggan/meter yang belum dicatat.

---

# 11. Arus Kas

## 11.1 Data

Tampilkan:

- Pemasukan
- Pengeluaran
- Saldo Bersih

Contoh:

```text
Pemasukan      Rp 4.449.000
Pengeluaran    Rp   120.000
Saldo Bersih   Rp 4.329.000
```

## 11.2 Visual

Di sisi kanan dapat digunakan mini illustration:

- Clipboard laporan.
- Bar chart.
- Calculator.
- Coins.
- Water drop.

## 11.3 Warna semantic

Pemasukan:
- Green / teal.

Pengeluaran:
- Red.

Saldo:
- Brand blue.

## 11.4 Behaviour

`Lihat detail` membuka laporan keuangan bulan terpilih.

---

# 12. Aktivitas Terbaru

## 12.1 Struktur item

Setiap row:

- Icon.
- Primary text.
- Secondary text.
- Timestamp.
- Optional status chip.
- Optional chevron.

## 12.2 Contoh

### Pelanggan baru

**Primary:** bapak indrajaya  
**Secondary:** Pelanggan baru  
**Time:** 15.05

### Pembayaran

**Primary:** sani p  
**Secondary:** Pembayaran Rp 601.000  
**Status:** Lunas  
**Date:** 18 Agu

### Pengeluaran

**Primary:** isi pulsa  
**Secondary:** Pengeluaran Rp 100.000  
**Date:** 18 Agu

## 12.3 Batas item

Default:

`5 aktivitas terbaru`

Footer:

`Lihat semua`

---

# 13. Bottom Navigation

Tab:

1. Home
2. Pelanggan
3. Catat Meter
4. Tagihan
5. Lainnya

## 13.1 Active state

Active tab:

- Brand blue.
- Icon filled/strong.
- Label lebih kontras.

Inactive:

- Slate/gray.

## 13.2 Catat Meter

Boleh dibuat paling dominan.

Pilihan:

- Normal tab.
- Elevated circular action.
- Floating center button.

Rekomendasi:

Gunakan elevated action hanya jika Catat Meter memang aksi utama petugas.

---

# 14. Design System

# 14.1 Brand Colors

## Primary Blue

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

Primary action:

`brand-600`

Dark heading:

`brand-900`

---

# 14.2 Teal

```css
--teal-50:  #F0FDFA;
--teal-100: #CCFBF1;
--teal-500: #14B8A6;
--teal-600: #0D9488;
```

Digunakan untuk:

- Meter.
- Progress.
- Positive utility status.

---

# 14.3 Green

```css
--green-50:  #F0FDF4;
--green-100: #DCFCE7;
--green-500: #22C55E;
--green-600: #16A34A;
```

Digunakan untuk:

- Lunas.
- Pemasukan.
- Success.

---

# 14.4 Orange

```css
--orange-50:  #FFF7ED;
--orange-100: #FFEDD5;
--orange-400: #FB923C;
--orange-500: #F97316;
```

Digunakan untuk:

- Perlu Tindakan.
- Warning.
- Meter belum dicatat.

---

# 14.5 Red

```css
--red-50:  #FEF2F2;
--red-500: #EF4444;
--red-600: #DC2626;
```

Digunakan untuk:

- Pengeluaran.
- Error.
- Overdue kritis.

---

# 14.6 Purple

```css
--purple-50:  #FAF5FF;
--purple-100: #F3E8FF;
--purple-500: #A855F7;
--purple-600: #9333EA;
```

Digunakan untuk:

- Tagihan.
- Secondary financial accent.

---

# 14.7 Neutral

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

# 15. Typography

## Font

Rekomendasi:

`Inter`

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

## Scale

### Display / Dashboard title

```text
28 px
Line-height 34 px
Weight 700
```

### Section title

```text
18 px
Line-height 26 px
Weight 600–700
```

### Card title

```text
15–16 px
Line-height 22–24 px
Weight 600
```

### Metric value

```text
24–30 px
Line-height 32–36 px
Weight 700
```

### Body

```text
14 px
Line-height 20 px
Weight 400
```

### Caption

```text
12 px
Line-height 18 px
Weight 400–500
```

---

# 16. Spacing System

Gunakan 4 px base grid.

```text
4   = xs
8   = sm
12  = md
16  = base
20  = lg
24  = xl
32  = 2xl
40  = 3xl
48  = 4xl
```

## Page padding

Mobile:

`16 px`

Tablet:

`24 px`

Desktop:

`32 px`

---

# 17. Radius

```text
Small control      8 px
Button             10–12 px
Card               16 px
Hero card          20–24 px
Pill/badge          999 px
```

---

# 18. Border

Default:

```css
border: 1px solid #E2E8F0;
```

Hover:

```css
border-color: #BFDBFE;
```

---

# 19. Shadow

## Card

```css
box-shadow:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 4px 12px rgba(15, 23, 42, 0.04);
```

## Elevated CTA

```css
box-shadow:
  0 8px 24px rgba(37, 99, 235, 0.18);
```

Gunakan shadow ringan.

Jangan membuat semua card terlihat mengambang.

---

# 20. Icon System

Rekomendasi:

- Lucide Icons.
- Stroke konsisten.
- Ukuran 18, 20, 24 px.

Icon utama:

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
Ellipsis
House
ClipboardList
```

---

# 21. Illustration System

Illustration merupakan elemen baru utama dalam redesign.

## 21.1 Illustration tiers

### Tier A — Hero illustration

Digunakan:

- Dashboard.
- Onboarding.
- Empty state besar.

Ukuran:

`large`

### Tier B — Spot illustration

Digunakan:

- Cash flow.
- Quick actions tertentu.
- Empty state kecil.

Ukuran:

`medium`

### Tier C — Decorative icon

Digunakan:

- Metric card.
- Small status card.

Ukuran:

`small`

## 21.2 Visual rules

Semua illustration:

- Menggunakan family warna yang sama.
- Blue sebagai warna dominan.
- Secondary teal/green.
- Purple/orange hanya sebagai accent.
- Rounded.
- Minimal outline.
- Soft shading.
- Tidak terlalu detail.

## 21.3 Asset format

Rekomendasi:

- SVG untuk illustration.
- WebP fallback.
- Jangan pakai PNG besar jika tidak diperlukan.

---

# 22. Component System

Struktur komponen:

```text
AppHeader
DashboardHeader
MonthPicker
HeroBanner
QuickActionCard
MetricCard
ProgressMetricCard
ActionAlert
CashFlowCard
ActivityList
ActivityItem
StatusBadge
SectionHeader
BottomNavigation
```

---

# 23. shadcn/ui Mapping

Komponen yang dapat digunakan:

```text
Card
Button
Badge
Avatar
Progress
Separator
DropdownMenu
Popover
Calendar / custom MonthPicker
ScrollArea
Sheet
Skeleton
Tooltip
```

---

# 24. Tailwind Component Tokens

Contoh card umum:

```tsx
className="
  rounded-2xl
  border
  border-slate-200
  bg-white
  shadow-sm
"
```

Section spacing:

```tsx
className="space-y-4"
```

Dashboard container:

```tsx
className="
  mx-auto
  w-full
  max-w-7xl
  px-4
  md:px-6
  lg:px-8
"
```

---

# 25. Suggested Dashboard Layout

## Mobile

```text
Header
↓
Dashboard + Month
↓
Hero
↓
Quick Actions
↓
Metrics
↓
Perlu Tindakan
↓
Arus Kas
↓
Aktivitas
↓
Bottom Navigation
```

## Desktop

```text
------------------------------------------------
Header
------------------------------------------------

Dashboard                       Month selector

------------------------------------------------
Hero illustration
------------------------------------------------

Quick action  Quick action  Quick action

Metric        Metric        Metric

Perlu Tindakan            | Arus Kas
                          |
Aktivitas Terbaru         | Additional summary
------------------------------------------------
```

---

# 26. Responsive Rules

## Breakpoints

```text
sm   640 px
md   768 px
lg   1024 px
xl   1280 px
```

## Mobile

- Single content column.
- Quick action may scroll horizontally.
- Illustration full width.
- Bottom navigation active.

## Tablet

- Summary grid 3 columns.
- Quick action 3 columns.

## Desktop

- Max width 1200–1280 px.
- Bottom navigation dapat diganti sidebar/top navigation.
- Arus Kas dan Aktivitas dapat dibuat 2 kolom.

---

# 27. Interaction Specification

## Month Picker

Tap:
- Open picker.

Change:
- Fetch/recompute dashboard.

Loading:
- Skeleton.

## Metric Card

Tap:
- Navigate ke detail.

Example:

```text
Pelanggan → /pelanggan
Meter → /meter
Tagihan → /tagihan
```

## Perlu Tindakan

Tap:

```text
/meter?status=belum-dicatat
```

## Arus Kas

Tap:

```text
/laporan/arus-kas
```

## Aktivitas

Tap row:
- Open relevant entity/detail page.

---

# 28. Loading State

Gunakan skeleton.

Jangan gunakan spinner besar untuk seluruh halaman.

Skeleton:

- Hero.
- Quick action.
- Metric card.
- Cash flow.
- Activity list.

---

# 29. Empty State

## Tidak ada aktivitas

Copy:

**Belum ada aktivitas**  
Aktivitas terbaru akan muncul di sini.

Optional illustration:

- Clipboard kosong.
- Water droplet.

## Tidak ada tindakan

Copy:

**Semua beres**  
Tidak ada pekerjaan yang perlu ditindaklanjuti saat ini.

Gunakan success illustration ringan.

---

# 30. Error State

Copy:

**Data belum berhasil dimuat**  
Coba muat ulang beberapa saat lagi.

CTA:

`Muat ulang`

---

# 31. Copywriting Guidelines

Gunakan bahasa:

- Singkat.
- Natural.
- Tidak terlalu formal.
- Berorientasi aksi.

## Disarankan

`Catat Meter`

Bukan:

`Pencatatan Data Meter Pelanggan`

## Disarankan

`Meter belum dicatat`

Bukan:

`Daftar meter yang belum dilakukan pencatatan`

## Disarankan

`Lihat detail`

Bukan:

`Klik untuk melihat informasi secara lengkap`

---

# 32. Data Model Dashboard

Contoh response API:

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
  "recentActivities": []
}
```

---

# 33. Suggested Frontend Types

```ts
type DashboardSummary = {
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

  recentActivities: ActivityItem[];
};
```

---

# 34. Accessibility

Minimum:

- Contrast mengikuti WCAG AA.
- Text utama jangan di bawah 14 px.
- Click/touch target minimal 44 px.
- Icon-only button wajib memiliki `aria-label`.
- Status tidak boleh hanya dibedakan dengan warna.
- Illustration dekoratif gunakan:

```html
aria-hidden="true"
```

- Illustration informatif wajib memiliki alt text.

---

# 35. Performance

Illustration berpotensi menjadi asset paling berat.

Target:

```text
Hero illustration < 200 KB
Spot illustration < 80 KB
```

Rekomendasi:

- SVG.
- Lazy load illustration di bawah fold.
- Preload hero bila penting.
- Gunakan `next/image` untuk raster.

---

# 36. Acceptance Criteria

## Header

- [ ] Logo dan avatar tampil.
- [ ] Dashboard title tampil.
- [ ] Month selector dapat digunakan.

## Hero

- [ ] Hero illustration tampil dengan baik.
- [ ] Text tetap terbaca di mobile.
- [ ] Tidak terjadi layout shift signifikan.

## Quick Action

- [ ] Tiga action tampil.
- [ ] Seluruh card clickable.
- [ ] Route benar.

## Metrics

- [ ] Pelanggan tampil.
- [ ] Meter tampil.
- [ ] Progress meter benar.
- [ ] Tagihan tampil.

## Perlu Tindakan

- [ ] Jumlah meter belum dicatat benar.
- [ ] Klik membuka daftar terkait.

## Arus Kas

- [ ] Pemasukan benar.
- [ ] Pengeluaran benar.
- [ ] Saldo bersih benar.
- [ ] Format Rupiah benar.

## Aktivitas

- [ ] Maksimal 5 item di dashboard.
- [ ] Timestamp tampil.
- [ ] Status tampil bila ada.
- [ ] Lihat semua berfungsi.

## Responsive

- [ ] Mobile 360 px aman.
- [ ] Mobile 390/430 px aman.
- [ ] Tablet aman.
- [ ] Desktop aman.

---

# 37. Implementation Priority

## Phase 1 — Structure

Bangun:

- DashboardHeader.
- MonthPicker.
- QuickAction.
- MetricCard.
- PerluTindakan.
- CashFlow.
- ActivityList.

## Phase 2 — Illustration

Tambahkan:

- Hero illustration.
- Cash flow illustration.
- Decorative metric icon.

## Phase 3 — Interaction

Tambahkan:

- Navigation.
- Month filtering.
- Loading.
- Empty state.
- Error state.

## Phase 4 — Polish

Tambahkan:

- Micro interaction.
- Hover.
- Pressed state.
- Transition.
- Responsive optimization.

---

# 38. Micro Interaction

Gunakan ringan.

## Card

Hover desktop:

```text
translateY(-1px)
shadow meningkat sedikit
```

Tap mobile:

```text
scale(0.98)
```

Duration:

`150–200 ms`

## Progress

Animate dari 0 ke nilai saat load.

Duration:

`400–600 ms`

Jangan gunakan animasi berlebihan.

---

# 39. Recommended Folder Structure

```text
src/
├── app/
│   └── dashboard/
│       └── page.tsx
│
├── components/
│   └── dashboard/
│       ├── dashboard-header.tsx
│       ├── hero-banner.tsx
│       ├── quick-action-card.tsx
│       ├── metric-card.tsx
│       ├── action-alert.tsx
│       ├── cash-flow-card.tsx
│       ├── activity-list.tsx
│       └── activity-item.tsx
│
├── components/
│   └── shared/
│       ├── section-header.tsx
│       ├── status-badge.tsx
│       └── month-picker.tsx
│
├── lib/
│   ├── format-currency.ts
│   └── dashboard.ts
│
└── public/
    └── illustrations/
        ├── dashboard-hero.svg
        ├── cashflow.svg
        └── empty-state.svg
```

---

# 40. Format Currency

Gunakan formatter konsisten.

```ts
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
```

---

# 41. Final Visual Direction

Dashboard Alira harus terasa:

**Bersih**  
Banyak whitespace dan visual hierarchy jelas.

**Ramah**  
Illustration membantu produk terasa human.

**Operasional**  
Informasi penting langsung terlihat.

**Modern**  
Card, icon, typography, dan spacing konsisten.

**Tidak berlebihan**  
Illustration merupakan pendukung, bukan pusat seluruh dashboard.

---

# 42. UI Reference Summary

Arah desain yang direkomendasikan:

```text
Modern SaaS dashboard
+
Utility billing dashboard
+
Field service dashboard
+
Friendly editorial illustration
```

Bukan:

```text
IoT industrial dashboard
```

Bukan:

```text
Heavy analytics dashboard
```

Bukan:

```text
Cartoon-heavy mobile app
```

---

# 43. Definition of Done

Redesign Dashboard dianggap selesai jika:

- Tampilan tidak lagi hanya kumpulan card dan angka.
- Hero illustration menjadi identitas visual utama.
- Quick action mudah ditemukan.
- Pengguna dapat memahami progres pencatatan meter.
- Action yang belum selesai terlihat jelas.
- Arus kas mudah dibaca.
- Activity list tetap ringkas.
- Mobile experience tetap menjadi prioritas.
- Semua komponen mengikuti design token yang sama.
- Implementasi dapat dipahami dan diteruskan oleh junior developer.

