import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import InventoryTable from "./InventoryTable";
import { useIndexResourceState } from "@shopify/polaris";
import RowMarkup from "./RowMarkup";
import { InventoryContext } from "../context/Inventory-Context";

export default function Inventory({
  data,
  setPaginatedOrders,
  InventoryRowUpdate,
}) {
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

  // Changes Array
  const { changesArray, setSelectedItems } = useContext(InventoryContext);

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

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredData);

  // Pagination Button Next and Previous

  const handleNextPage = useCallback(() => {
    if (changesArray.length === 0) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      console.log("Changes Array Length", changesArray.length);
      shopify.toast.show("You have unsaved changes.");
    }
  }, [totalPages, currentPage, changesArray]);

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

  // Everytime you select a items it id will be saved in an array so that if you want to export an item that is selected, here is where we are getting an id for selected items
  useEffect(() => {
    setSelectedItems(selectedResources);
  }, [selectedResources]);

  console.log("Inventory Component Re-Renders");

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
        InventoryRowUpdate={InventoryRowUpdate}
      />
    </>
  );
}
