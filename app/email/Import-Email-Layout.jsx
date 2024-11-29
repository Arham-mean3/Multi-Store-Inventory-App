import { Container, Img, Row, Text } from "@react-email/components";

export default function ImportEmailLayout({ length, size, errors }) {
  return (
    <Container style={{ marginTop: 20, padding: 0 }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1.25px solid #556E53",
          borderRadius: 8,
        }}
      >
        {/* Header Row */}
        <Row>
          <Text
            style={{
              fontSize: 14,
              lineHeight: "24px",
              margin: 0,
              padding: 12,
              display: "flex",
              alignItems: "center",
            }}
          >
            Your inventory was imported from a CSV file
          </Text>
        </Row>
        {/* Divider */}
        <hr
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#5a5b5c",
            marginTop: 2,
            marginBottom: 2,
            marginRight: 10,
            marginLeft: 10,
          }}
        />
        {/* Success Row */}
        <Row>
          <Text
            style={{
              fontSize: 14,
              lineHeight: "24px",
              fontWeight: "bold",
              margin: 0,
              padding: 12,
              display: "flex",
              alignItems: "center",
            }}
          >
            Successfully imported:{" "}
            <span
              style={{ color: "#5a5b5c", fontWeight: "normal", marginLeft: 5 }}
            >
              {length}
            </span>
          </Text>
        </Row>

        {errors && errors.length > 0 ? null : (
          <Row>
            <Text
              style={{
                fontSize: 14,
                lineHeight: "24px",
                fontWeight: "bold",
                margin: 0,
                paddingRight: 12,
                paddingLeft: 12,
                paddingTop: 8,
                paddingBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              Updated on Locations:{" "}
              <span
                style={{
                  color: "#5a5b5c",
                  fontWeight: "normal",
                  marginLeft: 5,
                }}
              >
                {size}
              </span>
            </Text>
          </Row>
        )}

        {/* ERROR ROW */}
        {errors && errors.length > 0 && (
          <Row>
            <Text
              style={{
                fontSize: 14,
                lineHeight: "24px",
                fontWeight: "bold",
                margin: 0,
                paddingRight: 12,
                paddingLeft: 12,
                paddingTop: 8,
                paddingBottom: 8,
                display: "flex",
                flexDirection: "column",
              }}
            >
              Errors during import:
              <div>
                {errors.map((error, index) => (
                  <p
                    style={{
                      color: "#007bff",
                      fontWeight: "normal",
                      marginLeft: 5,
                    }}
                    key={index}
                  >
                    {index + 1}: {error.message}
                  </p>
                ))}
              </div>
            </Text>
          </Row>
        )}

        {/* Divider */}
        <hr
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#000000",
            marginRight: 2,
            marginLeft: 2,
            marginTop: 0,
            marginBottom: 0,
          }}
        />

        {/* Footer Row */}
        <Row
          style={{
            borderRadius: "0 0 8px 8px",
            backgroundColor: "#f9fafb",
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: "24px",
              margin: 0,
              padding: 12,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>
              <Img
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 12,
                  marginRight: 5,
                }}
                src={
                  "https://cdn.shopify.com/shopifycloud/shopify/assets/mailer/merchant/help_center-aa5be7c1c968a8e31fcc2b83d716478d5b9f04a8c0c8f76da450d382dcb41545.png"
                }
              />
            </span>
            Learn more about
            <a
              href="https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/inventory-csv"
              style={{
                color: "#007bff",
                textDecoration: "none",
                cursor: "pointer",
                marginLeft: 5,
              }}
            >
              importing inventory
            </a>
            .
          </Text>
        </Row>
      </div>
    </Container>
  );
}
