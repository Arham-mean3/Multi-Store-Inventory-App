// import { Fragment, useEffect } from "react";
// import { useFetcher } from "@remix-run/react";
// import { Button } from "@shopify/polaris";
// import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import Heading from "../components/Heading";
import Inventory from "../components/Inventory";
import ExportModal from "../components/ExportModal";
import ImportModal from "../components/ImportModal";
import { getAllLocations, getInventoryItemsQuery } from "../lib/queries";
import { json, useLoaderData } from "@remix-run/react";
import { useContext, useMemo, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
  ${getInventoryItemsQuery}`,
  );

  const locationResponse = await admin.graphql(
    `#graphql
    ${getAllLocations}`,
  );

  const result = await response.json();
  const locationResult = await locationResponse.json();

  // Extract the data directly from the response
  const inventoryItems = result?.data?.inventoryItems?.edges;
  const locations = locationResult.data?.locations?.edges;
  // Return the data in the required format

  //DESELECTED DATA
  const deselectedInventoryData = inventoryItems
    .filter(({ node }) => node.variant.product.hasOutOfStockVariants)
    .map(({ node }) => ({
      id: node.id,
      sku: node.sku,
      COO: node.countryCodeOfOrigin,
      hsCode: node.harmonizedSystemCode,
      variant: node.variant,
      quantities: node.inventoryLevels.edges.reduce((acc, { node }) => {
        node.quantities.forEach(({ name, quantity }) => {
          acc[name] = quantity;
        });
        return acc;
      }, {}),
      inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
        location: Array.isArray(node.location)
          ? node.location.map((loc) => loc.id)
          : node.location
            ? [node.location.id] // Wrap single location object in an array
            : [], // Fallback to empty array
      })),
    }));

  return json({
    data: deselectedInventoryData,
    locations,
  });
};

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);

//   return json({});
// };

export default function Index() {
  // STATE-HANDLING-START-START-HERE
  const [selected, setSelected] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // STATE-HANDLING-START-END-HERE
  const itemsPerPage = 50;

  // GET-DATA-FROM-SERVER-HERE--------------
  const { data, locations } = useLoaderData();
  const { transformedData } = useContext(InventoryContext);

  const inventoryData = transformedData.length > 0 ? transformedData : data;

  const deselectedLocationData = useMemo(
    () =>
      locations.map(({ node }) => ({
        id: node.id,
        name: node.name,
        address: node.address.formatted,
      })),
    [locations],
  );

  const filteredInventoryData = useMemo(() => {
    if (!selected) return inventoryData; // If no location is selected, return all data

    // Filter by selected location ID
    return inventoryData
      .map((item) => ({
        ...item,
        inventoryLevels: item.inventoryLevels.filter((level) =>
          level.location.includes(selected),
        ),
      }))
      .filter((item) => item.inventoryLevels.length > 0); // Remove items with no matching inventoryLevels
  }, [selected]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedOrders = inventoryData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  console.log("Parsed Data", transformedData)

  return (
    <div className="mx-10">
      <Heading locations={deselectedLocationData} selection={setSelected} />
      <Inventory
        data={inventoryData.length < 0 ? inventoryData : filteredInventoryData}
        currentPage={currentPage}
        totalPages={totalPages}
        paginatedOrders={paginatedOrders}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
      />
      <div>
        <ExportModal
          currentLocation={selected}
          locations={deselectedLocationData}
          data={paginatedOrders}
          all={filteredInventoryData}
        />
        <ImportModal />
      </div>
    </div>
  );
}
