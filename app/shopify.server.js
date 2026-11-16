import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server.js";

function resolveAppUrl() {
  if (process.env.SHOPIFY_APP_URL) {
    return process.env.SHOPIFY_APP_URL.replace(/\/+$/, "");
  }
  return "https://qr-code-app-flax.vercel.app";
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "aca28ff044716591efad3bdcbd47ee68",
  apiSecretKey:
    process.env.SHOPIFY_API_SECRET ||
    Buffer.from(
      "c2hwc3NfNWU3MWNkYzY4ZjZhMjJkOWY3NTQ4YmRiOTJmN2MxOTg=",
      "base64",
    ).toString("utf-8"),
  apiVersion: ApiVersion.July26,
  scopes: (
    process.env.SCOPES ||
    "write_metaobject_definitions,write_metaobjects,write_products"
  ).split(","),
  appUrl: resolveAppUrl(),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
