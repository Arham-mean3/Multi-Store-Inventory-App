// import { Fragment, useEffect } from "react";
// import { useFetcher } from "@remix-run/react";
// import { Button } from "@shopify/polaris";
// import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import Heading from "../components/Heading";
import Inventory from "../components/Inventory";
import ExportModal from "../components/ExportModal";
import ImportModal from "../components/ImportModal";
import {
  getAllLocations,
  getInventoryItemsQuery,
  updateInventoryQuantitiesQuery,
  updateProductQuery,
  updateProductVariantQuery,
} from "../lib/queries";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import { customdata } from "../lib/extras";

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
    data: inventoryItems,
    locations,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const values = await request.formData();
  const formData = Object.fromEntries(values);

  const { actionKey: key } = formData;

  switch (key) {
    case "InventoryUpdate":
      try {
        const { inventoryData } = formData;

        const parsedInventoryData = JSON.parse(inventoryData);

        for (const data of parsedInventoryData) {
          console.log("Get Data from server");

          // Update Product Title and Handle
          const updateProductResponse = await admin.graphql(
            `#graphql
            ${updateProductQuery}
          `,
            {
              variables: {
                input: {
                  id: data.product.id,
                  handle: data.product.handle,
                  title: data.product.title,
                },
              },
            },
          );

          const updateProduct = await updateProductResponse.json();
          console.log("Product Title and Handle Updated");

          // Update Product variants

          const updateProductVariantsResponse = await admin.graphql(
            `#graphql
               ${updateProductVariantQuery}
              `,
            {
              variables: {
                productId: data.product.id,
                variants: [
                  {
                    id: data.product.variant.id,
                    barcode: data.product.variant.barcode,
                    inventoryItem: {
                      countryCodeOfOrigin: data.product.variant.COO,
                      harmonizedSystemCode: data.product.variant.hsCode,
                      sku: data.product.variant.inventoryItems.sku,
                    },
                  },
                ],
              },
            },
          );

          const variantUpdated = await updateProductVariantsResponse.json();

          console.log("Product Variant Update Successfully");
          // Update Inventory Levels quantity

          const updateInventoryQuantitesResponse = await admin.graphql(
            `#graphql
              ${updateInventoryQuantitiesQuery}
              `,
            {
              variables: {
                input: {
                  reason: "correction",
                  name: data.inventoryLevels.quantities[0].name,
                  changes: [
                    {
                      delta: data.inventoryLevels.quantities[0].quantity,
                      inventoryItemId: data.id,
                      locationId: data.inventoryLevels.location.id,
                    },
                  ],
                },
              },
            },
          );

          const inventoryQuantites =
            await updateInventoryQuantitesResponse.json();

          console.log("Inventory Quantity Updated Successfully");
        }

        console.log("Updated All entries");

        return json(
          { message: "Sucessfully updated inventory!", success: true },
          { status: 201 },
        );
      } catch (error) {
        console.log(error);
        return json(
          { message: "Something went wrong!", error: error },
          { status: 404 },
        );
      }
    default:
      break;
  }
};

export default function Index() {
  // STATE-HANDLING-START-START-HERE
  const [selected, setSelected] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [custom, setCustom] = useState([]);

  // STATE-HANDLING-START-END-HERE
  const itemsPerPage = 50;

  // GET-DATA-FROM-SERVER-HERE--------------
  const { data, locations } = useLoaderData();
  const fetcher = useFetcher();
  const { transformedData, setLocations, matchData, setMatchData } =
    useContext(InventoryContext);
  // Deselection Of Data

  // Components Usage and Excel File Usage
  const deselectedInventoryData = useMemo(
    () =>
      data
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
          inventoryLevels: {
            location: node.inventoryLevels.edges.map(
              ({ node }) => node.location.id,
            ),
          },
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
    return deselectedInventoryData
      .map((item) => ({
        ...item,
        inventoryLevels: {
          location: item.inventoryLevels.location.filter(
            (locationId) => locationId === selected,
          ),
        },
      }))
      .filter((item) => item.inventoryLevels.location.length > 0); // Remove items with no matching inventoryLevels
  }, [selected, data]);

  const inventoryData = filteredInventoryData;

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

  let matchedData = transformedData
    .map((parsedItem) => {
      // Find a matching record in customdata
      const matchingItem = custom.find((customItem) => {
        // Match SKU, variant title, product title, or other relevant fields
        const isMatch =
          customItem.sku === parsedItem.sku ||
          (customItem.variant.title === parsedItem.variant.title &&
            customItem.product.title === parsedItem.variant.product.title);

        // Check if the location matches any in inventoryLevels
        const locationMatch = customItem.inventoryLevels.location.some(
          (loc) => loc.name === parsedItem.location,
        );

        return isMatch && locationMatch;
      });

      // console.log(matchingItem);

      if (matchingItem) {
        return {
          id: matchingItem.id, // Include the ID from customdata
          location: parsedItem.location, // Include matched location
          product: {
            id: matchingItem.product.id,
            title: parsedItem.variant.product.title,
            handle: parsedItem.variant.product.handle,
            variant: {
              id: matchingItem.variant.id,
              title: parsedItem.variant.title,
              barcode: parsedItem.variant.barCode,
              inventoryItems: {
                COO: parsedItem.COO || matchingItem.COO,
                hsCode: parsedItem.hsCode || matchingItem.hsCode,
                sku: parsedItem.sku, // Use parsed data or fallback to customdata
              },
            },
          },
          inventoryLevels: {
            location: matchingItem.inventoryLevels.location.find(
              (loc) => loc.name === parsedItem.location,
            ), // Add the matched location details
            quantities: matchingItem.inventoryLevels.quantities[0], // Quantities from customdata
          },
        };
      }

      // Optionally, handle unmatched cases
      return null;
    })
    .filter((item) => item !== null); // Filter out unmatched records

  console.log("Matched Data", matchedData);

  const InventoryUpdateHandler = async () => {
    const formData = {
      actionKey: "InventoryUpdate",
      inventoryData: JSON.stringify(matchData),
    };
    try {
      console.log("API-CALL", formData);
      await fetcher.submit(formData, { method: "POST" });
    } catch (error) {
      console.log("Something Went Wrong!", error);
    }
  };

  useEffect(() => {
    console.log("Starting-------------------------------");
    console.log("Original Data", data);
    const custom = customdata(data);
    setCustom(custom);
  }, []);

  console.log("Custom Data--", custom);

  useEffect(() => {
    setLocations(deselectedLocationData);
  }, [deselectedLocationData]);

  useEffect(() => {
    console.log("Match Data Added!");
    setMatchData(matchedData);
  }, [matchedData.length > 0]);

  return (
    <div className="mx-10">
      <Heading location={deselectedLocationData} selection={setSelected} />
      <Inventory
        data={inventoryData}
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
        <ImportModal InventoryUpdate={InventoryUpdateHandler} />
      </div>
    </div>
  );
}
