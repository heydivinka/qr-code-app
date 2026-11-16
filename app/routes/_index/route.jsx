/* eslint-disable no-undef */
import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData } from "react-router";
import qrcode from "qrcode";
import { login } from "../../shopify.server";
import "./landing.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  // Generate REAL, scannable QR codes for the interactive preview
  const demoStore = "qr-code-dev-divinka.myshopify.com";
  const productUrl = `https://${demoStore}/products/gift-card`;
  const cartUrl = `https://${demoStore}/cart/44890876149838:1`;

  const [productQrCode, cartQrCode] = await Promise.all([
    qrcode.toDataURL(productUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }),
    qrcode.toDataURL(cartUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }),
  ]);

  return {
    showForm: Boolean(login),
    demoStore,
    productUrl,
    cartUrl,
    productQrCode,
    cartQrCode,
  };
};

export const action = async ({ request }) => {
  const result = await login(request);
  if (result?.shop) {
    return {
      errors: {
        shop: "Domain toko tidak valid atau wajib diisi. Contoh: toko-kamu.myshopify.com",
      },
    };
  }
  return { errors: {} };
};

export default function App() {
  const { showForm, demoStore, productUrl, cartUrl, productQrCode, cartQrCode } =
    useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors;

  const [activeMode, setActiveMode] = useState("cart");
  const isCart = activeMode === "cart";

  const currentQr = isCart ? cartQrCode : productQrCode;
  const currentUrl = isCart ? cartUrl : productUrl;
  const displayUrl = isCart
    ? `${demoStore}/cart/44890876149838:1`
    : `${demoStore}/products/gift-card`;

  return (
    <div className="landing-root">
      {/* Header */}
      <header className="site-header">
        <div className="container nav-row">
          <a className="brand-mark" aria-label="QR Code App home" href="/">
            <svg
              className="brand-mark__icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 14h3v3h-3z" />
              <path d="M17 20h4v-3" />
              <path d="M21 14v.01" />
            </svg>
            <span>QR Code App</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            <a className="nav-link" href="#destinations">
              Destinasi Scan
            </a>
            <a className="nav-link" href="#features">
              Fitur Utama
            </a>
            <a className="nav-link" href="#faq">
              Tanya Jawab
            </a>
            <a className="btn btn--secondary btn--compact" href="#shop-connect">
              Masuk Toko
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero" id="shop-connect">
          <div className="container hero-grid">
            <div className="hero__copy">
              <h1>QR Code Cerdas Terintegrasi Checkout Shopify.</h1>
              <p className="lead">
                Buat label QR code untuk halaman produk atau langsung ke keranjang
                checkout. Tersimpan aman di Shopify Metaobjects dan bisa di-scan
                kapan saja tanpa perlu server lokal.
              </p>

              {showForm && (
                <Form method="post" className="connect-form">
                  <div className="field-group">
                    <label className="field-label" htmlFor="shop-domain">
                      Domain Toko Shopify
                    </label>
                    <div className="field-row">
                      <input
                        id="shop-domain"
                        className="field-input"
                        type="text"
                        name="shop"
                        placeholder="contoh-toko.myshopify.com"
                        autoComplete="url"
                        required
                      />
                      <button type="submit" className="btn btn--primary">
                        Buka di Shopify
                      </button>
                    </div>
                  </div>
                  {errors?.shop ? (
                    <p
                      className="field-help"
                      style={{ color: "var(--color-error, #e11d48)" }}
                    >
                      {errors.shop}
                    </p>
                  ) : (
                    <p className="field-help">
                      Masukkan domain myshopify.com untuk mengelola QR code di
                      Shopify Admin toko Anda.
                    </p>
                  )}
                </Form>
              )}
            </div>

            {/* Sticker Tray Preview */}
            <div className="sticker-tray">
              <div className="sticker-tray__header">
                <span className="sticker-tray__title">Live Preview (Bisa Di-Scan)</span>
                <div
                  className="mode-pills"
                  role="tablist"
                  aria-label="Pilih mode tujuan scan"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isCart}
                    className={`mode-pill ${isCart ? "is-active" : ""}`}
                    onClick={() => setActiveMode("cart")}
                  >
                    Direct Cart
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isCart}
                    className={`mode-pill ${!isCart ? "is-active" : ""}`}
                    onClick={() => setActiveMode("product")}
                  >
                    Halaman Produk
                  </button>
                </div>
              </div>

              <div className="sticker-sheet">
                <img
                  className="sticker-qr-img"
                  src={currentQr}
                  width="244"
                  height="244"
                  alt={`QR Code fungsional untuk ${isCart ? "Direct Cart Checkout" : "Halaman Produk"}`}
                />
                <div className="sticker-meta">
                  <div className="sticker-name">Gift Card — Official Store</div>
                  <div className="sticker-route">{displayUrl}</div>
                  <div className="sticker-stub">
                    <span className="mono">
                      {isCart ? "gift-card-cart-quick" : "gift-card-detail"}
                    </span>
                    <span className="seal-stamp seal-stamp--tilted">
                      {isCart ? "Auto-Cart" : "Product View"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sticker-tray__footer">
                <span>
                  Tujuan:{" "}
                  <strong>
                    {isCart ? "Langsung ke checkout keranjang" : "Halaman detail produk"}
                  </strong>
                </span>
                <span>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline", color: "inherit" }}
                  >
                    Uji Buka URL Link &rarr;
                  </a>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Destinations Switcher */}
        <section className="section-switcher" id="destinations">
          <div className="container">
            <div className="section-head-split">
              <h2>Dua Pilihan Rute Scan untuk Berbagai Kebutuhan.</h2>
              <p className="lead">
                Fleksibilitas penuh bagi merchant: dorong konversi kilat langsung ke
                checkout, atau arahkan pelanggan membaca deskripsi produk lengkap.
              </p>
            </div>

            <div className="switcher-panel">
              <dl className="spec-list">
                <div className="spec-row">
                  <dt>Mode Scan Aktif</dt>
                  <dd>
                    {isCart
                      ? "Direct Cart Checkout (Varian terpilih langsung masuk keranjang)"
                      : "Storefront Product Page (Halaman detail produk & media)"}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt>Target URL</dt>
                  <dd className="mono">{displayUrl}</dd>
                </div>
                <div className="spec-row">
                  <dt>Format Penyimpanan</dt>
                  <dd className="mono">Shopify Metaobjects ($app:qr_code)</dd>
                </div>
                <div className="spec-row">
                  <dt>Pelacakan Metrik</dt>
                  <dd>Penambahan counter scan otomatis setiap kali kode dipindai</dd>
                </div>
              </dl>
              <p>
                {isCart
                  ? "Sangat cocok untuk stiker kemasan fisik, flyer promo, atau display toko offline agar pelanggan langsung bisa bayar tanpa mencari produk secara manual."
                  : "Cocok untuk brosur dan label display agar pengunjung melihat ulasan, panduan ukuran, dan varian warna lengkap di toko online."}
              </p>
            </div>
          </div>
        </section>

        {/* Section Features (Dark Band) */}
        <section className="band--ink" id="features">
          <div className="container">
            <div className="band-head">
              <h2>Dirancang Khusus untuk Ekosistem Shopify.</h2>
              <p className="lead">
                Semua kode QR terhubung langsung dengan katalog Shopify Anda,
                dikelola dari Shopify Admin, dan siap pakai tanpa software grafis tambahan.
              </p>
            </div>
            <div className="exports-grid">
              <div className="export-item">
                <h3>Penyimpanan Native Metaobjects</h3>
                <p className="export-item__desc">
                  Data judul, produk, varian, dan jumlah scan tersimpan langsung
                  di database Metaobjects toko Anda ($app:qr_code) tanpa ketergantungan pihak ketiga.
                </p>
                <span className="export-item__meta">Tipe: $app:qr_code</span>
              </div>
              <div className="export-item">
                <h3>Real-time Scan Tracking</h3>
                <p className="export-item__desc">
                  Setiap kali kamera ponsel memindai QR code, rute /scan mencatat
                  metrik kunjungan secara aman sebelum meneruskan pelanggan ke tujuan.
                </p>
                <span className="export-item__meta">Rute: /qrcodes/:id/scan</span>
              </div>
              <div className="export-item">
                <h3>Halaman Publik & Download PNG</h3>
                <p className="export-item__desc">
                  Setiap QR code memiliki halaman publik tersendiri untuk preview,
                  tes scan, dan download gambar beresolusi tinggi untuk dicetak.
                </p>
                <span className="export-item__meta">Rute: /qrcodes/:id</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="section-faq" id="faq">
          <div className="container faq-layout">
            <h2>Pertanyaan yang Sering Diajukan.</h2>
            <div className="faq-list">
              <div className="faq-row">
                <h3>Di mana data QR code saya disimpan?</h3>
                <p>
                  Data disimpan secara aman di dalam toko Shopify Anda sendiri
                  menggunakan fitur resmi Shopify Metaobjects (<code>$app:qr_code</code>),
                  sehingga data tetap menjadi milik toko Anda.
                </p>
              </div>
              <div className="faq-row">
                <h3>Apakah aplikasi ini bisa diakses tanpa menjalankan server lokal di PC?</h3>
                <p>
                  Ya, aplikasi telah dideploy secara *serverless* ke cloud (Vercel)
                  dengan database PostgreSQL (Supabase), sehingga bisa diakses 24 jam nonstop dari mana saja.
                </p>
              </div>
              <div className="faq-row">
                <h3>Bagaimana scan counter dihitung?</h3>
                <p>
                  Kamera ponsel membuka rute <code>/scan</code> aplikasi, lalu sistem
                  akan menambahkan angka scan pada metaobject terkait secara atomik
                  dan seketika mengalihkan pengguna ke halaman produk/keranjang.
                </p>
              </div>
              <div className="faq-row">
                <h3>Apa yang terjadi jika nama atau harga produk berubah?</h3>
                <p>
                  Karena QR code mereferensikan resource produk Shopify secara dinamis,
                  tujuan scan akan selalu mengikuti link dan varian terbaru dari produk tersebut.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Close Band CTA */}
        <section className="close-band">
          <div className="container close-band__row">
            <div className="close-band__copy">
              <h2>Siap Menghubungkan Toko Shopify Anda?</h2>
              <p className="lead">
                Mulai buat QR code untuk produk fisik dan promosi toko Anda sekarang.
              </p>
            </div>
            <a href="#shop-connect" className="btn btn--primary">
              Hubungkan Toko
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-row">
            <div>
              <a className="brand-mark" aria-label="QR Code App home" href="/">
                <svg
                  className="brand-mark__icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M14 14h3v3h-3z" />
                  <path d="M17 20h4v-3" />
                  <path d="M21 14v.01" />
                </svg>
                <span>QR Code App</span>
              </a>
              <p className="footer-note">
                Shopify embedded QR Code application &bull; Powered by Shopify Metaobjects.
              </p>
            </div>
            <nav className="footer-links" aria-label="Footer">
              <a className="nav-link" href="#destinations">
                Destinasi Scan
              </a>
              <a className="nav-link" href="#features">
                Fitur Utama
              </a>
              <a className="nav-link" href="#faq">
                Tanya Jawab
              </a>
              <a className="nav-link" href="#shop-connect">
                Masuk Toko
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
