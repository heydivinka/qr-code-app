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
  };
};

export default function QRCode() {
  const { image, title } = useLoaderData();

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
      <h1>{title}</h1>
      <img src={image} alt={`QR Code for ${title}`} />
    </main>
  );
}

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
      <p>This QR code does not exist or may have been deleted.</p>
    </main>
  );
}

