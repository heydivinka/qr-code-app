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
        background: "#090d16",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
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
            fontSize: "1.4rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          QR Code Destination Not Found
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>
          This QR code could not be loaded or its destination product has been removed.
        </p>
      </div>
    </div>
  );
}
