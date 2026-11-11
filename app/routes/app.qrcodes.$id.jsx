import { useEffect, useState } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  deleteQRCode,
  generateHandle,
  getQRCode,
  saveQRCode,
  validateQRCode,
} from "../models/QRCode.server";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);

  if (params.id === "new") {
    return {
      destination: "product",
      title: "",
      shop: session.shop,
    };
  }

  const qrCode = await getQRCode(params.id, admin.graphql, session.shop);
  if (!qrCode) {
    throw new Response("QR code not found", { status: 404 });
  }

  return {
    ...qrCode,
    shop: session.shop,
  };
};

export const action = async ({ request, params }) => {
  const { admin, redirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  if (data.action === "delete") {
    await deleteQRCode(data.id, admin.graphql);
    return redirect("/app");
  }

  const errors = validateQRCode(data);
  if (errors) {
    return { errors };
  }

  const handle =
    params.id === "new" ? generateHandle(data.title) : params.id;

  const result = await saveQRCode(handle, data, admin.graphql);
  if (result?.userErrors?.length) {
    return {
      errors: {
        title: result.userErrors[0].message,
      },
    };
  }

  return redirect(`/app/qrcodes/${handle}`);
};

export default function QRCodeForm() {
  const qrCode = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors || {};

  const [initialFormState, setInitialFormState] = useState(qrCode);
  const [formState, setFormState] = useState(qrCode);

  useEffect(() => {
    setInitialFormState(qrCode);
    setFormState(qrCode);
  }, [qrCode]);

  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);

  const navigation = useNavigation();
  const isSaving =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") !== "delete";
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") === "delete";

  const shopify = useAppBridge();
  const submit = useSubmit();

  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show("qr-code-save-bar");
    } else {
      shopify.saveBar.hide("qr-code-save-bar");
    }

    return () => {
      shopify.saveBar.hide("qr-code-save-bar");
    };
  }, [isDirty, shopify]);

  async function selectProduct() {
    const products = await shopify.resourcePicker({
      type: "product",
      action: "select",
    });

    if (products?.length) {
      const { images, id, variants, title, handle } = products[0];

      setFormState((prev) => ({
        ...prev,
        productId: id,
        productVariantId: variants[0]?.id || "",
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText || title,
        productImage: images[0]?.originalSrc || "",
        productDeleted: false,
      }));
    }
  }

  function handleSave() {
    const data = {
      title: formState.title || "",
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      destination: formState.destination || "product",
    };

    submit(data, { method: "post" });
  }

  function handleDiscard() {
    setFormState(initialFormState);
  }

  function handleDelete() {
    submit({ action: "delete", id: qrCode.id }, { method: "post" });
  }

  const isEditing = Boolean(qrCode.id);

  return (
    <s-page heading={isEditing ? "Edit QR code" : "Create QR code"}>
      <s-link slot="breadcrumb-actions" href="/app">
        QR codes
      </s-link>
      {isEditing && (
        <s-button
          slot="secondary-actions"
          tone="critical"
          onClick={handleDelete}
          disabled={isDeleting || undefined}
          loading={isDeleting || undefined}
        >
          Delete
        </s-button>
      )}

      <ui-save-bar id="qr-code-save-bar">
        <button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || undefined}
        ></button>
        <button
          onClick={handleDiscard}
          disabled={isSaving || undefined}
        ></button>
      </ui-save-bar>

      <s-stack direction="block" gap="base">
        <s-section heading="Title">
          <s-text-field
            id="title"
            label="Title"
            labelAccessibilityVisibility="exclusive"
            details="Only store staff can see this title"
            value={formState.title || ""}
            error={errors.title}
            autocomplete="off"
            onInput={(e) => {
              const title = e.currentTarget.value;
              setFormState((prev) => ({
                ...prev,
                title,
              }));
            }}
          />
        </s-section>

        <s-section heading="Product">
          <s-stack direction="block" gap="base">
            <s-stack
              direction="inline"
              justifyContent="space-between"
              alignItems="center"
            >
              <s-text type="strong">Select a product</s-text>
              {formState.productId && (
                <s-button variant="tertiary" onClick={selectProduct}>
                  Change product
                </s-button>
              )}
            </s-stack>

            {formState.productDeleted && (
              <s-banner tone="critical">
                The linked product has been deleted. Select a new product to
                keep this QR code working.
              </s-banner>
            )}

            {formState.productId ? (
              <s-stack direction="inline" gap="base" alignItems="center">
                <s-clickable
                  onClick={selectProduct}
                  accessibilityLabel="Change product"
                  border="base"
                  borderRadius="base"
                  overflow="hidden"
                  inlineSize="56px"
                  blockSize="56px"
                >
                  {formState.productImage ? (
                    <s-image
                      src={formState.productImage}
                      alt={formState.productAlt || formState.productTitle || ""}
                      objectFit="cover"
                    />
                  ) : (
                    <s-box
                      padding="base"
                      display="auto"
                      inlineSize="56px"
                      blockSize="56px"
                    >
                      <s-icon type="image" />
                    </s-box>
                  )}
                </s-clickable>
                <s-text>{formState.productTitle}</s-text>
              </s-stack>
            ) : (
              <div>
                <s-button onClick={selectProduct}>Select product</s-button>
              </div>
            )}

            {errors.productId && (
              <s-text tone="critical">{errors.productId}</s-text>
            )}
          </s-stack>
        </s-section>

        <s-section heading="Scan destination">
          <s-stack direction="block" gap="base">
            <s-select
              id="destination"
              label="Scan destination"
              labelAccessibilityVisibility="exclusive"
              value={formState.destination || "product"}
              error={errors.destination}
              onChange={(e) => {
                const destination = e.currentTarget.value;
                setFormState((prev) => ({
                  ...prev,
                  destination,
                }));
              }}
            >
              <s-option value="product">Link to product page</s-option>
              <s-option value="cart">
                Link to checkout page with product in the cart
              </s-option>
            </s-select>

            {isEditing && qrCode.destinationUrl && !formState.productDeleted && (
              <s-link href={qrCode.destinationUrl} target="_blank">
                Go to destination URL
              </s-link>
            )}
          </s-stack>
        </s-section>
      </s-stack>

      <s-box slot="aside">
        <s-section heading="QR code">
          <s-stack direction="block" gap="base">
            {qrCode.image ? (
              <>
                <s-box
                  border="base"
                  borderRadius="base"
                  padding="base"
                  background="subdued"
                >
                  <s-image src={qrCode.image} alt="QR Code preview" />
                </s-box>
                <s-button
                  href={`/qrcodes/${qrCode.handle}?shop=${qrCode.shop}`}
                  target="_blank"
                  inlineSize="fill"
                >
                  Go to public URL
                </s-button>
                <s-button
                  variant="primary"
                  href={qrCode.image}
                  download={`qr-code-${qrCode.handle}.png`}
                  inlineSize="fill"
                >
                  Download
                </s-button>
              </>
            ) : (
              <s-box
                padding="base"
                background="subdued"
                borderRadius="base"
                border="base"
              >
                <s-text color="subdued">
                  Save the QR code to generate a scannable preview.
                </s-text>
              </s-box>
            )}
          </s-stack>
        </s-section>
      </s-box>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

