import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InventoryTable from "./InventoryTable";
import {
  IndexTable,
  Text,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
import { Cell, RightCell } from "./Cell";
import { ImageIcon } from "@shopify/polaris-icons";

export default function Inventory({ data, setPaginatedOrders }) {
  const resourceName = {
    singular: "Inventory Item",
    plural: "Inventory Items",
  };
  // How many items to be shown on the page after or before pagination.
  const itemsPerPage = 50;
  const [queryValue, setQueryValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Getting the value of what is type inside the search input
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    [],
  );

  // For finding or querying or searching a items from the search sections

  const filteredData = useMemo(() => {
    if (!queryValue) return data; // Return all data if no query
    const lowerQuery = queryValue.toLowerCase();
    return data.filter(
      (order) =>
        order.variant.product.title.toLowerCase().includes(lowerQuery) ||
        order.variant.barcode?.toLowerCase().includes(lowerQuery), // Include SKU filtering
    );
  }, [data, queryValue]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredData);

  // Dividing the data into parts for showing pagination data

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData.length],
  );

  // Applying Pagination

  const paginatedOrders = useMemo(
    () =>
      filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage,
      ),
    [filteredData, currentPage],
  );

  // Pagination Button Next and Previous

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [totalPages, currentPage]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Inventory Table Row
  const rowMarkup = useMemo(
    () =>
      paginatedOrders.map(({ id, variant, sku, quantities }, index) => {
        
        return (
          <IndexTable.Row
            id={id}
            key={id}
            selected={selectedResources.includes(id)}
            position={index}
          >
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
                    source={
                      variant?.product?.featuredMedia?.preview?.image?.url
                    }
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
            <IndexTable.Cell className="w-32">
              <div className="py-2">{!sku ? "No SKU" : sku}</div>
            </IndexTable.Cell>
            <IndexTable.Cell className="w-32">
              <div className="py-2">
                {!variant.barcode ? "null" : variant.barcode}{" "}
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
                <RightCell
                  val={quantities?.available === 0 ? 0 : quantities.available}
                  type={"available"}
                  id={id}
                  initialCommitted={quantities.committed}
                  initialOnHand={quantities.on_hand}
                  onCommitChange={(newCommittedValue) => {
                    // Handle committed value change in parent (e.g., save to server or local state)
                  }}
                />
              </div>
            </IndexTable.Cell>
            <IndexTable.Cell className="w-32">
              <div className="py-2">
                <RightCell
                  val={quantities?.on_hand === 0 ? 0 : quantities.on_hand}
                  type={"onHand"}
                />
              </div>
            </IndexTable.Cell>
          </IndexTable.Row>
        );
      }),
    [paginatedOrders, selectedResources],
  );

  // When Viewing Inventory Items for different locations, the pagination should be zero in order to view first items of other locations
  useEffect(() => {
    setCurrentPage(0); // Reset currentPage on data change
  }, [data]);

  // This is required by the Export Modal Component if the current page is exported!

  useEffect(() => {
    setPaginatedOrders(paginatedOrders);
  }, [handleNextPage, handlePreviousPage]);

  return (
    <>
      <InventoryTable
        orders={filteredData}
        rowMarkup={rowMarkup}
        selectedResources={selectedResources}
        allResourcesSelected={allResourcesSelected}
        queryValue={queryValue}
        resourceName={resourceName}
        currentPage={currentPage}
        totalPages={totalPages}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        handleSelectionChange={handleSelectionChange}
        setQueryValue={setQueryValue}
        handleFiltersQueryChange={handleFiltersQueryChange}
      />
    </>
  );
}
