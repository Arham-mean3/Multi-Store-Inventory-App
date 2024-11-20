import React from "react";
import InventoryTable from "./InventoryTable";
import {
  IndexTable,
  Text,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
import { Cell, RightCell } from "./Cell";

export default function Inventory({
  data,
  currentPage,
  totalPages,
  paginatedOrders,
  handleNextPage,
  handlePreviousPage,
}) {
  const resourceName = {
    singular: "data",
    plural: "data",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);

    console.log("Paginated Order", paginatedOrders.map((val)=>val.quantities.available))

  const rowMarkup = paginatedOrders.map(
    ({ id, variant, sku, quantities, location }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell className="w-60">
          <div className="py-2 flex gap-4 items-center">
            <Thumbnail
              source={variant?.product?.featuredMedia?.preview?.image?.url}
              alt={variant.product.title}
              size="small"
            />
            <div className="flex flex-col gap-1 items-center">
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {variant.product.title}
              </Text>
              <p className="flex bg-gray-300 text-black text-[10px] w-4 font-bold rounded-sm justify-center items-center px-1">
                {variant.title}
              </p>
            </div>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
          <div className="py-2">{!sku ? "No SKU" : sku}</div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
          <div className="py-2">
            {!variant.barCode ? "null" : variant.barCode}{" "}
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
          <div className="py-2">
            <Cell
              val={quantities.damaged === 0 ? "0" : quantities.damaged}
              type="commited"
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
          <div className="py-2">
            <Cell
              val={quantities.committed === 0 ? "0" : quantities.committed}
              type="commited"
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
          <div className="py-2">
            <RightCell val={quantities.available} type={"available"} />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="w-32">
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
        orders={data}
        rowMarkup={rowMarkup}
        selectedResources={selectedResources}
        allResourcesSelected={allResourcesSelected}
        handleSelectionChange={handleSelectionChange}
        resourceName={resourceName}
        currentPage={currentPage}
        totalPages={totalPages}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
      />
    </>
  );
}
