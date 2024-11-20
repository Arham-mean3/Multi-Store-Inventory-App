import { Modal, LegacyStack, ChoiceList } from "@shopify/polaris";
import { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";

export default function ExportModal({ data, all, locations, currentLocation }) {
  const CURRENT_PAGE = "current_page";
  const ALL_VARIANTS = "all_variants";
  // const SELECTED_CUSTOMERS = "selected_customers";
  const CSV_EXCEL = "csv_excel";
  const CSV_PLAIN = "csv_plain";

  const {
    active,
    handleClose,
    handleSelectedExport,
    handleSelectedExportAs,
    selectedExport,
    selectedExportAs,
  } = useContext(InventoryContext);

  const locationsHeader = locations.map((location) => location.name).reverse();
  const locationId = locations.map((location) => location.id).reverse();

  const dataset = selectedExport.includes(CURRENT_PAGE) ? data : all;

  const exportToCSV = () => {
    // Transform data into CSV format
    const headers = [
      "Id",
      "Image",
      "Handle",
      "Title",
      "Option1 Name",
      "Option1 Value",
      "Option2 Name",
      "Option2 Value",
      "Option3 Name",
      "Option3 Value",
      "Available",
      "Committed",
      "Damaged",
      "Incoming",
      "On Hand",
      "Quality Control",
      "Reserved",
      "Safety Stock",
      "SKU",
      "Barcode",
      "HS Code",
      "COO",
      ...locationsHeader,
    ];

    const rows = dataset.map(
      ({ id, variant, COO, hsCode, sku, quantities }) => {
        // Generate location-specific entries
        const locationData = locationId.map(
          (locId) =>
            locId === currentLocation
              ? quantities?.available || 0 // Current location shows quantities
              : "not stocked", // Other locations show "not stocked"
        );
        return [
          id,
          variant.product.featuredMedia.preview.image.url,
          variant.product.handle,
          variant.product.title,
          "size",
          variant.title,
          "",
          "",
          "",
          "",
          quantities.available,
          quantities.committed,
          quantities.damaged,
          quantities.incoming,
          quantities.on_hand,
          quantities.quality_control,
          quantities.reserved,
          quantities.safety_stock,
          sku || "",
          variant.barCode || "",
          hsCode || "",
          COO || "",
          ...locationData,
        ];
      },
    );

    const csvContent = [headers, ...rows]
      .map(
        (row) =>
          selectedExportAs.includes(CSV_EXCEL)
            ? `"${row.join('","')}"` // Wrap each cell in double quotes for Excel compatibility
            : row.join(","), // Standard CSV format
      )
      .join("\n");

    // Create a downloadable CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory.csv"; // Set the filename
    link.click(); // Trigger download

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* <Frame> */}
      <Modal
        open={active}
        onClose={handleClose}
        title="Export Inventory"
        primaryAction={{
          content: "Export Inventory",
          onAction: exportToCSV,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleClose,
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <LegacyStack.Item>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: CURRENT_PAGE },
                  { label: "All variants", value: ALL_VARIANTS },
                  // { label: "Selected customers", value: SELECTED_CUSTOMERS },
                ]}
                selected={selectedExport}
                onChange={handleSelectedExport}
              />
            </LegacyStack.Item>
            <LegacyStack.Item>
              <ChoiceList
                title="Export as"
                choices={[
                  {
                    label:
                      "CSV for Excel, Numbers, or other spreadsheet programs",
                    value: CSV_EXCEL,
                  },
                  { label: "Plain CSV file", value: CSV_PLAIN },
                ]}
                selected={selectedExportAs}
                onChange={handleSelectedExportAs}
              />
            </LegacyStack.Item>
          </LegacyStack>
        </Modal.Section>
      </Modal>
      {/* </Frame> */}
    </div>
  );
}
