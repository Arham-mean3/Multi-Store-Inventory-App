import React, { useContext, useEffect } from "react";
import Inventory from "../components/Inventory";
import Heading from "../components/Heading";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  getAllLocations,
  getAfterSpecificInventoryItemsQuery,
  updateInventoryQuantitiesQuery,
  getBeforeSpecificInventoryItemsQuery,
} from "../lib/queries";
import { useAppBridge } from "@shopify/app-bridge-react";
import { InventoryContext } from "../context/Inventory-Context";
import { customdata, customdataAdditional } from "../lib/extras";
import Loading from "../components/Loading";

// export const loader = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);

//   const url = new URL(request.url);

//   const locationResponse = await admin.graphql(
//     `#graphql
//     ${getAllLocations}`,
//   );

//   const locationResult = await locationResponse.json();
//   const locations = locationResult.data?.locations?.edges;

//   let locationData = locations.map(({ node }) => ({
//     id: node.id,
//     name: node.name,
//     address: node.address.formatted,
//   }));

//   const location = url.searchParams.get("location") || locationData[1].id;
//   const afterCursor = url.searchParams.get("after") || null; // Default to null
//   const beforeCursor = url.searchParams.get("before") || null; // Default to null
//   let fetchedInventoryItems = [];
//   let hasNextPage = true;
//   let hasPreviousPage = false;
//   let cursor = afterCursor;
//   let result;
//   // Decide which query to run
//   let graphqlQuery;
//   let variables;

//   if (beforeCursor) {
//     // Backward pagination query
//     graphqlQuery = `#graphql ${getBeforeSpecificInventoryItemsQuery}`;
//     variables = { last: 50, before: beforeCursor, id: location };
//   } else {
//     // Forward pagination or initial load query
//     graphqlQuery = `#graphql ${getAfterSpecificInventoryItemsQuery}`;
//     variables = { first: 50, after: afterCursor, id: location };
//   }

//   while (fetchedInventoryItems.length < 50 && hasNextPage && !hasPreviousPage) {
//     const response = await admin.graphql(graphqlQuery, { variables });
//     result = await response.json();
//     const inventoryItems = result?.data?.inventoryItems?.edges || [];

//     // Filter items with valid inventoryLevel
//     const filteredItems = inventoryItems
//       .map(({ node }) => {
//         const {
//           id,
//           sku,
//           countryCodeOfOrigin: COO,
//           harmonizedSystemCode: hsCode,
//           variant,
//           inventoryLevel,
//         } = node;
//         const { product } = variant;

//         const options = product.options
//           .map((option) => {
//             const matchedValues = option.values.includes(variant.title)
//               ? [{ name: option.name, value: variant.title }]
//               : [];
//             return matchedValues.length > 0
//               ? matchedValues
//               : { name: option.name, values: option.values };
//           })
//           .flat();

//         if (inventoryLevel) {
//           return {
//             id,
//             sku,
//             COO,
//             hsCode,
//             variant,
//             inventoryLevel,
//             options,
//           };
//         }

//         return null;
//       })
//       .filter((item) => item !== null); // Remove null items

//     fetchedInventoryItems = [...fetchedInventoryItems, ...filteredItems];
//     cursor = result?.data?.inventoryItems?.pageInfo?.endCursor;
//     hasNextPage = result?.data?.inventoryItems?.pageInfo?.hasNextPage;
//     hasPreviousPage = result?.data?.inventoryItems?.pageInfo?.hasPreviousPage;
//     // Update variables for the next query
//     variables = { first: 50, after: cursor, id: location };
//   }

//   // // Execute GraphQL query
//   // const response = await admin.graphql(graphqlQuery, { variables });
//   // const result = await response.json();

//   // // Extract the data directly from the response
//   // const inventoryItems = result?.data?.inventoryItems?.edges;
//   // Return the data in the required format

//   // const deselectedInventoryData = inventoryItems
//   //   .map(({ node }) => {
//   //     const {
//   //       id,
//   //       sku,
//   //       countryCodeOfOrigin: COO,
//   //       harmonizedSystemCode: hsCode,
//   //       variant,
//   //       inventoryLevel,
//   //     } = node;
//   //     const { product } = variant;

//   //     // Optimize options mapping
//   //     const options = product.options
//   //       .map((option) => {
//   //         const matchedValues = option.values.includes(variant.title)
//   //           ? [{ name: option.name, value: variant.title }]
//   //           : [];
//   //         return matchedValues.length > 0
//   //           ? matchedValues
//   //           : { name: option.name, values: option.values };
//   //       })
//   //       .flat();

//   //     // Only include items where inventoryLevel is not null
//   //     if (inventoryLevel) {
//   //       return {
//   //         id,
//   //         sku,
//   //         COO,
//   //         hsCode,
//   //         variant,
//   //         inventoryLevel,
//   //         options,
//   //       };
//   //     }

//   //     // Return null or skip items with null inventoryLevel
//   //     return null;
//   //   })
//   //   .filter((item) => item !== null); // Remove null values

