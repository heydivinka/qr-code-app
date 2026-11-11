import qrcode from "qrcode";

const METAOBJECT_TYPE = "$app:qrcode";

const QR_CODE_FIELDS_FRAGMENT = `#graphql
  fragment QRCodeFields on Metaobject {
    id
    handle
    updatedAt
    title: field(key: "title") {
      value
    }
    product: field(key: "product") {
      value
      reference {
        ... on Product {
          id
          title
          handle
          media(first: 1) {
            nodes {
              preview {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
    productVariant: field(key: "product_variant") {
      value
      reference {
        ... on ProductVariant {
          id
          legacyResourceId
          title
          image {
            url
            altText
          }
        }
      }
    }
    destination: field(key: "destination") {
      value
    }
    scans: field(key: "scans") {
      jsonValue
    }
  }
`;

function formatQRCode(metaobject, shop) {
  const productRef = metaobject.product?.reference;
  const variantRef = metaobject.productVariant?.reference;
  const productId = metaobject.product?.value || productRef?.id || "";
  const productDeleted = Boolean(productId && !productRef);
  const firstMediaImage = productRef?.media?.nodes?.[0]?.preview?.image;
  const productImage = variantRef?.image?.url || firstMediaImage?.url || "";
  const productAlt =
    variantRef?.image?.altText ||
    firstMediaImage?.altText ||
    productRef?.title ||
    "";

  const qrCode = {
    id: metaobject.id,
    handle: metaobject.handle,
    createdAt: metaobject.updatedAt,
    title: metaobject.title?.value || "",
    productId,
    productTitle: productRef?.title || "",
    productHandle: productRef?.handle || "",
    productImage,
    productAlt,
    productDeleted,
    productVariantId:
      metaobject.productVariant?.value || variantRef?.id || "",
    productVariantLegacyId: variantRef?.legacyResourceId || "",
    destination: metaobject.destination?.value || "product",
    scans: Number(metaobject.scans?.jsonValue ?? 0),
  };

  return {
    ...qrCode,
    destinationUrl: shop ? getDestinationUrl(qrCode, shop) : "",
  };
}

export async function getQRCode(handle, graphql, shop) {
  const response = await graphql(
    `#graphql
      ${QR_CODE_FIELDS_FRAGMENT}
      query GetQRCode($handle: MetaobjectHandleInput!) {
        metaobjectByHandle(handle: $handle) {
          ...QRCodeFields
        }
      }
    `,
    {
      variables: {
        handle: {
          type: METAOBJECT_TYPE,
          handle,
        },
      },
    },
  );

  const { data } = await response.json();
  const metaobject = data?.metaobjectByHandle;
  if (!metaobject) {
    return null;
  }

  const formatted = formatQRCode(metaobject, shop);
  const image = shop ? await getQRCodeImage(formatted.handle, shop) : "";

  return {
    ...formatted,
    image,
  };
}

export async function getQRCodes(graphql, shop) {
  const response = await graphql(
    `#graphql
      ${QR_CODE_FIELDS_FRAGMENT}
      query GetQRCodes($type: String!) {
        metaobjects(type: $type, first: 50, reverse: true) {
          nodes {
            ...QRCodeFields
          }
        }
      }
    `,
    {
      variables: {
        type: METAOBJECT_TYPE,
      },
    },
  );

  const { data } = await response.json();
  const nodes = data?.metaobjects?.nodes ?? [];

  return nodes.map((node) => formatQRCode(node, shop));
}

export function getQRCodeImage(id, shop) {
  const appUrl = process.env.SHOPIFY_APP_URL || "http://localhost:3000";
  const url = new URL(`/qrcodes/${id}/scan`, appUrl);
  url.searchParams.set("shop", shop);
  return qrcode.toDataURL(url.href);
}

export function getDestinationUrl(qrCode, shop) {
  if (qrCode.destination === "product") {
    return `https://${shop}/products/${qrCode.productHandle}`;
  }

  const match = /gid:\/\/shopify\/ProductVariant\/([0-9]+)/.exec(
    qrCode.productVariantId || "",
  );
  const variantId = qrCode.productVariantLegacyId || match?.[1] || "";

  return `https://${shop}/cart/${variantId}:1`;
}

export async function saveQRCode(handle, data, graphql) {
  const fields = [
    { key: "title", value: data.title },
    { key: "product", value: data.productId },
    { key: "product_variant", value: data.productVariantId },
    { key: "destination", value: data.destination },
  ];

  const response = await graphql(
    `#graphql
      mutation SaveQRCode(
        $handle: MetaobjectHandleInput!
        $metaobject: MetaobjectUpsertInput!
      ) {
        metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
          metaobject {
            id
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        handle: {
          type: METAOBJECT_TYPE,
          handle,
        },
        metaobject: {
          fields,
        },
      },
    },
  );

  const json = await response.json();
  return json.data?.metaobjectUpsert;
}

export async function deleteQRCode(id, graphql) {
  const response = await graphql(
    `#graphql
      mutation DeleteQRCode($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: { id },
    },
  );

  const json = await response.json();
  return json.data?.metaobjectDelete;
}

export async function incrementQRCodeScans(id, currentScans, graphql) {
  const nextScans = Number(currentScans || 0) + 1;

  const response = await graphql(
    `#graphql
      mutation IncrementQRCodeScans(
        $id: ID!
        $metaobject: MetaobjectUpdateInput!
      ) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject {
            id
            field(key: "scans") {
              jsonValue
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        id,
        metaobject: {
          fields: [{ key: "scans", value: String(nextScans) }],
        },
      },
    },
  );

  const json = await response.json();
  return json.data?.metaobjectUpdate;
}

export function validateQRCode(data) {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

export function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateHandle(title) {
  const slug = slugify(title) || "qr-code";
  return `${slug}-${Date.now().toString(36)}`;
}

