import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  LegacyStack,
  ChoiceList,
  Popover,
  Button,
  Listbox,
  Spinner,
} from "@shopify/polaris";
import { InventoryContext } from "../context/Inventory-Context";
import {
  currentPageSpecificItemsExport,
  exportDataForMultipleLocationQuantites,
  newInventoryStructureData,
} from "../lib/extras";

const ExportModal = ({ currentPageData, locations, value }) => {
  // const CURRENT_PAGE = "current_page";
  const ALL_VARIANTS = "all_variants";
  // const SELECTED_ITEMS = "selected_variants";
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

  const [locationForExport, setLocationForExport] = useState("All-Locations");

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
    selectingForExport,
    setSelectingForExport,
    setSelected,
    selectedItems,
    exportLoading,
  } = useContext(InventoryContext);

  const handleActiveOptionChange = (_) => {
    const foundLocation = deselectionLocationData.find(
      (location) => location.value === _,
    );

    // console.log("Selected Location in export ", foundLocation, _);

    if (foundLocation) {
      setLocationName(foundLocation.label);
      setLocationForExport(_);
      setPopoverActive(false);
      setSelectingForExport(_);
    } else {
      setLocationName("All-Locations");
      setLocationForExport("All-Locations");
      setPopoverActive(false);
      setSelectingForExport("");
    }
  };

  let dataset = [];
  let rows;

  // console.log("Current Page Data", value);
  // if (selectedExport.includes(CURRENT_PAGE)) {
  //   const customData = newInventoryStructureData(value);
  //   dataset = currentPageSpecificItemsExport(currentPageData, customData);

  //   console.log("Custom Data", customData);
  //   console.log("Data set", dataset);
  //   // if (locationForExport === "All-Locations") {
  //   rows = dataset.flatMap(
  //     ({ variant, COO, hsCode, sku, inventoryLevels, options }) => {
  //       const locationsToMap =
  //         locationForExport === "All-Locations"
  //           ? locations
  //           : locations.filter(({ id }) => id === locationForExport);

  //       return locationsToMap.map(({ id: locId, name: locationName }) => {
  //         const locationInventory = inventoryLevels.find(
  //           (loc) => loc.id === locId,
  //         );
  //         // Prepare quantities based on location availability
  //         const locationQuantities = locationInventory
  //           ? {
  //               committed: locationInventory.quantities.committed || 0,
  //               damaged: locationInventory.quantities.damaged || 0,
  //               available: locationInventory.quantities.available || 0,
  //               on_hand: locationInventory.quantities.on_hand || 0,
  //             }
  //           : {
  //               committed: "not stocked",
  //               damaged: "not stocked",
  //               available: "not stocked",
  //               on_hand: "not stocked",
  //             };

  //         return [
  //           variant.product.handle,
  //           variant.product.title,
  //           options[0]?.name || "",
  //           options[0]?.values || "",
  //           options[1]?.name || "",
  //           options[1]?.values || "",
  //           options[2]?.name || "",
  //           options[2]?.values || "",
  //           sku || "",
  //           variant.barcode || "",
  //           hsCode || "",
  //           COO || "",
  //           locationName, // Render the location name
  //           // locationQuantities.committed,
  //           // locationQuantities.damaged,
  //           locationQuantities.available,
  //           locationQuantities.on_hand,
  //         ];
  //       });
  //     },
  //   );
  // }
  if (selectedExport.includes(ALL_VARIANTS)) {
    dataset = exportDataForMultipleLocationQuantites(value);
    rows = dataset.flatMap(
      ({ variant, COO, hsCode, sku, inventoryLevels, options }) => {
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
            options[0]?.name || "",
            options[0]?.values || "",
            options[1]?.name || "",
            options[1]?.values || "",
            options[2]?.name || "",
            options[2]?.values || "",
            sku || "",
            variant.barcode || "",
            hsCode || "",
            COO || "",
            locationName, // Render the location name
            // locationQuantities.committed,
            // locationQuantities.damaged,
            locationQuantities.available,
            locationQuantities.on_hand,
          ];
        });
      },
    );
  }
  // if (selectedExport.includes(SELECTED_ITEMS)) {
  //   dataset = exportDataForMultipleLocationQuantites(value);

  //   // Filter the dataset based on selectedItems
  //   const filteredDataset = dataset.filter((data) =>
  //     selectedItems.includes(data.id),
  //   );

  //   rows = filteredDataset.flatMap(
  //     ({ variant, COO, hsCode, sku, inventoryLevels, options }) => {
  //       const locationsToMap =
  //         locationForExport === "All-Locations"
  //           ? locations
  //           : locations.filter(({ id }) => id === locationForExport);

  //       return locationsToMap.map(({ id: locId, name: locationName }) => {
  //         const locationInventory = inventoryLevels.find(
  //           (loc) => loc.id === locId,
  //         );
  //         // Prepare quantities based on location availability
  //         const locationQuantities = locationInventory
  //           ? {
  //               committed: locationInventory.quantities.committed || 0,
  //               damaged: locationInventory.quantities.damaged || 0,
  //               available: locationInventory.quantities.available || 0,
  //               on_hand: locationInventory.quantities.on_hand || 0,
  //             }
  //           : {
  //               committed: "not stocked",
  //               damaged: "not stocked",
  //               available: "not stocked",
  //               on_hand: "not stocked",
  //             };

  //         return [
  //           variant.product.handle,
  //           variant.product.title,
  //           options[0]?.name || "",
  //           options[0]?.values || "",
  //           options[1]?.name || "",
  //           options[1]?.values || "",
  //           options[2]?.name || "",
  //           options[2]?.values || "",
  //           sku || "",
  //           variant.barcode || "",
  //           hsCode || "",
  //           COO || "",
  //           locationName, // Render the location name
  //           locationQuantities.available,
  //           locationQuantities.on_hand,
  //         ];
  //       });
  //     },
  //   );
  // }

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

  // console.log("Export Modal Component Re-Renders");

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
        {/* {exportLoading ? (
          <div className="w-full h-40 flex justify-center items-center">
            <div className="flex flex-col gap-4 items-center justify-center">
              <Spinner size="large" />
              <p>Loading data...</p>
            </div>
          </div>
        ) : ( */}
        <div className="h-60 lg:h-full">
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                <div className="mb-4 bg-yellow-300 p-4 rounded-lg">
                  <h2 className="text-sm font-medium">
                    <span className="font-bold">Important Note: </span>Only 250
                    items can be exported right now.
                  </h2>
                </div>
                <div className="flex gap-3 items-center">
                  <h2 className="text-sm font-medium">
                    Export Inventory From:{" "}
                  </h2>
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
                    // { label: "Current page", value: CURRENT_PAGE },
                    { label: "All variants", value: ALL_VARIANTS },
                    // {
                    //   label: `${selectedItems.length} Selected Items`,
                    //   value: SELECTED_ITEMS,
                    //   disabled: selectedItems.length === 0,
                    // },
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
        </div>
        {/* )} */}
      </Modal>
    </div>
  );
};

export default ExportModal;