//   return json({
//     data: fetchedInventoryItems,
//     locations: locationData,
//     pageInfo: result?.data?.inventoryItems?.pageInfo,
//   });
// };

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);

  // Fetch all locations
  const locationResponse = await admin.graphql(`#graphql ${getAllLocations}`);
  const locationResult = await locationResponse.json();
  const locations = locationResult.data?.locations?.edges;

  const locationData = locations.map(({ node }) => ({
    id: node.id,
    name: node.name,
    address: node.address.formatted,
  }));

  const location = url.searchParams.get("location") || locationData[1]?.id;
  const afterCursor = url.searchParams.get("after") || null;
  const beforeCursor = url.searchParams.get("before") || null;

  let fetchedInventoryItems = [];
  let hasNextPage = true;
  let hasPreviousPage = false;
  let cursor = afterCursor || beforeCursor; // Determine starting cursor
  let result;

  // Decide query type (forward or backward pagination)
  let graphqlQuery = beforeCursor
    ? `#graphql ${getBeforeSpecificInventoryItemsQuery}`
    : `#graphql ${getAfterSpecificInventoryItemsQuery}`;
  let variables = beforeCursor
    ? { last: 50, before: beforeCursor, id: location }
    : { first: 50, after: afterCursor, id: location };

  // Loop until we accumulate at least 50 valid items or exhaust data
  while (fetchedInventoryItems.length < 50 && hasNextPage) {
    const response = await admin.graphql(graphqlQuery, { variables });
    result = await response.json();

    const inventoryItems = result?.data?.inventoryItems?.edges || [];

    // Filter items with valid inventory levels
    const filteredItems = inventoryItems
      .map(({ node }) => {
        const {
          id,
          sku,
          countryCodeOfOrigin: COO,
          harmonizedSystemCode: hsCode,
          variant,
          inventoryLevel,
        } = node;
        const { product } = variant;

        const options = product.options
          .map((option) => {
            const matchedValues = option.values.includes(variant.title)
              ? [{ name: option.name, value: variant.title }]
              : [];
            return matchedValues.length > 0
              ? matchedValues
              : { name: option.name, values: option.values };
          })
          .flat();

        if (inventoryLevel) {
          return {
            id,
            sku,
            COO,
            hsCode,
            variant,
            inventoryLevel,
            options,
          };
        }

        return null;
      })
      .filter(Boolean); // Remove null items

    // Accumulate valid items
    fetchedInventoryItems = [...fetchedInventoryItems, ...filteredItems];

    // Update pagination variables
    cursor = beforeCursor
      ? result?.data?.inventoryItems?.pageInfo?.startCursor
      : result?.data?.inventoryItems?.pageInfo?.endCursor;

    hasNextPage = result?.data?.inventoryItems?.pageInfo?.hasNextPage;
    hasPreviousPage = result?.data?.inventoryItems?.pageInfo?.hasPreviousPage;

    // Update variables for the next query
    variables = beforeCursor
      ? { last: 50, before: cursor, id: location }
      : { first: 50, after: cursor, id: location };

    // Break if no more pages are available
    if (!hasNextPage && !hasPreviousPage) break;
  }

  // Enforce a limit of 50 items per page
  const paginatedItems = fetchedInventoryItems.slice(0, 50);

  // Adjust pagination flags if more items are present
  hasNextPage = fetchedInventoryItems.length > 50 || hasNextPage;

  // Return data to the frontend
  return json({
    data: paginatedItems,
    locations: locationData,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      endCursor: result?.data?.inventoryItems?.pageInfo?.endCursor || null,
      startCursor: result?.data?.inventoryItems?.pageInfo?.startCursor || null,
    },
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const values = await request.formData();
  const formData = Object.fromEntries(values);

  const { actionKey: key } = formData;

  switch (key) {
    case "RowUpdates":
      try {
        const { data } = formData;

        const quantities = JSON.parse(data);

        console.log("Quantities", quantities);

        // Updating Queries Inventory Items Quantities
        const updatedInventoryItemsQuantity = await admin.graphql(
          `#graphql
          ${updateInventoryQuantitiesQuery}
          `,
          {
            variables: {
              input: {
                reason: "correction",
                name: "available",
                ignoreCompareQuantity: true,
                quantities: quantities,
              },
            },
          },
        );
        const updateItems = await updatedInventoryItemsQuantity.json();

        return json(
          {
            message: "Successfully Inventory Items Updated!",
            success: true,
          },
          { status: 201 },
        );
      } catch (error) {
        return json(
          { message: "Something went wrong!", error: error, success: false },
          { status: 404 },
        );
      }
    default:
      break;
  }
};
export default function AdditionalPage() {
  const { data, locations, pageInfo } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const {
    selected,
    setSelected,
    changesArray,
    resetChanges,
    isLoading: loading,
    setCustom,
  } = useContext(InventoryContext);

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (isLoading) {
      shopify.toast.show("Importing...");
    }
  }, [isLoading]);

  useEffect(() => {
    const custom = customdataAdditional(data);
    setCustom(custom);
  }, []);

  const InventoryRowUpdate = async () => {
    const formData = {
      actionKey: "RowUpdates",
      data: JSON.stringify(changesArray),
    };
    try {
      await fetcher.submit(formData, { method: "POST" });
      resetChanges();
    } catch (error) {
      console.log("Something went wrong! --client");
    }
  };

  return (
    <div className="mx-4 lg:mx-10 pb-1">
      <Heading
        location={locations}
        selection={setSelected}
        selectedLocation={selected}
      />
      {loading ? (
        <Loading text="Please wait..." />
      ) : (
        <>
          <Inventory data={data} InventoryRowUpdate={InventoryRowUpdate} />
          <div className="mb-4">
            <h1 className="text-center">
              Learn more about{" "}
              <a
                className="text-blue-600 cursor-pointer border-b-[1px] border-blue-600"
                target="_blank"
                rel="noopener noreferrer"
                href="https://help.shopify.com/en/manual/products/inventory?st_source=admin&st_campaign=inventory_footer&utm_source=admin&utm_campaign=inventory_footer"
              >
                managing inventory
              </a>
            </h1>
          </div>
        </>
      )}
    </div>
  );
}
