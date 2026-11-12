# QR Code App (`qr-code-app`)

Aplikasi Shopify embedded berbasis **React Router** yang dibuat sesuai tugas implementasi aplikasi **QR Code Product** (mengacu pada tutorial resmi Shopify: *Build a Shopify app using React Router*).

Aplikasi ini memungkinkan merchant membuat QR code untuk produk di toko Shopify. Ketika QR code di-scan oleh customer, aplikasi mencatat jumlah scan secara otomatis dan mengarahkan customer ke halaman produk atau langsung ke halaman cart/checkout yang sudah terisi produk tersebut.

---

## Fitur Utama

- **Manajemen QR Code (CRUD):** Membuat, melihat daftar, mengedit, dan menghapus QR code langsung dari Shopify Admin.
- **Penyimpanan Shopify Metaobjects:** Data QR code disimpan di Shopify menggunakan custom metaobject type `$app:qrcode` melalui GraphQL Admin API.
- **Product Picker & Contextual Save Bar:** Integrasi **Shopify App Bridge** (`shopify.resourcePicker` dan `ui-save-bar` / `shopify.saveBar`) serta UI **Polaris Web Components** (`<s-page>`, `<s-table>`, `<s-text-field>`, `<s-select>`, dll).
- **Deteksi Produk Terhapus:** Menampilkan badge peringatan apabila produk yang terhubung ke QR code telah dihapus oleh merchant.
- **Public QR Code & Scan Tracking:** Route publik untuk menampilkan/mengunduh gambar QR code serta endpoint scan yang otomatis menambah hitungan `scans` dan melakukan redirect ke tujuan.

---

## Tech Stack

- **Framework:** React Router v7 (`@react-router/dev`, `@react-router/node`) & Vite
- **Shopify SDK:** `@shopify/shopify-app-react-router`, `@shopify/app-bridge-react`, `@shopify/polaris-types`
- **Session Storage:** Prisma + SQLite (`prisma/schema.prisma`)
- **Packages Tambahan:**
  - `qrcode` — generate gambar QR code dalam format data URL (base64)
  - `@shopify/polaris-icons` — ikon Polaris
  - `tiny-invariant` — validasi parameter route dan data pada loader

---

## Struktur File Penting

```text
├── shopify.app.toml                 # Konfigurasi dasar app & definisi metaobject $app:qrcode
├── shopify.app.qr-code-app.toml     # Konfigurasi aktif yang terhubung ke dev store
├── prisma/
│   └── schema.prisma                # Schema tabel Session (SQLite)
└── app/
    ├── shopify.server.js            # Konfigurasi autentikasi Shopify (authenticate & unauthenticated)
    ├── models/
    │   └── QRCode.server.js         # Query, mutasi GraphQL metaobject, validasi, & helper QR code
    └── routes/
        ├── app.jsx                  # Layout terautentikasi untuk halaman di dalam Shopify Admin
        ├── app._index.jsx           # Halaman utama: daftar QR code & empty state
        ├── app.qrcodes.$id.jsx      # Form Create / Edit / Delete QR code + preview QR
        ├── qrcodes.$id.jsx          # Halaman publik untuk menampilkan gambar QR code
        └── qrcodes.$id.scan.jsx     # Endpoint publik saat QR di-scan (increment scans + redirect)
```

---

## Alur Kerja Aplikasi

1. **Sisi Merchant (Admin Shopify — route `app.*`):**
   - Merchant membuka app di Shopify Admin → `app._index.jsx` memanggil `getQRCodes()` untuk menampilkan seluruh metaobject `$app:qrcode`.
   - Merchant klik **Create QR code** → `app.qrcodes.$id.jsx` (`/app/qrcodes/new`) → mengisi judul, memilih produk via `shopify.resourcePicker`, dan memilih tujuan scan (*Product page* atau *Checkout/Cart*).
   - Saat disimpan, `saveQRCode()` menjalankan mutasi `metaobjectUpsert`, dan `getQRCodeImage()` menghasilkan QR code yang mengarah ke `/qrcodes/<handle>/scan?shop=<domain-toko>`.
2. **Sisi Customer / Publik (Luar Admin — route `qrcodes.*`):**
   - Tombol **Go to public URL** membuka `qrcodes.$id.jsx` yang merender gambar QR code menggunakan `unauthenticated.admin(shop)`.
   - Saat QR code di-scan, customer mengakses `qrcodes.$id.scan.jsx` → `incrementQRCodeScans()` menambah nilai field `scans` (+1) via `metaobjectUpdate`, lalu `redirect` ke `getDestinationUrl()` (`/products/<handle>` atau `/cart/<variantId>:1`).

