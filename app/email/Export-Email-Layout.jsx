import { Container, Row, Text } from "@react-email/components";

export default function ExportEmailLayout({ length }) {
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
            Your inventory was exported from a CSV file
          </Text>
        </Row>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#000000",
            margin: 2,
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
            Successfully exported: {length}
          </Text>
        </Row>
    

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
            backgroundColor: "#dddddb",
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
            Learn more about
            <span
              style={{
                color: "#007bff",
                textDecoration: "none",
                cursor: "pointer",
                marginLeft: 5,
              }}
            >
              exporting inventory
            </span>
            .
          </Text>
        </Row>
      </div>
    </Container>
  );
}
