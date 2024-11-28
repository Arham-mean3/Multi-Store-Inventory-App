import { Container, Row, Text } from "@react-email/components";

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
            Successfully imported: {length}
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
            Updated on Locations: {size}
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
              importing inventory
            </span>
            .
          </Text>
        </Row>
        {/* ERROR ROW */}
        {errors && errors.length > 0 && (
          <Row className="bg-gray-100 py-3">
            <Text className="px-6 font-bold">
              Errors during import:
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>
                    {error.type}: {error.message}
                  </li>
                ))}
              </ul>
            </Text>
          </Row>
        )}
      </div>
    </Container>
  );
}