---

## Langkah-Langkah yang Dilakukan (Kode & Terminal)

### 1. Install Dependency Tambahan
Menambahkan package yang dibutuhkan di luar template bawaan React Router:

```powershell
npm install qrcode @shopify/polaris-icons tiny-invariant
```

### 2. Konfigurasi Access Scopes & Metaobject `$app:qrcode`
Mengonfigurasi `access_scopes` dan definisi metaobject `[metaobjects.app.qrcode]` (`admin = "merchant_read_write"`) di `shopify.app.toml` serta `shopify.app.qr-code-app.toml`:

- **Scopes:** `write_metaobject_definitions,write_metaobjects,write_products`
- **Fields pada `$app:qrcode`:**
  - `title` (`single_line_text_field`, required)
  - `product` (`product_reference`)
  - `product_variant` (`variant_reference`)
  - `destination` (`single_line_text_field`)
  - `scans` (`number_integer`)

### 3. Membuat Model Server (`app/models/QRCode.server.js`)
Mengimplementasikan seluruh logika data & GraphQL Admin API:

- `getQRCode` & `getQRCodes` (`metaobjectByHandle` dan `metaobjects`) beserta resolusi referensi `Product` dan `ProductVariant`.
- `saveQRCode` (`metaobjectUpsert`), `deleteQRCode` (`metaobjectDelete`), dan `incrementQRCodeScans` (`metaobjectUpdate`).
- `getQRCodeImage`, `getDestinationUrl`, `validateQRCode`, `slugify`, dan `generateHandle`.

Validasi seluruh query & mutasi GraphQL terhadap schema Admin API (`2026-07`):

```powershell
npm run graphql-codegen
```

### 4. Membuat Route Admin & Publik
- **`app/routes/app._index.jsx`**: mengganti halaman demo template menjadi daftar QR codes (`<s-table>`) dengan helper `truncate`, badge peringatan jika `productDeleted`, dan `EmptyQRCodeState` saat data masih kosong.
- **`app/routes/app.qrcodes.$id.jsx`**: membuat form Create/Edit/Delete dengan `authenticate.admin`, `shopify.resourcePicker`, `ui-save-bar` / `shopify.saveBar`, serta panel samping preview, tombol **Go to public URL**, dan **Download**.
  - *Perbaikan bug:* menangkap `e.currentTarget.value` ke variabel lokal sebelum memanggil updater `setFormState((prev) => ...)` pada `onInput` dan `onChange` agar tidak terjadi error `Cannot read properties of null (reading 'value')`.
- **`app/routes/qrcodes.$id.jsx` & `app/routes/qrcodes.$id.scan.jsx`**: membuat route publik di luar layout admin menggunakan `unauthenticated.admin(shop)` dan `tiny-invariant`.

### 5. Verifikasi Kualitas Kode & Build
Memastikan tidak ada error linting, TypeScript, maupun bundling:

```powershell
npm run lint
npm run typecheck
npm run build
```

### 6. Setup Dev Store & Menjalankan App di Terminal
1. Reset dan hubungkan app ke konfigurasi lokal serta membuat development store (karena organisasi kerja tidak memiliki izin Apps di Dev Dashboard, dibuatkan app & dev store pada organisasi pribadi `My Store` dengan demo data produk):

   ```powershell
   npx shopify app dev --reset
   ```

2. Menjalankan server development (otomatis menjalankan `prisma generate`, migrasi SQLite `20240530213853_create_session_table`, tunnel Cloudflare, serta sinkronisasi definisi metaobject `$app:qrcode` ke dev store):

   ```powershell
   npm run dev
   ```

3. Pengujian pada terminal & browser:
   - Tekan **`p`** di terminal untuk membuka App Preview di Shopify Admin dan klik **Install**.
   - Tekan **`g`** di terminal jika ingin membuka GraphiQL Admin API lokal.
   - Uji validasi form kosong, Create QR code, Edit, Delete, tombol **Go to public URL**, serta scan QR code (masukkan storefront password dev store dari **Online Store → Preferences** bila diminta) dan pastikan kolom **Scans** bertambah.

---

## Perintah Harian

```powershell
# Menjalankan app secara lokal dengan Shopify CLI
npm run dev

# Cek lint, typecheck, dan build produksi
npm run lint
npm run typecheck
npm run build

# Memilih file konfigurasi .toml yang aktif (misal pindah organisasi/app)
npm run config:use

# Deploy konfigurasi app ke Shopify
npm run deploy
```
