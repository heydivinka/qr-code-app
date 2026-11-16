import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { unauthenticated } from "../shopify.server";
import { getQRCode } from "../models/QRCode.server";

export const loader = async ({ request, params }) => {
  invariant(params.id, "Could not find QR code destination");

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  invariant(shop, "Missing shop parameter");

  const { admin } = await unauthenticated.admin(shop);

  const qrCode = await getQRCode(params.id, admin.graphql, shop);
  invariant(qrCode, "Could not find QR code destination");

  return {
    title: qrCode.title,
    image: qrCode.image,
    productTitle: qrCode.productTitle,
    destination: qrCode.destination,
    scans: qrCode.scans,
    scanUrl: `/qrcodes/${params.id}/scan?shop=${shop}`,
    shop,
  };
};

export default function QRCode() {
  const { title, image, productTitle, destination, scanUrl, shop } =
    useLoaderData();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background:
          "radial-gradient(circle at 50% 0%, rgba(0, 128, 96, 0.12) 0%, transparent 60%), #f8fafc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: "1.5rem 1.75rem 1.25rem",
            borderBottom: "1px solid #f1f5f9",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#008060",
                background: "#e3f1df",
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#008060",
                }}
              />
              Shopify QR Pass
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#64748b",
              }}
            >
              {shop}
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              lineHeight: 1.25,
              color: "#0f172a",
              margin: 0,
            }}
          >
            {title}
          </h1>

          {productTitle && (
            <p
              style={{
                margin: "0.35rem 0 0",
                fontSize: "0.9rem",
                color: "#64748b",
              }}
            >
              Linked to <strong>{productTitle}</strong> •{" "}
              {destination === "checkout" ? "Direct Checkout" : "Product Page"}
            </p>
          )}
        </div>

        {/* QR Code Presentation Box */}
        <div
          style={{
            padding: "2rem",
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "1rem",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
              display: "inline-block",
            }}
          >
            <img
              src={image}
              alt={`QR Code for ${title}`}
              style={{
                display: "block",
                width: "240px",
                height: "240px",
                imageRendering: "pixelated",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.825rem",
              color: "#64748b",
              margin: "1rem 0 0",
              textAlign: "center",
            }}
          >
            Point your mobile camera to scan and visit destination
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            background: "#ffffff",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <a
            href={scanUrl}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.25rem",
              background: "linear-gradient(135deg, #008060 0%, #004c3f 100%)",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.925rem",
              boxShadow: "0 4px 12px rgba(0, 128, 96, 0.25)",
            }}
          >
            <span>Test Destination Link</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          <a
            href={image}
            download={`${title || "qr-code"}.png`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: "#ffffff",
              color: "#334155",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "1px solid #cbd5e1",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download High-Res PNG</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f8fafc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#0f172a",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          background: "white",
          padding: "2.5rem 2rem",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          QR Code Not Found
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
          This QR code does not exist or may have been deleted from Shopify Admin.
        </p>
      </div>
    </div>
  );
}
