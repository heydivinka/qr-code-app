import { redirect } from "react-router";
import invariant from "tiny-invariant";

import { unauthenticated } from "../shopify.server";
import {
  getQRCode,
  incrementQRCodeScans,
} from "../models/QRCode.server";

export const loader = async ({ request, params }) => {
  invariant(params.id, "Could not find QR code destination");

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  invariant(shop, "Missing shop parameter");

  const { admin } = await unauthenticated.admin(shop);

  const qrCode = await getQRCode(params.id, admin.graphql, shop);
  invariant(qrCode, "Could not find QR code destination");

  await incrementQRCodeScans(qrCode.id, qrCode.scans, admin.graphql);

  return redirect(qrCode.destinationUrl);
};

export function ErrorBoundary() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1>QR Code Not Found</h1>
      <p>This QR code destination could not be loaded or is invalid.</p>
    </main>
  );
}

