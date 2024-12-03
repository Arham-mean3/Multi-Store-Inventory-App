import React, { useCallback, useContext, useEffect } from "react";
import Row from "./Row";
import { InventoryContext } from "../context/Inventory-Context";

export default function RowMarkup({ paginatedOrders, selectedResources }) {
  const { changesArray, setChangesArray, selected } =
    useContext(InventoryContext);

  const handleAvailableChange = useCallback((id, newValue) => {
    setChangesArray((prevArray) => {
      // Create a copy of the array to avoid direct mutation
      const updatedArray = [...prevArray];

      // Check if the object with this id already exists
      const existingIndex = updatedArray.findIndex(
        (item) => item.inventoryItemId === id,
      );

      if (existingIndex !== -1) {
        // Update the existing object with the new available value
        updatedArray[existingIndex] = {
          ...updatedArray[existingIndex],
          quantity: newValue,
          locationId: selected, // Ensure locationId is up-to-date
        };
      } else {
        // Add a new object to the array with the new available value
        updatedArray.push({
          inventoryItemId: id,
          locationId: selected,
          quantity: newValue,
        });
      }

      return updatedArray;
    });
  }, [selected]);

  console.log("Changes Array", changesArray);

  return (
    <>
      {paginatedOrders.map(({ id, variant, sku, quantities }, index) => (
        <Row
          key={id}
          id={id}
          variant={variant}
          sku={sku}
          quantities={quantities}
          index={index}
          selectedResources={selectedResources}
          handleAvailableChange={handleAvailableChange}
        />
      ))}
    </>
  );
}
