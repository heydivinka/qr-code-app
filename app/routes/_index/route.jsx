import { useState } from "react";
import { redirect, Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import "./landing.css";

const CART_QR_URL =
  "data:image/png;base64,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";

const PRODUCT_QR_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWcAAAFnCAYAAAB6uIiNAAAAAklEQVR4AewaftIAAAy+SURBVO3B0Y0dSw5EwRRx/aAH6b8d6QG90IeEtx5sNTCFBmd0In79/fP7PwEAVikBANYpAQDWKQEA1ikBANYpAQDWKQEA1ikBANYpAQDWKQEA1vnoobb1L5tEb2pbJ5PolrZ1MoluaFtvmkQnbeuJSXTStr6jSXTStk4m0RNt6181iU5KAIB1SgCAdUoAgHVKAIB1SgCAdUoAgHVKAIB1SgCAdT66aBJ9R23rO2pbJ5PoiUl00rbeNIluaFsnk+iJtnUyiW5oWyeT6Im2ddK2tplE31Hb+qoSAGCdEgBgnRIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnY9e1rbeNIne1LZOJtENk+hNk+ikbX1HbWubSYSztvWmSfSGEgBgnRIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnRIAYJ2P8KO1rTdNolva1lsm0S1t62QSnbStbSYR3lECAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArPMRXte2bmhbJ5Polrb1pkl00rZuaFtPTKKTSXTStk4m0S1t62QSYY8SAGCdEgBgnRIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnY9eNon+dZPohrZ1S9s6mUQ3tK0nJtENk+ikbT3Rtm6YRDe0rScm0UnbumESvWkS/UQlAMA6JQDAOiUAwDolAMA6JQDAOiUAwDolAMA6JQDAOh9d1LZwR9s6mUQnbeuJSXTStk4m0U82iU7a1g1t62QSPdG2TibRSdt6U9v6V5UAAOuUAADrlAAA65QAAOuUAADrlAAA65QAAOuUAADr/Pr75/d/wjVt62QSnbStn2oSvalt/VST6Ja2dcMkwteVAADrlAAA65QAAOuUAADrlAAA65QAAOuUAADrlAAA65QAAOt89FDbOplEJ23rO5pET0yik7Z1wyQ6aVs/WdvaZhK9pW09MYlumES3tK3vaBK9oQQAWKcEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFjnox9uEv1UbeuWSXTStm5oW7dMom3a1g2T6GQSPdG2TibRSds6mURPTKK3tK0nJtFJ2zqZRF9VAgCsUwIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArPPRQ5PoO2pbb5pEN0yiG9rWE23rhkl0S9t6S9t6YhLdMIlO2tYtk+ikbZ1MopO2tc0keqJt3dC2/p9JdFICAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKxTAgCs89HLJtFJ27plEt3Qtm6ZRCdt602T6KRt3dC2nphEb5lET7StG9rWySS6pW19R5PoTZPohrb1VSUAwDolAMA6JQDAOiUAwDolAMA6JQDAOiUAwDolAMA6H0Ft65a2dTKJbphEJ23rlkn0prZ1MoneNIlO2tZb2ta/rm39RCUAwDolAMA6JQDAOiUAwDolAMA6JQDAOiUAwDolAMA6JQDAOh891LZOJtFJ27plEt0wiU7a1nc0iW5pWyeTaJu29a+bRDe0rVsm0UnbOplEP1EJALBOCQCwTgkAsE4JALBOCQCwTgkAsE4JALBOCQCwzkcXta03ta3vqG1t07ZuaFvbTKKTtnXLJNqmbd0wiU7a1pva1i2T6KRtfdUkOikBANYpAQDWKQEA1ikBANYpAQDWKQEA1ikBANYpAQDW+fX3z+//tEzbemISnbStk0l0S9s6mUQnbeuGSfRE2zqZRG9qW2+ZRE+0rZNJdEPbOplET7Stf9kkuqVtnUyiryoBANYpAQDWKQEA1ikBANYpAQDWKQEA1ikBANYpAQDW+eihtnXDJDqZRE+0rZNJdNK2TibRLW3rO2pbb5pEP1XbuqFt3TKJTtrWmybRSdu6pW1tUQIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKxTAgCs89FFk2ibtnUyiU7a1i2T6KRtnUyik7b1xCQ6aVs3TKJb2tbJJDppW7e0rRsm0Unb2mYS3dK2TibRLZPopG29oQQAWKcEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFjn198/v//TJW3rTZPopG19R5PopG2dTKIn2tbJJDppW7dMopO2dcMkeqJtnUyi76htnUyiN7Wtk0n0prb1VZPopAQAWKcEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFjno4fa1g2T6E2T6Ia29cQkesskOmlbT0yit0yibdrWNm3rZBJ9V23rZBKdtK2TSXTLJDppW19VAgCsUwIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArPPRQ5PopG2dtK2TSfRE2zqZRCdt62QSPdG2TibRWybRE23rZBK9qW2dTKKTtnUyiW5pWyeT6GQSnbStbdrWd9W2TibRyST6qhIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnV9///z+Tw+0rZNJdNK23jSJbmhbT0yik7Z1wyQ6aVtvmkQnbeuJSXRD27plEt3Qtk4m0TZt62QSbdO2nphEW5QAAOuUAADrlAAA65QAAOuUAADrlAAA65QAAOuUAADrfLTQJHqibZ20rRsm0RNt64ZJdNK23jSJTtrWm9rWySTaZhLd0LbeNIlO2ta/rm39P5PopAQAWKcEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFjno4cm0UnbetMkOmlbJ5PopG09MYk2mUQ/2SQ6aVu3TKKTtnUyiW6YRLe0rRsm0RNt6y2T6Ja2dTKJvqoEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFinBABY56OH2tbJJDppW2+aRCdt601t62QSnUyiN7WtGybRLW3rhkn0RNu6oW19R23rTZPopG3d0rZOJtFJ2/p/JtFJCQCwTgkAsE4JALBOCQCwTgkAsE4JALBOCQCwTgkAsM6vv39+/6cH2tbJJDppW2+aRDe0rVsm0UnbumESPdG2TibRSdu6ZRJ9R23rhkl00raemEQ3tK1bJtFJ2zqZRCdt64lJtEUJALBOCQCwTgkAsE4JALBOCQCwTgkAsE4JALBOCQCwTgkAsM5HC02iW9rWdzSJTtrWSdu6pW2dTKJb2tYNk+iWtnUyibZpW2+ZRE+0rW3a1hsm0UkJALBOCQCwTgkAsE4JALBOCQCwTgkAsE4JALBOCQCwzkcvm0TbTKKTtrXNJPqO2tYTk+ikbW3Ttk4m0UnbOplET7StGybRSdt6U9s6mURvaltfVQIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKzz0cva1skkelPbOplE27Stk0n0RNs6mURvalsnk+hNk+ikbZ20rRva1i2T6KRtfUdt67spAQDWKQEA1ikBANYpAQDWKQEA1ikBANYpAQDWKQEA1vnooUl0wyR60yR6U9s6mUQnbetNk+ikbZ1Moje1rRsm0RNt62QSnbStk0l0S9t6yyR6U9u6ZRKdtK2TSfRVJQDAOiUAwDolAMA6JQDAOiUAwDolAMA6JQDAOiUAwDolAMA6Hz3Utv5lk+iJSXTStk4m0XfUtk4m0RNt62QS3dC2nphEJ23rZBKdtK2TSfTEJNqmbZ1Mohsm0RNt64a29f9MopMSAGCdEgBgnRIAYJ0SAGCdEgBgnRIAYJ0SAGCdEgBgnY8umkTfUdu6pW39VJPopG2dtK1b2tbJJDqZRE+0rZNJdNK2TibRLW3rZBK9aRK9pW09MYluaFtfVQIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKzz0cva1psm0TaT6Ia2dcsk2mYS3dC2TibRNm3rTW3rhra1zSR6om1tUQIArFMCAKxTAgCsUwIArFMCAKxTAgCsUwIArFMCAKzzEVZqWzdMoifa1lsm0RNt64ZJ9Ka2dcMkuqVtnUyiG9rWLZPopG2dtK0nJtENbeurSgCAdUoAgHVKAIB1SgCAdUoAgHVKAIB1SgCAdUoAgHVKAIB1PsLr2tbJJDppWydt64lJdEPbOmlbt0yiN02ik7Z1MolO2tbJJHpiEt3Qtk4m0Zsm0Zva1htKAIB1SgCAdUoAgHVKAIB1SgCAdUoAgHVKAIB1SgCAdT562ST6ySbRSdu6YRK9qW3dMIne1LZOJtETbetkEp20rW3a1pva1skkOmlbJ5Polkl00ra+qgQAWKcEAFinBABYpwQAWKcEAFinBABYpwQAWKcEAFjn198/v//TA23rXzaJnmhbb5lE27Stk0n0RNs6mUQnbeuWSXTStk4m0UnbumUS/VRt67uZRCclAMA6JQDAOiUAwDolAMA6JQDAOiUAwDolAMA6v/7++f2fAACrlAAA65QAAOuUAADrlAAA65QAAOuUAADrlAAA65QAAOv8D2ikzIDS29E9AAAAAElFTkSuQmCC";

const PREVIEW_MODES = {
  cart: {
    id: "cart",
    label: "Cart checkout",
    title: "Merino Travel Pack",
    handle: "merino-pack-checkout",
    destinationLabel: "Direct cart checkout",
    url: "example-shop.myshopify.com/cart/4492018812:1?discount=PACK15",
    discount: "PACK15",
    summary:
      "Routes shoppers straight to checkout with your variant and discount applied.",
  },
  product: {
    id: "product",
    label: "Product page",
    title: "Ceramic Pour-Over Dripper",
    handle: "dripper-shelf-card",
    destinationLabel: "Storefront product detail",
    url: "example-shop.myshopify.com/products/ceramic-dripper?variant=982104",
    discount: "None",
    summary:
      "Opens the exact storefront product variant page when a label is scanned.",
  },
};

export const meta = () => [
  { title: "QR Studio for Shopify checkout and product labels" },
  {
    name: "description",
    content:
      "Create scannable product and cart QR codes, discount tags, and retail stickers inside Shopify Admin.",
  },
];

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Schibsted+Grotesk:wght@400;500;700&display=swap",
  },
];

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

