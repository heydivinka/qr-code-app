import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import prisma from "../db.server";
import { unauthenticated } from "../shopify.server";
import { getQRCode } from "../models/QRCode.server";

export const loader = async ({ request, params }) => {
  invariant(params.id, "Could not find QR code destination");

  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  if (!shop) {
    try {
      const session = await prisma.session.findFirst({
        orderBy: { expires: "desc" },
      });
      shop = session?.shop;
    } catch (e) {
      console.warn("Failed to find fallback session in db:", e);
    }
  }

  if (!shop) {
    throw new Response("Missing shop parameter", { status: 400 });
  }

  let qrCode = null;
  try {
    const { admin } = await unauthenticated.admin(shop);
    qrCode = await getQRCode(params.id, admin.graphql, shop, url.origin);
  } catch (error) {
    console.error("Failed to load QR code destination:", error);
  }

  if (!qrCode) {
    throw new Response("Could not find QR code destination", { status: 404 });
  }

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
        padding: "2.5rem 1.25rem",
        backgroundColor: "#f8fafc",
        backgroundImage:
          "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily:
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
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
              marginBottom: "0.75rem",
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
                letterSpacing: "0.06em",
                color: "#2563eb",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
              }}
            >
              Shopify QR Pass
            </div>
            <span
              style={{
                fontSize: "0.8125rem",
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
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
            }}
          >
            {title}
          </h1>

          {productTitle && (
            <p
              style={{
                margin: "0.35rem 0 0",
                fontSize: "0.875rem",
                color: "#475569",
              }}
            >
              Linked to <strong style={{ color: "#0f172a" }}>{productTitle}</strong>{" "}
              •{" "}
              <span style={{ color: "#2563eb", fontWeight: 600 }}>
                {destination === "checkout" ? "Direct Checkout" : "Product Details"}
              </span>
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
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
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
              fontSize: "0.8125rem",
              color: "#64748b",
              margin: "1rem 0 0",
              textAlign: "center",
            }}
          >
            Scan with your mobile camera or test the destination below
          </p>
        </div>

        {/* Action Buttons */}
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
              minHeight: "44px",
              padding: "0 1.25rem",
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9375rem",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.2)",
              transition: "background-color 150ms ease",
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
              aria-hidden="true"
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
              minHeight: "44px",
              padding: "0 1.25rem",
              background: "#ffffff",
              color: "#334155",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "1px solid #cbd5e1",
              transition: "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
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
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          background: "#ffffff",
          padding: "2.5rem 2rem",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            fontFamily: "'Space Grotesk', -apple-system, sans-serif",
          }}
        >
          QR Code Not Found
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem", lineHeight: 1.5 }}>
          This QR code does not exist or may have been deleted from Shopify Admin.
        </p>
      </div>
    </div>
  );
}
