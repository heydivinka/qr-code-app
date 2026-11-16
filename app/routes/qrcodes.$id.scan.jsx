import { redirect } from "react-router";
import invariant from "tiny-invariant";
import prisma from "../db.server";
import { unauthenticated } from "../shopify.server";
import {
  getQRCode,
  getDestinationUrl,
  incrementQRCodeScans,
} from "../models/QRCode.server";

export const loader = async ({ request, params }) => {
  invariant(params.id, "Could not find QR code destination");

  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  // Fallback if shop query param is missing: look up active session in DB
  if (!shop) {
    try {
      const session = await prisma.session.findFirst({
        orderBy: { expires: "desc" },
      });
      shop = session?.shop;
    } catch (e) {
      console.warn("Failed to retrieve fallback session from db:", e);
    }
  }

  if (!shop) {
    throw new Response("Missing shop parameter", { status: 400 });
  }

  try {
    const { admin } = await unauthenticated.admin(shop);
    const qrCode = await getQRCode(params.id, admin.graphql, shop, url.origin);

    if (qrCode) {
      // Increment scan counter asynchronously without blocking redirect if it fails
      try {
        await incrementQRCodeScans(qrCode.id, qrCode.scans, admin.graphql);
      } catch (incError) {
        console.warn("Could not increment QR scan counter:", incError);
      }

      const destination =
        qrCode.destinationUrl ||
        getDestinationUrl(qrCode, shop) ||
        `https://${shop}`;

      return redirect(destination);
    }
  } catch (error) {
    console.error("QR Code Scan redirect error:", error);
  }

  // Graceful fallback to storefront if specific QR destination failed
  return redirect(`https://${shop}`);
};

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
        backgroundColor: "#f8fafc",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily:
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          background: "#ffffff",
          padding: "2.5rem 2rem",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
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
            color: "#0f172a",
          }}
        >
          QR Code Destination Not Found
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem", lineHeight: 1.5 }}>
          This QR code could not be loaded or its destination product has been removed.
        </p>
      </div>
    </div>
  );
}
