import {
  Modal,
  LegacyStack,
  ChoiceList,
  Popover,
  Button,
  Listbox,
} from "@shopify/polaris";
import { useContext, useMemo, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import {
  currentPageSpecificItemsExport,
  exportDataForMultipleLocationQuantites,
  newInventoryStructureData,
} from "../lib/extras";

export default function ExportModal({ currentPageData, locations, value }) {
  const CURRENT_PAGE = "current_page";
  const ALL_VARIANTS = "all_variants";
  const CSV_EXCEL = "csv_excel";
  const CSV_PLAIN = "csv_plain";

  const deselectionLocationData = useMemo(
    () =>
      locations.map((loc) => ({
        label: loc.name,
        value: loc.id,
      })),
    [locations],
  );

  const [locationForExport, setLocationForExport] = useState(
    deselectionLocationData[0].value,
  );

  const [locationName, setLocationName] = useState("All-Locations");

  const {
    active,
    popoverActive,
    setPopoverActive,
    handleClose,
    handleSelectedExport,
    handleSelectedExportAs,
    selectedExport,
    selectedExportAs,
    togglePopoverActive,
  } = useContext(InventoryContext);

  const handleActiveOptionChange = (_) => {
    const foundLocation = deselectionLocationData.find(
      (location) => location.value === _,
    );
    if (foundLocation) {
      setLocationName(foundLocation.label);
      setLocationForExport(_);
      setPopoverActive(false);
    } else {
      setLocationName("All-Locations");
      setLocationForExport("All-Locations");
      setPopoverActive(false);
    }
  };

  let dataset = [];
  let rows;

  if (selectedExport.includes(CURRENT_PAGE)) {
    const customData = newInventoryStructureData(value);
    dataset = currentPageSpecificItemsExport(currentPageData, customData);

    // if (locationForExport === "All-Locations") {
    rows = dataset.flatMap(({ variant, COO, hsCode, sku, inventoryLevels }) => {
      const locationsToMap =
        locationForExport === "All-Locations"
          ? locations
          : locations.filter(({ id }) => id === locationForExport);

      return locationsToMap.map(({ id: locId, name: locationName }) => {
        const locationInventory = inventoryLevels.find(
          (loc) => loc.id === locId,
        );
        // Prepare quantities based on location availability
        const locationQuantities = locationInventory
          ? {
              committed: locationInventory.quantities.committed || 0,
              damaged: locationInventory.quantities.damaged || 0,
              available: locationInventory.quantities.available || 0,
              on_hand: locationInventory.quantities.on_hand || 0,
            }
          : {
              committed: "not stocked",
              damaged: "not stocked",
              available: "not stocked",
              on_hand: "not stocked",
            };

        return [
          variant.product.handle,
          variant.product.title,
          "size",
          variant.title,
          "",
          "",
          "",
          "",
          sku || "",
          variant.barcode || "",
          hsCode || "",
          COO || "",
          locationName, // Render the location name
          locationQuantities.committed,
          locationQuantities.damaged,
          locationQuantities.available,
          locationQuantities.on_hand,
        ];
      });
    });
    // } else {
    //   rows = dataset.flatMap(
    //     ({ variant, COO, hsCode, sku, inventoryLevels }) => {
    //       const foundLocation = inventoryLevels.find(
    //         (loc) => loc.id === locationForExport,
    //       );

    //       console.log("Found Location for ", locationName, foundLocation);
    //       // Prepare quantities based on location availability
    //       const locationQuantities = foundLocation
    //         ? {
    //             committed: foundLocation.quantities.committed || 0,
    //             damaged: foundLocation.quantities.damaged || 0,
    //             available: foundLocation.quantities.available || 0,
    //             on_hand: foundLocation.quantities.on_hand || 0,
    //           }
    //         : {
    //             committed: "not stocked",
    //             damaged: "not stocked",
    //             available: "not stocked",
    //             on_hand: "not stocked",
    //           };

    //       return [
    //         variant.product.handle,
    //         variant.product.title,
    //         "size",
    //         variant.title,
    //         "",
    //         "",
    //         "",
    //         "",
    //         sku || "",
    //         variant.barcode || "",
    //         hsCode || "",
    //         COO || "",
    //         locationName, // Render the location name
    //         locationQuantities.committed,
    //         locationQuantities.damaged,
    //         locationQuantities.available,
    //         locationQuantities.on_hand,
    //       ];
    //     },
    //   );
    // }
  }
  if (selectedExport.includes(ALL_VARIANTS)) {
    dataset = exportDataForMultipleLocationQuantites(value);

    rows = dataset.flatMap(({ variant, COO, hsCode, sku, inventoryLevels }) => {
      const locationsToMap =
        locationForExport === "All-Locations"
          ? locations
          : locations.filter(({ id }) => id === locationForExport);

      return locationsToMap.map(({ id: locId, name: locationName }) => {
        const locationInventory = inventoryLevels.find(
          (loc) => loc.id === locId,
        );
        // Prepare quantities based on location availability
        const locationQuantities = locationInventory
          ? {
              committed: locationInventory.quantities.committed || 0,
              damaged: locationInventory.quantities.damaged || 0,
              available: locationInventory.quantities.available || 0,
              on_hand: locationInventory.quantities.on_hand || 0,
            }
          : {
              committed: "not stocked",
              damaged: "not stocked",
              available: "not stocked",
              on_hand: "not stocked",
            };

        return [
          variant.product.handle,
          variant.product.title,
          "size",
          variant.title,
          "",
          "",
          "",
          "",
          sku || "",
          variant.barcode || "",
          hsCode || "",
          COO || "",
          locationName, // Render the location name
          locationQuantities.committed,
          locationQuantities.damaged,
          locationQuantities.available,
          locationQuantities.on_hand,
        ];
      });
    });
  }

  const exportToCSV = () => {
    // Transform data into CSV format
    const headers = [
      "Handle",
      "Title",
      "Option1 Name",
      "Option1 Value",
      "Option2 Name",
      "Option2 Value",
      "Option3 Name",
      "Option3 Value",
      "SKU",
      "Barcode",
      "HS Code",
      "COO",
      "Location",
      "Committed",
      "Damaged",
      "Available",
      "On Hand",
    ];

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
    link.download = "inventory-export.csv"; // Set the filename
    link.click(); // Trigger download

    // Clean up the URL object
    URL.revokeObjectURL(url);

    handleClose();
    setLocationName("All-Locations");
    setLocationForExport("All-Locations");
  };

  const activator = (
    <Button onClick={togglePopoverActive}>{locationName}</Button>
  );

  return (
    <div>
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
              <div className="flex gap-4 items-center">
                <h2>Export Inventory From: </h2>
                <Popover
                  active={popoverActive}
                  activator={activator}
                  autofocusTarget="first-node"
                  onClose={togglePopoverActive}
                >
                  <Popover.Pane>
                    <Listbox
                      accessibilityLabel="Basic Listbox example"
                      onSelect={handleActiveOptionChange}
                    >
                      <Listbox.Option value={"All-Locations"}>
                        All Locations
                      </Listbox.Option>
                      {deselectionLocationData.map((data, index) => {
                        return (
                          <div key={index}>
                            <Listbox.Option
                              value={data.value}
                              // selected={selected}
                            >
                              {data.label}
                            </Listbox.Option>
                          </div>
                        );
                      })}
                    </Listbox>
                  </Popover.Pane>
                </Popover>
                {/* <InventoryPopover /> */}
              </div>
            </LegacyStack.Item>
            <LegacyStack.Item>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: CURRENT_PAGE },
                  { label: "All variants", value: ALL_VARIANTS },
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
    </div>
  );
}
