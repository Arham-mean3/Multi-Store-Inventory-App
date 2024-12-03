import React, { useCallback, useContext } from "react";
import Row from "./Row";
import { InventoryContext } from "../context/Inventory-Context";

export default function RowMarkup({ paginatedOrders, selectedResources }) {
  const { changesArray, setChangesArray } = useContext(InventoryContext);

  
  const handleAvailableChange = useCallback((id, newValue) => {
    //   setAvailable(newValue);

    setChangesArray((prevArray) => {
      // Create a copy of the array to avoid direct mutation
      const updatedArray = [...prevArray];

      // Check if the object with this id already exists
      const existingIndex = updatedArray.findIndex((item) => item.id === id);

      if (existingIndex !== -1) {
        // Update the existing object with the new available value
        updatedArray[existingIndex] = {
          ...updatedArray[existingIndex],
          quantity: newValue,
        };
      } else {
        // Add a new object to the array with the new available value
        updatedArray.push({
          quantity: newValue,
          id,
        });
      }

      return updatedArray;
    });
  }, []);

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
