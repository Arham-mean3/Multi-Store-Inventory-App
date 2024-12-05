import { IndexTable, Text, Thumbnail } from "@shopify/polaris";
import React, { useContext, useEffect, useState } from "react";
import { Cell, RightCell } from "./Cell";
import { ImageIcon } from "@shopify/polaris-icons";
import { InventoryContext } from "../context/Inventory-Context";

export default function Row({
  selectedResources,
  id,
  index,
  sku,
  variant,
  quantities,
  handleAvailableChange,
}) {
  const [available, setAvailable] = useState(quantities?.available || 0);
  const [unAvailable, setUnAvailable] = useState(quantities?.damaged || 0);
  const [onHand, setOnHand] = useState(quantities?.on_hand || 0);
  const [committed, setCommitted] = useState(quantities?.committed || 0);

  const { resetChanges } = useContext(InventoryContext);

  useEffect(() => {
    setAvailable(quantities?.available);
    setCommitted(quantities?.committed);
    setOnHand(quantities?.on_hand);
    setUnAvailable(quantities?.damaged);
  }, [
    resetChanges,
    quantities?.available,
    quantities?.committed,
    quantities?.on_hand,
    quantities?.damaged,
  ]);

  // Function to handle available value change and update the changes array
  useEffect(() => {
    setOnHand(available + committed + unAvailable);
  }, [resetChanges, available, committed, unAvailable]);

  
  return (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      {/*Title, Image Ceil*/}
      <IndexTable.Cell className="w-60">
        <div className="py-2 flex gap-4 items-center">
          {variant?.product?.featuredMedia === null ? (
            <Thumbnail
              source={ImageIcon}
              alt={variant.product.title}
              size="small"
            />
          ) : (
            <Thumbnail
              source={variant?.product?.featuredMedia?.preview?.image?.url}
              alt={variant.product.title}
              size="small"
            />
          )}
          <div className="flex flex-col gap-1">
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {variant.product.title}
            </Text>
            {variant.title === "Default Title" ? null : (
              <p className="flex bg-gray-300 text-black text-[11px] w-fit rounded-lg justify-center items-center px-3 py-1">
                {variant.title}
              </p>
            )}
          </div>
        </div>
      </IndexTable.Cell>

      {/* SKU Ceil */}
      <IndexTable.Cell className="w-32">
        <div className="py-2">{!sku ? "No SKU" : sku}</div>
      </IndexTable.Cell>

      {/*Barcode Ceil*/}
      <IndexTable.Cell className="w-32">
        <div className="py-2">
          {!variant.barcode ? "null" : variant.barcode}{" "}
        </div>
      </IndexTable.Cell>

      {/* Quantity Damaged Ceil */}
      <IndexTable.Cell className="w-32">
        <div className="py-2">
          <Cell val={unAvailable} type="damaged" />
        </div>
      </IndexTable.Cell>

      {/* Quantity Committed Ceil */}
      <IndexTable.Cell className="w-32">
        <div className="py-2">
          <Cell val={committed} type="commited" />
        </div>
      </IndexTable.Cell>

      {/* Quantity Available Ceil */}
      <IndexTable.Cell className="w-32">
        <div className="py-2" onClick={(e) => e.stopPropagation()}>
          <RightCell
            val={available}
            type={"available"}
            id={id}
            onValueChange={handleAvailableChange}
            setAvailable={setAvailable}
          />
        </div>
      </IndexTable.Cell>

      {/* Quantity On Hand Ceil */}
      <IndexTable.Cell className="w-32">
        <div className="py-2" onClick={(e) => e.stopPropagation()}>
          <RightCell val={onHand} type={"onHand"} />
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}
