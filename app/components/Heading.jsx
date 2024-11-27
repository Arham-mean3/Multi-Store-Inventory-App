import { Button, Listbox, Popover, Scrollable } from "@shopify/polaris";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InventoryContext } from "../context/Inventory-Context";

function Heading({ location, selection }) {
  const { handleModalChange, toggleImport } = useContext(InventoryContext);
  const [popoverActive, setPopoverActive] = useState(false);
  const [selected, setSelected] = useState(location);
  const [locationId, setLocationId] = useState(selected[1].id);
  const [locationName, setLocationName] = useState("");

  // Memoize the map for fast lookups
  const locationMap = useMemo(
    () => new Map(selected.map((loc) => [loc.id, loc.name])),
    [selected],
  );

  useEffect(() => {
    selection(locationId);
  }, [locationId, selection]);

  useEffect(() => {
    const name = locationMap.get(locationId) || "Unknown Location";
    setLocationName(name);
  }, [locationId, locationMap]);

  const handleSelectChange = useCallback(
    (value) => {
      setLocationId(value);
      selection(value);
    },
    [selection],
  );

  const options = [...location].reverse().map((loc) => ({
    label: loc.name,
    value: loc.id,
    id: loc.id,
  }));
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  useEffect(() => {
    const findLocation = selected.find((select) => select.id === locationId);
    setLocationName(findLocation.name);
  }, [locationId]);

  const activator = (
    <div
      style={{
        fontSize: "var(--p-font-size-500)",
        color: "var(--p-color-text)",
        borderBottom: "1px dashed var(--p-color-border)",
      }}
    >
      <button
        className="text-4xl md:text-xl font-bold"
        onClick={togglePopoverActive}
      >
        {locationName}
      </button>
    </div>
  );

  const listboxMarkup = (
    <Listbox
      accessibilityLabel="Basic Listbox example"
      onSelect={handleSelectChange}
    >
      {options.map((data, index) => {
        return (
          <div key={index} className="mb-2">
            <Listbox.Option value={data.value}>{data.label}</Listbox.Option>
          </div>
        );
      })}
    </Listbox>
  );

  return (
    <div className="mb-8 md:mb-0">
      <div className="flex gap-4 justify-between items-center my-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-lg lg:text-2xl font-bold">
            Multi-Store-Inventory-App
          </h1>

          <div className="hidden md:block">
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
          </div>
        </div>
        <div className="flex gap-4 md:items-center">
          <Button variant="secondary" onClick={handleModalChange}>
            Export
          </Button>
          <Button variant="primary" onClick={toggleImport}>
            Import
          </Button>
        </div>
      </div>

      {/* <div className="block md:hidden">
        <Select
          options={options}
          onChange={handleSelectChange}
          value={selected}
          tone="magic"
          requiredIndicator={false}
        />
      </div> */}
    </div>
  );
}

export default Heading;
