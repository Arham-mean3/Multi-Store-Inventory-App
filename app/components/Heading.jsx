import { Button, Listbox, Popover, Scrollable } from "@shopify/polaris";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InventoryContext } from "../context/Inventory-Context";
import CustomPopover from "./Popover";

function Heading({ location, selection }) {
  const { handleModalChange, toggleImport } = useContext(InventoryContext);
  const [selected, setSelected] = useState(location);
  const [locationId, setLocationId] = useState(selected[1].id);

  // Memoize the map for fast lookups
  const locationMap = useMemo(
    () => new Map(selected.map((loc) => [loc.id, loc.name])),
    [selected],
  );

  useEffect(() => {
    selection(locationId);
  }, [locationId, selection]);

  const options = [...location].reverse().map((loc) => ({
    label: loc.name,
    value: loc.id,
    id: loc.id,
  }));

  return (
    <div className="mb-8 md:mb-0">
      <div className="flex gap-4 justify-between items-center my-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-lg lg:text-2xl font-bold">
            Multi-Store-Inventory-App
          </h1>

          <div className="hidden md:block">
            <CustomPopover
              options={options}
              selection={selection}
              locationId={locationId}
              setLocationId={setLocationId}
              locationMap={locationMap}
            />
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

      <div className="block md:hidden">
        <CustomPopover
          options={options}
          selection={selection}
          locationId={locationId}
          setLocationId={setLocationId}
          locationMap={locationMap}
        />
      </div>
    </div>
  );
}

export default Heading;
