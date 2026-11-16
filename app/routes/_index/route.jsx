import { redirect, Form, useActionData, useLoaderData } from "react-router";
import "./landing.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: true };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const rawShop = formData.get("shop");
  let shop = String(rawShop || "").trim().toLowerCase();

  shop = shop.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!shop) {
    return { errors: { shop: "Please enter your store domain" } };
  }

  const storeHandle = shop.replace(".myshopify.com", "");

  // Directly redirect to Shopify Admin embedded app URL
  // This avoids the broken direct "oauth/install" link on development apps
  return redirect(
    `https://admin.shopify.com/store/${storeHandle}/apps/qr-code-app`,
  );
};

function BrandIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3z" />
      <path d="M20 14v3h-3" />
      <path d="M14 20h3" />
      <path d="M20 20v.01" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      className="input-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CartLightningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <polygon points="13 2 9 8 13 8 11 14 17 6 13 6 13 2" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function ChartAnalyticsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M2 20h20" />
    </svg>
  );
}

function ShieldNativeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function DemoQRCodeSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="#0f172a"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Left Finder */}
      <rect x="5" y="5" width="28" height="28" rx="5" fill="#7c3aed" />
      <rect x="9" y="9" width="20" height="20" rx="3" fill="#080b11" />
      <rect x="13" y="13" width="12" height="12" rx="2" fill="#ec4899" />

      {/* Top Right Finder */}
      <rect x="67" y="5" width="28" height="28" rx="5" fill="#7c3aed" />
      <rect x="71" y="9" width="20" height="20" rx="3" fill="#080b11" />
      <rect x="75" y="13" width="12" height="12" rx="2" fill="#ec4899" />

      {/* Bottom Left Finder */}
      <rect x="5" y="67" width="28" height="28" rx="5" fill="#7c3aed" />
      <rect x="9" y="71" width="20" height="20" rx="3" fill="#080b11" />
      <rect x="13" y="75" width="12" height="12" rx="2" fill="#ec4899" />

      {/* QR Timing and Data Matrix Elements */}
      <rect x="38" y="10" width="5" height="5" rx="1" fill="#c084fc" />
      <rect x="48" y="10" width="5" height="5" rx="1" fill="#ec4899" />
      <rect x="58" y="10" width="5" height="5" rx="1" fill="#c084fc" />

      <rect x="10" y="38" width="5" height="5" rx="1" fill="#c084fc" />
      <rect x="10" y="48" width="5" height="5" rx="1" fill="#ec4899" />
      <rect x="10" y="58" width="5" height="5" rx="1" fill="#c084fc" />

      <rect x="38" y="38" width="10" height="10" rx="2" fill="#7c3aed" />
      <rect x="53" y="38" width="6" height="6" rx="1" fill="#f43f5e" />
      <rect x="64" y="38" width="8" height="5" rx="1" fill="#06b6d4" />
      <rect x="77" y="38" width="12" height="5" rx="1" fill="#c084fc" />

      <rect x="38" y="53" width="7" height="7" rx="1.5" fill="#ec4899" />
      <rect x="50" y="50" width="10" height="8" rx="1" fill="#7c3aed" />
      <rect x="65" y="48" width="6" height="12" rx="1" fill="#f43f5e" />
      <rect x="76" y="48" width="16" height="6" rx="1" fill="#c084fc" />

      <rect x="38" y="66" width="6" height="12" rx="1" fill="#06b6d4" />
      <rect x="49" y="64" width="12" height="6" rx="1" fill="#ec4899" />
      <rect x="66" y="65" width="9" height="9" rx="1.5" fill="#7c3aed" />
      <rect x="80" y="60" width="12" height="8" rx="1" fill="#f43f5e" />

      <rect x="38" y="83" width="14" height="6" rx="1" fill="#c084fc" />
      <rect x="57" y="76" width="6" height="15" rx="1" fill="#7c3aed" />
      <rect x="68" y="79" width="12" height="6" rx="1" fill="#ec4899" />
      <rect x="85" y="74" width="8" height="15" rx="1" fill="#06b6d4" />
    </svg>
  );
}

