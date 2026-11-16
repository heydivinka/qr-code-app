import shopify from "./app/shopify.server.js";

async function main() {
  const req = new Request("https://qr-code-app-flax.vercel.app/?index", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ shop: "qr-code-dev-divinka.myshopify.com" }).toString(),
  });

  const res = await shopify.login(req);
  console.log("Is Response:", res instanceof Response);
  if (res instanceof Response) {
    console.log("Status:", res.status);
    console.log("Location header:", res.headers.get("location"));
  } else {
    console.log("Object:", res);
  }
}

main().catch(console.error);

