import React, { useCallback, useContext, useState } from "react";
import { Icon, Listbox, Popover, Scrollable } from "@shopify/polaris";
import { CaretDownIcon } from "@shopify/polaris-icons";
import { InventoryContext } from "../context/Inventory-Context";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function CustomPopover({
  options,
  locationId,
  setLocationId,
  selection,
  locationMap,
}) {
  const [popoverActive, setPopoverActive] = useState(false);
  const shopify = useAppBridge();

  const { changesArray } = useContext(InventoryContext);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleSelectChange = useCallback(
    (value) => {
      if (changesArray.length > 0) {
        shopify.toast.show("You have unsaved changes.");
        return;
      }
      setLocationId(value);
      selection(value);
      togglePopoverActive(); // Close the Popover
    },
    [selection, togglePopoverActive, changesArray],
  );

  const locationName = locationMap.get(locationId) || "Unknown Location";

  const listboxMarkup = (
    <Listbox
      accessibilityLabel="Basic Listbox example"
      onSelect={handleSelectChange}
    >
      {options.map((data, index) => {
        return (
          <div key={index} className="mb-2">
            <Listbox.Option
              value={data.value}
              selected={data.value === locationId}
            >
              {data.label}
            </Listbox.Option>
          </div>
        );
      })}
    </Listbox>
  );

  const activator = (
    <div
      style={{
        fontSize: "var(--p-font-size-500)",
        color: "var(--p-color-text)",
        borderBottom: "1px dashed var(--p-color-border)",
      }}
    >
      <button
        className="text-lg lg:text-xl font-bold flex items-center justify-center gap-2"
        onClick={togglePopoverActive}
      >
        <span className="text-blue-700">{locationName}</span>
        <span className="text-blue-500">
          <Icon source={CaretDownIcon} tone="base" />
        </span>
      </button>
    </div>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      ariaHaspopup="listbox"
      preferredAlignment="left"
      autofocusTarget="first-node"
      onClose={togglePopoverActive}
    >
      <Popover.Pane height="100px">
        <Popover.Pane fixed>
          <div
            style={{
              alignItems: "stretch",
              borderTop: "1px solid #DFE3E8",
              display: "flex",
              flexDirection: "column",
              justifyContent: "stretch",
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Scrollable
              shadow
              style={{
                position: "relative",
                width: "310px",
                height: "100px",
                padding: "var(--p-space-200) 0",
                borderBottomLeftRadius: "var(--p-border-radius-200)",
                borderBottomRightRadius: "var(--p-border-radius-200)",
              }}
            >
              {listboxMarkup}
            </Scrollable>
          </div>
        </Popover.Pane>
      </Popover.Pane>
    </Popover>
  );
}
