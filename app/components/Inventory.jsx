import React from "react";
import InventoryTable from "./InventoryTable";
import { IndexTable, Text, useIndexResourceState } from "@shopify/polaris";
import { Cell, RightCell } from "./Cell";

export default function Inventory({ data }) {
  const orders = [
    {
      id: "1",
      productName: "Short Sleeve T-shirts",
      variant: "variant1",
      sku: "No SKU",
      available: 0,
      onHand: 0,
      barCode: 1234,
      price: 50,
      committed: "0",
      unAvailable: "0",
    },
    {
      id: "2",
      productName: "Short Sleeve T-shirts",
      variant: "variant1",
      sku: "No SKU",
      available: 0,
      onHand: 0,
      barCode: 1234,
      price: 50,
      committed: "0",
      unAvailable: "0",
    },
    {
      id: "3",
      productName: "Short Sleeve T-shirts",
      variant: "variant1",
      sku: "No SKU",
      available: 0,
      onHand: 0,
      barCode: 1234,
      price: 50,
      committed: "0",
      unAvailable: "0",
    },
  ];
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = data.map(
    ({ id, variant, sku, quantities, location }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {variant.displayName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{!sku ? "No SKU" : sku}</IndexTable.Cell>
        <IndexTable.Cell>
          {!variant.barCode ? "null" : variant.barCode}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {/* {<Cell data={unAvailable} type="unAvailable" />} */}
          null
        </IndexTable.Cell>
        <IndexTable.Cell>
          {/* {<Cell val={committed} type="commited" />} */}
          null
        </IndexTable.Cell>
        <IndexTable.Cell>
          <RightCell type={"available"} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <RightCell type={"onHand"} />
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <>
      <InventoryTable
        orders={orders}
        rowMarkup={rowMarkup}
        selectedResources={selectedResources}
        allResourcesSelected={allResourcesSelected}
        handleSelectionChange={handleSelectionChange}
        resourceName={resourceName}
      />
    </>
  );
}
