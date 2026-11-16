import { redirect, Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server.js";
import "./landing.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }) => {
  const formData = await request.clone().formData();
  let rawShop = String(formData.get("shop") || "").trim().toLowerCase();
  rawShop = rawShop.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!rawShop) {
    return { errors: { shop: "Please enter your store domain" } };
  }

  const shopDomain = rawShop.includes(".")
    ? rawShop
    : `${rawShop}.myshopify.com`;

  const newBody = new URLSearchParams({ shop: shopDomain });
  const loginRequest = new Request(request.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: newBody.toString(),
  });

  const response = await login(loginRequest);
  if (response instanceof Response) {
    return response;
  }

  if (response?.shop) {
    return {
      errors: { shop: "Please enter a valid myshopify.com store domain" },
    };
  }

  return { errors: {} };
};

function BrandIcon() {
  return (
    <svg
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
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CartLightningIcon() {
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
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <polyline points="13 2 9 8 13 8 11 14 17 6 13 6 13 2" />
    </svg>
  );
}

function DatabaseIcon() {
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
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function ChartAnalyticsIcon() {
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
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M2 20h20" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function VectorQRCodeSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="#0f172a"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QR Code Sample Preview"
    >
      {/* Top Left Finder */}
      <rect x="5" y="5" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="13" y="13" width="12" height="12" rx="1.5" fill="#2563eb" />

      {/* Top Right Finder */}
      <rect x="67" y="5" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="75" y="13" width="12" height="12" rx="1.5" fill="#2563eb" />

      {/* Bottom Left Finder */}
      <rect x="5" y="67" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="13" y="75" width="12" height="12" rx="1.5" fill="#2563eb" />

      {/* Timing Patterns */}
      <rect x="38" y="10" width="5" height="5" rx="1" fill="#0f172a" />
      <rect x="48" y="10" width="5" height="5" rx="1" fill="#0f172a" />
      <rect x="58" y="10" width="5" height="5" rx="1" fill="#0f172a" />

      <rect x="10" y="38" width="5" height="5" rx="1" fill="#0f172a" />
      <rect x="10" y="48" width="5" height="5" rx="1" fill="#0f172a" />
      <rect x="10" y="58" width="5" height="5" rx="1" fill="#0f172a" />

      {/* Data Cells */}
      <rect x="38" y="38" width="10" height="10" rx="1.5" fill="#2563eb" />
      <rect x="53" y="38" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="64" y="38" width="8" height="5" rx="1" fill="#0f172a" />
      <rect x="77" y="38" width="12" height="5" rx="1" fill="#0f172a" />

      <rect x="38" y="53" width="7" height="7" rx="1" fill="#0f172a" />
      <rect x="50" y="50" width="10" height="8" rx="1" fill="#2563eb" />
      <rect x="65" y="48" width="6" height="12" rx="1" fill="#0f172a" />
      <rect x="76" y="48" width="16" height="6" rx="1" fill="#0f172a" />

      <rect x="38" y="66" width="6" height="12" rx="1" fill="#0f172a" />
      <rect x="49" y="64" width="12" height="6" rx="1" fill="#0f172a" />
      <rect x="66" y="65" width="9" height="9" rx="1.5" fill="#2563eb" />
      <rect x="80" y="60" width="12" height="8" rx="1" fill="#0f172a" />

      <rect x="38" y="83" width="14" height="6" rx="1" fill="#0f172a" />
      <rect x="57" y="76" width="6" height="15" rx="1" fill="#0f172a" />
      <rect x="68" y="79" width="12" height="6" rx="1" fill="#2563eb" />
      <rect x="85" y="74" width="8" height="15" rx="1" fill="#0f172a" />
    </svg>
  );
}

export default function App() {
  const { showForm } = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors;

  return (
    <div className="landing-wrapper">
      {/* Top Header Navigation */}
      <header className="landing-header">
        <a href="/" className="brand-logo" aria-label="QR Studio home">
          <div className="brand-icon-wrapper">
            <BrandIcon />
          </div>
          <span>QR Studio</span>
          <span className="brand-badge">Shopify Embedded</span>
        </a>

        <nav className="header-links" aria-label="Primary navigation">
          <a href="#features" className="header-link">
            Features
          </a>
          <a href="#specifications" className="header-link">
            Architecture
          </a>
          <a
            href="https://status.shopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Shopify Status
          </a>
          <a href="#connect-store" className="header-cta-btn">
            Launch Store
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero-section" id="connect-store">
          <div className="hero-content">
            <div className="hero-pill">
              <CheckIcon />
              <span>Native Metaobject Integration • 100% Serverless</span>
            </div>

            <h1 className="hero-heading">
              Generate & Deploy Smart QR Codes Directly in Shopify Admin
            </h1>

            <p className="hero-subheading">
              Connect offline shoppers to product handles or direct-to-cart
              checkout links with automated discount application. Zero external
              databases or third-party redirect middle layers required.
            </p>

            {/* Merchant Access Form */}
            {showForm && (
              <div className="auth-card">
                <div className="auth-form-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Open Store in Shopify Admin</span>
                </div>

                <Form method="post">
                  <div className="auth-input-group">
                    <div className="input-container">
                      <StoreIcon />
                      <label htmlFor="shop-domain" className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                        Shopify Store Domain
                      </label>
                      <input
                        type="text"
                        name="shop"
                        id="shop-domain"
                        placeholder="your-store-handle.myshopify.com"
                        required
                        autoComplete="organization"
                        spellCheck="false"
                      />
                    </div>
                    <button className="auth-submit-btn" type="submit">
                      <span>Launch in Admin</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  {errors?.shop ? (
                    <div className="auth-error" role="alert">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{errors.shop}</span>
                    </div>
                  ) : (
                    <div className="auth-hint">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>Opens the app inside your Shopify store (e.g. qr-code-dev-divinka)</span>
                    </div>
                  )}
                </Form>
              </div>
            )}
          </div>

          {/* Authentic Live Specification Preview */}
          <div className="hero-visual">
            <div className="demo-card-frame">
              <div className="demo-header">
                <div className="demo-store-info">
                  <div className="demo-store-avatar">QS</div>
                  <div>
                    <div className="demo-store-title">qr-code-dev-divinka</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Production Store Connection</div>
                  </div>
                </div>
                <span className="demo-status-pill">Active Link</span>
              </div>

              <div className="demo-body">
                <div className="demo-qr-box">
                  <div className="demo-qr-graphic">
                    <VectorQRCodeSvg />
                  </div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2563eb" }}>
                    Scan Target: Direct-to-Cart
                  </div>
                </div>

                <div className="demo-spec-list">
                  <div className="demo-spec-row">
                    <span className="demo-spec-label">Resolved Route</span>
                    <span className="demo-spec-val">/cart/4492018812:1</span>
                  </div>
                  <div className="demo-spec-row">
                    <span className="demo-spec-label">Storage Backend</span>
                    <span className="demo-spec-val">$app:qr_code (Metaobject)</span>
                  </div>
                  <div className="demo-spec-row">
                    <span className="demo-spec-label">Redirect Speed</span>
                    <span className="demo-spec-val">HTTP 302 (~45ms Edge)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="features-section" id="features">
          <div className="section-tag">Core Architecture</div>
          <h2 className="section-heading">Designed for High-Converting Retail</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-badge">
                <CartLightningIcon />
              </div>
              <h3 className="feature-title">Direct-to-Cart Permalinks</h3>
              <p className="feature-desc">
                Bypass standard product page browsing. Route packaging scans
                straight into a pre-populated checkout cart with variant line
                items and discount codes attached.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge">
                <DatabaseIcon />
              </div>
              <h3 className="feature-title">Native App Metaobjects</h3>
              <p className="feature-desc">
                Zero external database dependencies. All QR configurations,
                destination handles, and scan metrics persist directly inside
                Shopify's native GraphQL Metaobject architecture.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge">
                <ChartAnalyticsIcon />
              </div>
              <h3 className="feature-title">Real-Time Scan Metrics</h3>
              <p className="feature-desc">
                Track foot-traffic engagement across physical packaging,
                merchandise tags, and retail flyers with automatic asynchronous
                scan count increments.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture Comparison */}
        <section className="spec-section" id="specifications">
          <div className="section-tag">Technical Specification</div>
          <h2 className="section-heading">Native Integration vs Legacy Redirectors</h2>

          <div className="spec-table-frame">
            <table className="spec-table">
              <thead>
                <tr>
                  <th scope="col">Feature Dimension</th>
                  <th scope="col">QR Studio (This App)</th>
                  <th scope="col">Legacy Third-Party Redirectors</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Data Location</strong></td>
                  <td><span className="badge-tag">Shopify Native Metaobjects</span> (App-Owned)</td>
                  <td>External third-party SaaS database</td>
                </tr>
                <tr>
                  <td><strong>Redirect Method</strong></td>
                  <td>Instant HTTP 302 Edge Redirect (&lt;50ms)</td>
                  <td>Client-side JavaScript tracking pixel bounce</td>
                </tr>
                <tr>
                  <td><strong>Checkout Deep-Linking</strong></td>
                  <td>Direct variant permalink (<code>/cart/variant_id:1</code>)</td>
                  <td>Standard storefront URL only</td>
                </tr>
                <tr>
                  <td><strong>Admin Experience</strong></td>
                  <td>Shopify App Bridge & Polaris Web Components</td>
                  <td>Separate dashboard with external login credentials</td>
                </tr>
                <tr>
                  <td><strong>Hosting Model</strong></td>
                  <td>Serverless Vercel Edge Runtime</td>
                  <td>Monolithic dedicated web servers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
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