function BrandIcon() {
  return (
    <svg
      className="brand-mark__icon"
      width={20}
      height={20}
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
  );
}

export default function App() {
  const { showForm } = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors;

  const [activeMode, setActiveMode] = useState("cart");
  const current = PREVIEW_MODES[activeMode];
  const qrImage = activeMode === "cart" ? CART_QR_URL : PRODUCT_QR_URL;

  return (
    <div>
      <header className="site-header">
        <div className="container nav-row">
          <a className="brand-mark" aria-label="QR Studio home" href="/">
            <BrandIcon />
            <span>QR Studio</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            <a className="nav-link" href="#destinations">
              Destinations
            </a>
            <a className="nav-link" href="#stickers">
              Stickers
            </a>
            <a className="nav-link" href="#faq">
              Questions
            </a>
            <a
              href="#shop-connect"
              className="btn btn--secondary btn--compact"
            >
              Store login
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="shop-connect">
          <div className="container hero-grid">
            <div className="hero__copy">
              <h1>Scannable QR labels tied to Shopify checkout.</h1>
              <p className="lead">
                Generate product or cart QR codes, discount tags, and printable
                shop stickers.
              </p>
              {showForm && (
                <Form method="post" className="connect-form">
                  <div className="field-group">
                    <label className="field-label" htmlFor="shop-domain">
                      Shopify store domain
                    </label>
                    <div className="field-row">
                      <input
                        id="shop-domain"
                        className="field-input"
                        type="text"
                        name="shop"
                        placeholder="my-store.myshopify.com"
                        autoComplete="url"
                        required
                      />
                      <button type="submit" className="btn btn--primary">
                        Open in Shopify
                      </button>
                    </div>
                  </div>
                  {errors?.shop ? (
                    <p className="field-error">{errors.shop}</p>
                  ) : (
                    <p className="field-help">
                      Enter your myshopify.com domain to open QR Studio in Shopify
                      Admin.
                    </p>
                  )}
                </Form>
              )}
            </div>

            <div className="sticker-tray">
              <div className="sticker-tray__header">
                <span className="sticker-tray__title">Sample sticker output</span>
                <div
                  className="mode-pills"
                  role="tablist"
                  aria-label="Preview destination mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "cart"}
                    className={`mode-pill ${
                      activeMode === "cart" ? "is-active" : ""
                    }`}
                    onClick={() => setActiveMode("cart")}
                  >
                    Cart checkout
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "product"}
                    className={`mode-pill ${
                      activeMode === "product" ? "is-active" : ""
                    }`}
                    onClick={() => setActiveMode("product")}
                  >
                    Product page
                  </button>
                </div>
              </div>

              <div className="sticker-sheet">
                <img
                  className="sticker-qr-img"
                  src={qrImage}
                  width="244"
                  height="244"
                  alt={`Sample QR sticker for ${current.title}`}
                />
                <div className="sticker-meta">
                  <div className="sticker-name">{current.title}</div>
                  <div className="sticker-route">{current.url}</div>
                  <div className="sticker-stub">
                    <span className="mono">{current.handle}</span>
                    {current.discount !== "None" ? (
                      <span className="seal-stamp seal-stamp--tilted">
                        Code {current.discount}
                      </span>
                    ) : (
                      <span className="seal-stamp">Product link</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticker-tray__footer">
                <span>Route: {current.destinationLabel}</span>
                <span>Exports: PNG, ZIP, 3-up print sheet</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-switcher" id="destinations">
          <div className="container">
            <div className="section-head-split">
              <h2>Two scan routes, one printed code.</h2>
              <p className="lead">
                Choose whether a scanned label opens the storefront product
                page or jumps straight into cart checkout.
              </p>
            </div>
            <div className="switcher-panel">
              <dl className="spec-list">
                <div className="spec-row">
                  <dt>Destination mode</dt>
                  <dd>{current.destinationLabel}</dd>
                </div>
                <div className="spec-row">
                  <dt>Resolved path</dt>
                  <dd className="mono">{current.url}</dd>
                </div>
                <div className="spec-row">
                  <dt>Discount code</dt>
                  <dd className="mono">{current.discount}</dd>
                </div>
                <div className="spec-row">
                  <dt>Storage definition</dt>
                  <dd className="mono">$app:qr_code</dd>
                </div>
              </dl>
              <p>{current.summary}</p>
            </div>
          </div>
        </section>

        <section className="band--ink" id="stickers">
          <div className="container">
            <div className="band-head">
              <h2>Print labels one by one or by sheet.</h2>
              <p className="lead">
                Every QR code stays synced with your Shopify catalog and
                exports without external layout tools.
              </p>
            </div>
            <div className="exports-grid">
              <div className="export-item">
                <h3>Shareable public QR card</h3>
                <p className="export-item__desc">
                  Clean public link for PNG downloads and single labels.
                </p>
                <span className="export-item__meta">Route: /qrcodes/:id</span>
              </div>
              <div className="export-item">
                <h3>Selected handle archive</h3>
                <p className="export-item__desc">
                  Bulk-export selected table rows as titled QR PNGs.
                </p>
                <span className="export-item__meta">Format: Batch ZIP</span>
              </div>
              <div className="export-item">
                <h3>Printable sticker sheets</h3>
                <p className="export-item__desc">
                  Cut-guided packaging grid with product title and code.
                </p>
                <span className="export-item__meta">
                  Layout: 3-column sheet
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-faq" id="faq">
          <div className="container faq-layout">
            <h2>Common questions.</h2>
            <div className="faq-list">
              <div className="faq-row">
                <h3>Where are codes saved?</h3>
                <p>Inside Shopify as app-owned metaobjects.</p>
              </div>
              <div className="faq-row">
                <h3>Do scans apply discounts?</h3>
                <p>Yes, active codes attach on redirect.</p>
              </div>
              <div className="faq-row">
                <h3>How are scans counted?</h3>
                <p>Each scan increments its counter via API.</p>
              </div>
              <div className="faq-row">
                <h3>What if products change?</h3>
                <p>Labels resolve updated handles dynamically.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="close-band">
          <div className="container close-band__row">
            <div className="close-band__copy">
              <h2>Open inside Shopify Admin.</h2>
            </div>
            <a href="#shop-connect" className="btn btn--primary">
              Connect store
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-row">
            <div>
              <a className="brand-mark" aria-label="QR Studio home" href="/">
                <BrandIcon />
                <span>QR Studio</span>
              </a>
              <p className="footer-note">Shopify embedded QR generator.</p>
            </div>
            <nav className="footer-links" aria-label="Footer">
              <a className="nav-link" href="#destinations">
                Destinations
              </a>
              <a className="nav-link" href="#stickers">
                Stickers
              </a>
              <a className="nav-link" href="#faq">
                Questions
              </a>
              <a className="nav-link" href="#shop-connect">
                Store login
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
