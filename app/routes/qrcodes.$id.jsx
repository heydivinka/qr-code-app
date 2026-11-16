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

  invariant(shop, "Missing shop parameter");

  const { admin } = await unauthenticated.admin(shop);

  const qrCode = await getQRCode(params.id, admin.graphql, shop, url.origin);
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
        padding: "2.5rem 1.25rem",
        background:
          "radial-gradient(circle at 50% -10%, rgba(124, 58, 237, 0.3) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), #080b11",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(15, 23, 42, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: "1.75rem 1.75rem 1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(30, 41, 59, 0.4)",
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
                gap: "0.45rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#c084fc",
                background: "rgba(124, 58, 237, 0.2)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#a855f7",
                  boxShadow: "0 0 8px #a855f7",
                }}
              />
              Verified QR Pass
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#94a3b8",
              }}
            >
              {shop}
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.55rem",
              fontWeight: 800,
              lineHeight: 1.25,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>

          {productTitle && (
            <p
              style={{
                margin: "0.45rem 0 0",
                fontSize: "0.9rem",
                color: "#94a3b8",
              }}
            >
              Target: <strong style={{ color: "#f1f5f9" }}>{productTitle}</strong>{" "}
              •{" "}
              <span style={{ color: "#22d3ee" }}>
                {destination === "checkout" ? "Direct Checkout" : "Product Page"}
              </span>
            </p>
          )}
        </div>

        {/* QR Code Presentation Box */}
        <div
          style={{
            padding: "2rem",
            background: "rgba(8, 11, 17, 0.6)",
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
              borderRadius: "18px",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.2)",
              border: "2px solid rgba(255, 255, 255, 0.15)",
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
              color: "#94a3b8",
              margin: "1.15rem 0 0",
              textAlign: "center",
            }}
          >
            Scan with your mobile camera or test the link below
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "1.35rem 1.75rem",
            background: "rgba(30, 41, 59, 0.4)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
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
              padding: "0.9rem 1.25rem",
              background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 4px 20px rgba(236, 72, 153, 0.45)",
              transition: "transform 0.15s ease",
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
              padding: "0.8rem 1.25rem",
              background: "rgba(255, 255, 255, 0.06)",
              color: "#e2e8f0",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "1px solid rgba(255, 255, 255, 0.14)",
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
        background: "#080b11",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          background: "rgba(15, 23, 42, 0.8)",
          padding: "2.5rem 2rem",
          borderRadius: "20px",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.15)",
            color: "#f43f5e",
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
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.5 }}>
          This QR code does not exist or may have been deleted from Shopify Admin.
        </p>
      </div>
    </div>
  );
}
