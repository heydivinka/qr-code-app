import { redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  return redirect(`/app${url.search}`);
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

