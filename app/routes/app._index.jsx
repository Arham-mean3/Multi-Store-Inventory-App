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
import {useMemo, useState } from "react";

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
  return json({
    data: inventoryItems || [],
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
  // STATE-HANDLING-START-END-HERE

  // GET-DATA-FROM-SERVER-HERE--------------
  const { data, locations } = useLoaderData();

  const deselectedInventoryData = useMemo(
    () =>
      data.map(({ node }) => ({
        id: node.id,
        inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
          quantities: node.quantities.map((quantity) => ({
            id: quantity.id,
            name: quantity.name,
            quantity: quantity.quantity,
          })),
          location: Array.isArray(node.location)
            ? node.location.map((loc) => loc.id)
            : node.location
              ? [node.location.id] // Wrap single location object in an array
              : [], // Fallback to empty array
        })),
        sku: node.sku,
        variant: node.variant,
      })),
    [data],
  );

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
    if (!selected) return deselectedInventoryData; // If no location is selected, return all data
  
    // Filter by selected location ID
    return deselectedInventoryData.map((item) => ({
      ...item,
      inventoryLevels: item.inventoryLevels.filter((level) =>
        level.location.includes(selected)
      ),
    })).filter(item => item.inventoryLevels.length > 0); // Remove items with no matching inventoryLevels
  }, [selected]);


  return (
    <div className="mx-10">
      <Heading locations={deselectedLocationData} selection={setSelected} />
      <Inventory data={filteredInventoryData} />
      <div>
        <ExportModal />
        <ImportModal />
      </div>
    </div>
  );
}
