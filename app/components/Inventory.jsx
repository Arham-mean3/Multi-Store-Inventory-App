import React, { useCallback, useEffect, useMemo, useState } from "react";
import InventoryTable from "./InventoryTable";
import {
  IndexTable,
  Text,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
import { Cell, RightCell } from "./Cell";
import { ImageIcon } from "@shopify/polaris-icons";
import RowMarkup from "./RowMarkup";

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
        rowMarkup={
          <RowMarkup
            paginatedOrders={paginatedOrders}
            selectedResources={selectedResources}
          />
        }
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
