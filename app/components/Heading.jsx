import { Button, Select } from "@shopify/polaris";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import PropTypes from "prop-types";

function Heading({ location, selection }) {
  const { handleModalChange, toggleImport } = useContext(InventoryContext);
  const [selected, setSelected] = useState(location);

  useEffect(() => {
    selection(selected[1].id);
  }, []);

  const locationArray = [...location].reverse();

  const handleSelectChange = useCallback((value) => {
    setSelected(value);
    selection(value);
  }, []);

  const options = locationArray.map((loc) => ({
    label: loc.name,
    value: loc.id,
  }));

  return (
    <div className="mb-8 md:mb-0">
      <div className="flex gap-4 justify-between items-center my-4">
        <div className="flex gap-4">
          <h1 className="text-lg lg:text-2xl font-bold">
            Multi-Store-Inventory-App
          </h1>
          <div className="hidden md:block">
            <Select
              options={options}
              onChange={handleSelectChange}
              value={selected}
              tone="magic"
              requiredIndicator={false}
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
        <Select
          options={options}
          onChange={handleSelectChange}
          value={selected}
          tone="magic"
          requiredIndicator={false}
        />
      </div>
    </div>
  );
}

Heading.propTypes = {
  location: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default Heading;
