import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getQRCodes } from "../models/QRCode.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const qrCodes = await getQRCodes(admin.graphql, session.shop);

  return {
    qrCodes,
  };
};

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

const EmptyQRCodeState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="Create unique QR codes for your products"
        />
      </s-box>
      <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
        <s-stack alignItems="center" gap="small-200">
          <s-heading>Create unique QR codes for your products</s-heading>
          <s-paragraph>
            Allow customers to scan codes and buy products using their phones.
          </s-paragraph>
        </s-stack>
        <s-button variant="primary" href="/app/qrcodes/new">
          Create QR code
        </s-button>
      </s-grid>
    </s-grid>
  </s-section>
);

function renderQRTable(qrCodes) {
  return (
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Title</s-table-header>
        <s-table-header>Product</s-table-header>
        <s-table-header>Date created</s-table-header>
        <s-table-header format="numeric">Scans</s-table-header>
      </s-table-header-row>
      <s-table-body>
        {qrCodes.map((qrCode) => (
          <s-table-row
            key={qrCode.handle}
            id={qrCode.handle}
            clickDelegate={qrCode.handle}
          >
            <s-table-cell>
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-clickable
                  href={`/app/qrcodes/${qrCode.handle}`}
                  accessibilityLabel={`Edit ${qrCode.title}`}
                  border="base"
                  borderRadius="base"
                  overflow="hidden"
                  inlineSize="40px"
                  blockSize="40px"
                >
                  {qrCode.productImage ? (
                    <s-image
                      src={qrCode.productImage}
                      alt={qrCode.productAlt || qrCode.productTitle}
                      objectFit="cover"
                    />
                  ) : (
                    <s-stack
                      alignItems="center"
                      justifyContent="center"
                      blockSize="40px"
                      inlineSize="40px"
                    >
                      <s-icon type="image" />
                    </s-stack>
                  )}
                </s-clickable>
                <s-link
                  id={qrCode.handle}
                  href={`/app/qrcodes/${qrCode.handle}`}
                >
                  {truncate(qrCode.title)}
                </s-link>
              </s-stack>
            </s-table-cell>
            <s-table-cell>
              {qrCode.productDeleted ? (
                <s-badge tone="critical" icon="alert-triangle">
                  Product has been deleted
                </s-badge>
              ) : (
                truncate(qrCode.productTitle)
              )}
            </s-table-cell>
            <s-table-cell>
              {qrCode.createdAt
                ? new Date(qrCode.createdAt).toDateString()
                : ""}
            </s-table-cell>
            <s-table-cell>{qrCode.scans}</s-table-cell>
          </s-table-row>
        ))}
      </s-table-body>
    </s-table>
  );
}

export default function Index() {
  const { qrCodes } = useLoaderData();

  return (
    <s-page heading="QR codes">
      <s-button slot="primary-action" variant="primary" href="/app/qrcodes/new">
        Create QR code
      </s-button>
      {qrCodes.length === 0 ? (
        <EmptyQRCodeState />
      ) : (
        <s-section padding="none" accessibilityLabel="QR codes table">
          {renderQRTable(qrCodes)}
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
