import React from "react";
import InventoryTable from "./InventoryTable";
import {
  Divider,
  IndexTable,
  Text,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
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
    ({ id, variant, sku, inventoryLevels, quantities, location }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <div className="py-2">
            <Thumbnail
              source={variant?.product?.featuredMedia?.preview?.image?.url}
              alt={variant.product.title}
              size="small"
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {variant.product.title}
            </Text>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">{!sku ? "No SKU" : sku}</div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            {!variant.barCode ? "null" : variant.barCode}{" "}
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            <Cell
              val={quantities.damaged === 0 ? "0" : quantities.damaged}
              type="commited"
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            <Cell
              val={quantities.committed === 0 ? "0" : quantities.committed}
              type="commited"
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            <RightCell val={quantities.available} type={"available"} />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className="py-2">
            <RightCell val={quantities.on_hand} type={"onHand"} />
          </div>
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