export default function App() {
  const { showForm } = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors;

  return (
    <div className="landing-wrapper">
      {/* Top Navigation */}
      <header className="landing-header">
        <a href="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <BrandIcon />
          </div>
          <span>QR Studio</span>
          <span className="brand-badge">Shopify Embedded</span>
        </a>

        <nav className="header-links">
          <a
            href="https://shopify.dev/docs/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Documentation
          </a>
          <a
            href="https://status.shopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Platform Status
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              <span>Native Metaobject Integration • 100% Serverless</span>
            </div>

            <h1 className="hero-heading">
              Generate & Track <br />
              <span className="gradient-text">Smart QR Codes</span> <br />
              for Shopify.
            </h1>

            <p className="hero-subheading">
              Connect offline customers directly to product pages or pre-filled
              checkouts with automatic discount codes. Fully managed inside your
              Shopify admin.
            </p>

            {/* Merchant Login Form */}
            {showForm && (
              <div className="auth-card">
                <div className="auth-form-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Connect your Shopify Store</span>
                </div>

                <Form method="post">
                  <div className="auth-input-group">
                    <div className="input-container">
                      <StoreIcon />
                      <input
                        type="text"
                        name="shop"
                        id="shop-input"
                        placeholder="your-store.myshopify.com"
                        required
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </div>
                    <button className="auth-submit-btn" type="submit">
                      <span>Launch in Admin</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  {errors?.shop ? (
                    <div className="auth-error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{errors.shop}</span>
                    </div>
                  ) : (
                    <div className="auth-hint">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>Opens the app directly inside Shopify Admin (e.g. qr-code-dev-divinka)</span>
                    </div>
                  )}
                </Form>
              </div>
            )}
          </div>

          {/* Interactive Visual / Live Demo Card */}
          <div className="hero-visual">
            <div className="demo-card-frame">
              <div className="demo-header">
                <div className="demo-store-info">
                  <div className="demo-store-avatar">QS</div>
                  <div>
                    <div className="demo-store-title">qr-code-dev-divinka</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Live Store Connection</div>
                  </div>
                </div>
                <span className="demo-status-pill">Active</span>
              </div>

              <div className="demo-qr-box">
                <div className="demo-qr-graphic">
                  <DemoQRCodeSvg />
                </div>
                <div className="demo-qr-action">
                  <span>Gift Card • Direct-to-Checkout</span>
                </div>
              </div>

              <div className="demo-stats-row">
                <div className="demo-stat-card">
                  <div className="demo-stat-label">Total Scans</div>
                  <div className="demo-stat-val">1,420</div>
                </div>
                <div className="demo-stat-card">
                  <div className="demo-stat-label">Scan Conversion</div>
                  <div className="demo-stat-val">98.4%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Features Section */}
        <section className="features-section">
          <div className="section-tag">Powerful Capabilities</div>
          <h2 className="section-heading">Designed for Modern Commerce</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-pink">
                <CartLightningIcon />
              </div>
              <h3 className="feature-title">Direct-to-Cart Links</h3>
              <p className="feature-desc">
                Bypass traditional product pages. Route shoppers directly to a
                pre-populated Shopify checkout with discounts automatically
                applied at payment.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-purple">
                <ChartAnalyticsIcon />
              </div>
              <h3 className="feature-title">Live Scan Analytics</h3>
              <p className="feature-desc">
                Gain instant visibility into customer foot traffic. Every scan
                is securely counted in real-time, helping you measure packaging
                and in-store ROI.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-cyan">
                <ShieldNativeIcon />
              </div>
              <h3 className="feature-title">Native Metaobjects</h3>
              <p className="feature-desc">
                Zero external databases required. Your QR configurations and
                scan counters live directly inside your Shopify store schema as
                native App Metaobjects.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="workflow-section">
          <div className="section-tag">Simple Setup</div>
          <h2 className="section-heading">How It Works in 3 Steps</h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Connect Your Store</h3>
              <p className="step-desc">
                Enter your store handle to open the app inside Shopify Admin with
                secure App Bridge authentication.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Choose Destination</h3>
              <p className="step-desc">
                Select any product or variant from your Shopify catalog and attach
                optional discount codes.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Export & Print</h3>
              <p className="step-desc">
                Download crisp vector or PNG QR codes ready for product tags,
                packaging inserts, or counter displays.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-copy">
            © {new Date().getFullYear()} QR Studio for Shopify. Hosted on Vercel Serverless.
          </div>
          <div className="footer-status-pill">
            <span className="status-dot" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
