import { authenticate } from "../shopify.server";
import {
  bulkOperationResponseQuery,
  getAllLocations,
  getInventoryItemsQuery,
  getStoreUrl,
  runBulkQueryOperation,
  updateInventoryQuantitiesQuery,
  updateProductQuery,
  updateProductVariantQuery,
} from "../lib/queries";
import {
  json,
  useFetcher,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import prisma from "../db.server";
import { useAppBridge } from "@shopify/app-bridge-react";
// import { Resend } from "resend";
// import { render } from "@react-email/components";
// import ImportEmailLayout from "../email/Import-Email-Layout";
import { Button, Icon } from "@shopify/polaris";
import ExportModal from "../components/ExportModal";
import ImportModal from "../components/ImportModal";
import FeatureImage from "../images/image.jpg";
import { ExportIcon, ImportIcon } from "@shopify/polaris-icons";
import { customdata, getDataFromCSVFile } from "../lib/extras";

// const resend = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || null;
  // let data = [];
  // let buffer = "";

  console.log("Type-----", type);

  //   const bulkOperationQuery = await admin.graphql(`
  // #graphql
  // ${runBulkQueryOperation}
  //     `);

  const response = await admin.graphql(
    `#graphql
  ${getInventoryItemsQuery}`,
  );

  const locationResponse = await admin.graphql(
    `#graphql
    ${getAllLocations}`,
  );

  const storeUrlResponse = await admin.graphql(`
    #graphql
    ${getStoreUrl}`);

  // const bulkQueryResult = await bulkOperationQuery.json();

  // const bulkOperationId =
  //   bulkQueryResult.data?.bulkOperationRunQuery?.bulkOperation?.id;

  // console.log(
  //   "Bulk Query Responses",
  //   bulkQueryResult.data.bulkOperationRunQuery.bulkOperation.id,
  //   "Created",
  //   bulkQueryResult.data.bulkOperationRunQuery.bulkOperation.status ===
  //     "CREATED"
  //     ? true
  //     : false,
  // );

  // async function pollBulkOperationStatus(operationId) {
  //   let status = "RUNNING";
  //   let response;

  //   while (status === "RUNNING") {
  //     // Wait 2 seconds before checking again
  //     await new Promise((resolve) => setTimeout(resolve, 2000));

  //     // Fetch the bulk operation status
  //     const bulkOperationResponse = await admin.graphql(
  //       `
  //     #graphql
  //       ${bulkOperationResponseQuery}
  //     `,
  //       {
  //         variables: {
  //           id: operationId,
  //           type: "QUERY",
  //           status: "CREATED",
  //         },
  //       },
  //     );

  //     response = await bulkOperationResponse.json();
  //     status = response.data.currentBulkOperation.status;

  //     console.log("Polling Bulk Operation Status: ", status);
  //   }
  //   return response.data.currentBulkOperation;
  // }

  // // Wait for the bulk operation to complete
  // const bulkResponse = await pollBulkOperationStatus(bulkOperationId);

  // if (bulkResponse.status === "COMPLETED") {
  //   console.log("Bulk Operation Completed!");
  //   console.log("File URL: ", bulkResponse.url);

  //   const response = await fetch(bulkResponse.url);

  //   if (!response.ok) {
  //     throw new Response("Failed to fetch JSONL file", {
  //       status: response.status,
  //     });
  //   }

  //   const reader = response.body?.getReader();
  //   const decoder = new TextDecoder("utf-8");

  //   if (reader) {
  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;

  //       buffer += decoder.decode(value, { stream: true });

  //       // Process each line
  //       const lines = buffer.split("\n");
  //       buffer = lines.pop() || ""; // Keep any incomplete line for the next chunk

  //       for (const line of lines) {
  //         if (line.trim()) {
  //           try {
  //             data.push(JSON.parse(line));
  //           } catch (error) {
  //             console.error("Error parsing JSONL line:", line, error);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // Handle any remaining line in the buffer
  //   if (buffer.trim()) {
  //     try {
  //       data.push(JSON.parse(buffer));
  //     } catch (error) {
  //       console.error("Error parsing remaining JSONL buffer:", buffer, error);
  //     }
  //   }
  // } else {
  //   console.error(
  //     "Bulk Operation Failed or Was Canceled: ",
  //     bulkResponse.status,
  //   );
  // }

  // console.log("Data", data);

  const result = await response.json();
  const locationResult = await locationResponse.json();
  const storeUrl = await storeUrlResponse.json();

  const key = `import_inventory_${storeUrl.data.shop.url}`;
  const processingState = await prisma.processingState.findUnique({
    where: { key },
  });

  const processingData = await prisma.processingState.findMany();

  // Extract the data directly from the response
  const inventoryItems = result?.data?.inventoryItems?.edges;
  const locations = locationResult.data?.locations?.edges;
  // Return the data in the required format

  return json({
    data: inventoryItems,
    locations,
    url: storeUrl.data.shop.url,
    name: storeUrl.data.shop.name,
    state: processingState?.isActive,
    processingData: processingData || [],
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const values = await request.formData();
  const formData = Object.fromEntries(values);

  const { actionKey: key, name, url } = formData;

  switch (key) {
    case "InventoryUpdate":
      try {
        const { inventoryData, missing } = formData;
        const uniqueLocationIds = new Set();
        let errors = [];
        const missingColumns = JSON.parse(missing);
        console.log("Any Missing Column", missingColumns);
        // Check if another import is in progressF
        // Check if another import is active for the same store
        const processingState = await prisma.processingState.findUnique({
          where: { key: `import_inventory_${url}` },
        });

        if (processingState?.isActive) {
          return json(
            {
              message: `Another import is already in progress for ${url}.`,
              success: false,
              importing: true,
            },
            { status: 409 }, // Conflict
          );
        }

        // Mark as active for the specific store
        await prisma.processingState.upsert({
          where: { key: `import_inventory_${url}` },
          update: { isActive: true, url: url },
          create: {
            key: `import_inventory_${url}`,
            isActive: true,
            url: url,
          },
        });

        // Parsing the stringify array
        const parsedInventoryData = JSON.parse(inventoryData);

        // Loop where updating the variant and quantities (Available)
        // for (const data of parsedInventoryData) {
        //   try {
        //     console.log("Get Data from server");

        //     // Update Product Title and Handle
        //     const updateProductResponse = await admin.graphql(
        //       `#graphql
        //     ${updateProductQuery}
        //   `,
        //       {
        //         variables: {
        //           input: {
        //             id: data.product.id,
        //             handle: data.product.handle,
        //             title: data.product.title,
        //           },
        //         },
        //       },
        //     );

        //     const updateProduct = await updateProductResponse.json();
        //     console.log("Product Title and Handle Updated");

        //     if (updateProduct.errors) {
        //       errors.push({
        //         message: "Error while updating products i.e Title, Handle",
        //       });
        //       continue; // Skip to next product
        //     }
        //     // Update Product variants

        //     const updateProductVariantsResponse = await admin.graphql(
        //       `#graphql
        //        ${updateProductVariantQuery}
        //       `,
        //       {
        //         variables: {
        //           productId: data.product.id,
        //           variants: [
        //             {
        //               id: data.product.variant.id,
        //               barcode: data.product.variant.barcode,
        //               inventoryItem: {
        //                 countryCodeOfOrigin: data.product.variant.COO,
        //                 harmonizedSystemCode: data.product.variant.hsCode,
        //                 sku: data.product.variant.inventoryItems.sku,
        //               },
        //             },
        //           ],
        //         },
        //       },
        //     );

        //     const variantUpdated = await updateProductVariantsResponse.json();

        //     if (variantUpdated.errors) {
        //       errors.push({
        //         message: "Error while updating variants",
        //       });
        //       continue; // Skip to next product
        //     }

        //     console.log("Product Variant Update Successfully");
        //     // Update Inventory Levels quantity

        //     const updateInventoryQuantitesResponse = await admin.graphql(
        //       `#graphql
        //       ${updateInventoryQuantitiesQuery}
        //       `,
        //       {
        //         variables: {
        //           input: {
        //             reason: "correction",
        //             name: "available",
        //             ignoreCompareQuantity: true,
        //             quantities: [
        //               {
        //                 inventoryItemId: data.id,
        //                 locationId: data.inventoryLevels.location.id,
        //                 quantity: data.inventoryLevels.quantities.available,
        //               },
        //             ],
        //           },
        //         },
        //       },
        //     );

        //     const inventoryQuantites =
        //       await updateInventoryQuantitesResponse.json();

        //     if (inventoryQuantites.errors) {
        //       errors.push({
        //         message: "Error while updating inventory quantities",
        //       });
        //       continue;
        //     }

        //     console.log("Inventory Quantity Updated Successfully");

        //     const locationId = data.inventoryLevels?.location?.id;

        //     // Add the location ID to the Set only if it exists
        //     if (locationId && !uniqueLocationIds.has(locationId)) {
        //       uniqueLocationIds.add(locationId); // This ensures no duplicates are added
        //     }
        //   } catch (error) {
        //     console.log("Error in the execution");
        //   }
        // }

        for (const data of parsedInventoryData) {
          try {
            console.log("Get Data from server");

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

            // if (updateProduct.errors || !updateProduct.data) {
            //   errors.push({
            //     message: "Error while updating product title or handle",
            //     details: updateProduct.errors || "No response data",
            //   });
            //   continue; // Skip to next product
            // }

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

            // if (variantUpdated.errors || !variantUpdated.data) {
            //   errors.push({
            //     message: "Error while updating product variants",
            //     details: variantUpdated.errors || "No response data",
            //   });
            //   continue; // Skip to next product
            // }

            const updateInventoryQuantitesResponse = await admin.graphql(
              `#graphql
              ${updateInventoryQuantitiesQuery}
              `,
              {
                variables: {
                  input: {
                    reason: "correction",
                    name: "available",
                    ignoreCompareQuantity: true,
                    quantities: [
                      {
                        inventoryItemId: data.id,
                        locationId: data.inventoryLevels.location.id,
                        quantity: data.inventoryLevels.quantities.available,
                      },
                    ],
                  },
                },
              },
            );

            const inventoryQuantites =
              await updateInventoryQuantitesResponse.json();

            // if (inventoryQuantites.errors || !inventoryQuantites.data) {
            //   errors.push({
            //     message: "Error while updating inventory quantities",
            //     details: `${data.product.handle}'s inventory quantity not updated!`,
            //   });
            //   continue;
            // }
            // inventoryQuantites.errors || "No response data"
            console.log("Inventory Quantity Updated Successfully");

            const locationId = data.inventoryLevels?.location?.id;

            if (locationId && !uniqueLocationIds.has(locationId)) {
              uniqueLocationIds.add(locationId);
            }
          } catch (error) {
            console.error("Error in the execution:");
            errors.push({
              message:
                error.message ===
                  "message: 'Variable $input of type InventorySetQuantitiesInput! was provided invalid value for quantities.0.quantity (Expected value to not be null)'" ||
                ("Unknown error occurred" &&
                  `${data.product.handle}'s inventory quantities not updated!`),
              // error,
            });
          }
        }

        // console.log("Error", errors);
        // Get the number of unique locations
        // const locationCount = uniqueLocationIds.size;

        // const importHTMLTemplate = render(
        //   <ImportEmailLayout
        //     length={parsedInventoryData.length}
        //     size={locationCount}
        //     errors={errors}
        //     missing={missingColumns}
        //   />,
        // );
        // Mark as inactive after completion
        await prisma.processingState.update({
          where: { key: `import_inventory_${url}` },
          data: { isActive: false },
        });

        const response = await admin.graphql(
          `#graphql
        ${getInventoryItemsQuery}`,
        );

        const result = await response.json();

        // const resolvedHTMLTemplate = await importHTMLTemplate;

        // const { data, error } = await resend.emails.send({
        //   from: `${name} <onboarding@resend.dev>`,
        //   to: ["arham.khan@mean3.com"],
        //   subject: "Importing CSV File Testing!",
        //   html: resolvedHTMLTemplate,
        // });

        // if (error) {
        //   console.log("Error while sending an email", error);
        //   return json({
        //     message: "Error while sending an email",
        //     _error: error,
        //   });
        // }

        // if (data) {
        //   console.log("Successfully email", data);
        // }

        return json(
          {
            message: "Sucessfully updated inventory!",
            success: true,
            data: result?.data?.inventoryItems?.edges,
          },
          { status: 201 },
        );
      } catch (error) {
        await prisma.processingState.update({
          where: { key: `import_inventory_${url}` },
          data: { isActive: false },
        });
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
  // GET-DATA-FROM-SERVER-HERE--------------
  const { data, locations, url, name, state } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const revalidator = useRevalidator();

  // STATE-HANDLING-START-START-HERE
  const [showTimeUser, setShowTimeUser] = useState(0);
  const [active, setActive] = useState(false);
  // STATE-HANDLING-START-END-HERE

  const {
    custom,
    setLocations,
    matchData,
    columnMissing,
    paginatedOrders,
    transformedData,
    selected,
    setImportBtn,
    setFetchData,
    handleModalChange,
    toggleImport,
    selectingForExport,
    setExportLoading,
    setImportLoading,
    setCustom,
    setMatchData,
  } = useContext(InventoryContext);

  const deselectedInventoryData = useMemo(() => {
    if (!data) return [];

    return data.map(({ node }) => {
      const {
        id,
        sku,
        countryCodeOfOrigin: COO,
        harmonizedSystemCode: hsCode,
        variant,
      } = node;
      const { product } = variant;

      // Optimize options mapping
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

      // Compute quantities for the selected location
      const quantities = selected
        ? node.inventoryLevels.edges.reduce((acc, { node: invNode }) => {
            if (invNode.location.id === selected) {
              invNode.quantities.forEach(({ name, quantity }) => {
                acc[name] = quantity;
              });
            }
            return acc;
          }, {})
        : {};

      return {
        id,
        sku,
        COO,
        hsCode,
        variant,
        quantities,
        inventoryLevels: {
          location: node.inventoryLevels.edges.map(
            ({ node: locNode }) => locNode.location.id,
          ),
        },
        options,
      };
    });
  }, [data, selected]);

  const filteredInventoryData = useMemo(() => {
    if (!selectingForExport || selectingForExport === "")
      return deselectedInventoryData; // If no location is selected, return all data

    // Filter by selected location ID
    return deselectedInventoryData
      .map((item) => ({
        ...item,
        inventoryLevels: {
          location: item.inventoryLevels.location.filter(
            (locationId) => locationId === selectingForExport,
          ),
        },
      }))
      .filter((item) => item.inventoryLevels.location.length > 0); // Remove items with no matching inventoryLevels
  }, [selectingForExport, data]);

  let inventoryData = filteredInventoryData;

  // console.log("Inventory Data", inventoryData);

  // Deselection Of Data

  // URL PARAMS
  // const [searchParams, setSearchParams] = useSearchParams();

  // console.log("Search Params", searchParams.get("type"));
  // Changes
  // Components Usage and Excel File Usage

  const deselectedLocationData = useMemo(
    () =>
      locations.map(({ node }) => ({
        id: node.id,
        name: node.name,
        address: node.address.formatted,
      })),
    [locations],
  );

  // Inventory Import Functionality
  const InventoryUpdateHandler = async () => {
    const formData = {
      actionKey: "InventoryUpdate",
      inventoryData: JSON.stringify(matchData),
      name: name,
      url: url,
      missing: JSON.stringify(columnMissing),
    };

    const timeNeeded = matchData.length * 1.6 * 1000; // Convert to milliseconds
    const timeForUser = matchData.length * 1.6;

    // Calculate time for user (seconds or minutes)
    let timeDisplay;
    if (timeForUser <= 60) {
      console.log(timeForUser, "sec");
      timeDisplay = `${timeForUser.toFixed(2)} sec`; // Show time in seconds if it's <= 60 seconds
    } else {
      console.log(timeForUser / 60, "min");
      timeDisplay = `${(timeForUser / 60).toFixed(2)} mins`; // Show time in minutes if it's > 60 seconds
    }

    setShowTimeUser(timeDisplay); // Set the display time upfront
    try {
      await fetcher.submit(formData, { method: "POST" });
      setImportBtn(false);
      setActive(true);
      // Use timeDisplay here rather than relying on showTimeUser
      setTimeout(() => {
        setActive(false); // Set active to true after the initial delay
        revalidator.revalidate();
        shopify.toast.show(`Updated Inventory in ${timeDisplay}...`); // Show the correct time for use
      }, timeNeeded); // `timeNeeded` is the delay before activating (in milliseconds)
    } catch (error) {
      console.log("Something Went Wrong!", error);
    }
  };

  const newCustom = useMemo(() => customdata(data), [data]);

  const stableTransformedData = useMemo(
    () => transformedData,
    [transformedData],
  );

  useEffect(() => {
    setLocations(deselectedLocationData);
  }, [deselectedLocationData]);

  useEffect(() => {
    if (isLoading) {
      shopify.toast.show("Importing...");
    }
  }, [isLoading]);

  useEffect(() => {
    setFetchData(data);
    setCustom(newCustom);
  }, [data, newCustom]);

  useEffect(() => {
    if (fetcher.data?.success) {
      // console.log("New Data", data);
      setFetchData(data);
      console.log("Data with updating");
      // console.log("fetcher json 2", fetcher.data);
      // shopify.toast.show("Data Updated Sucessfully");
    }
  }, [fetcher.data?.success]);

  const matched = getDataFromCSVFile(stableTransformedData, custom);

  useEffect(() => {
    // console.log("Match Data", matched);
    setMatchData(matched);
  }, [matched.length > 0]);


  console.log("Current Importing State", state);1 
  
  return (
    <div className="h-screen">
      <h1 className="mx-4 my-2">Multi-Store-Inventory App</h1>
      <div className="mx-4 h-[500px] bg-white border-[1px] border-gray-300 rounded-lg px-2 py-8 lg:py-6 shadow-lg cursor-pointer">
        <div className="h-full flex justify-center items-center gap-4">
          <div className="space-y-8 lg:space-y-6 flex flex-col justify-center items-center">
            <img
              src={FeatureImage}
              alt="Feature-Image"
              className="w-40 h-40 md:w-60 md:h-60 rounded-full object-cover"
            />
            <h1 className="w-full text-center text-lg md:text-xl font-bold">
              Welcome to Multi-Store-Inventory-App
            </h1>
            <p className="text-sm text-center w-[80%] md:w-[90%]">
              Manage your inventory items on multiple locations easily with the
              features of real times changes and with importing relevant CSV
              files. Thank you.
            </p>
            <div className="space-x-6">
              <Button
                size="large"
                variant="secondary"
                onClick={() => {
                  // setSearchParams({ type: "Export" });
                  // const thereIsExportType =
                  //   searchParams.get("type") === "Export";
                  // if (!thereIsExportType) {
                  //   setExportLoading(true);
                  //   setTimeout(() => {
                  //     setExportLoading(false);
                  //   }, 4000);
                  // }

                  handleModalChange();
                }}
              >
                <div className="flex gap-2 items-center px-2 py-1">
                  <Icon source={ExportIcon} tone="base" />
                  <p>Export</p>
                </div>
              </Button>
              <Button
                size="large"
                variant="primary"
                onClick={() => {
                  // setSearchParams({ type: "Import" });
                  // const thereIsImportType =
                  //   searchParams.get("type") === "Import";
                  // if (!thereIsImportType) {
                  //   setImportLoading(true);
                  //   setTimeout(() => {
                  //     setImportLoading(false);
                  //   }, 4000);
                  // }
                  toggleImport();
                }}
              >
                <div className="flex gap-2 items-center px-2 py-1">
                  <Icon source={ImportIcon} tone="base" />
                  <p>Import</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <ExportModal
          locations={deselectedLocationData}
          // currentPageData={paginatedOrders}
          value={data}
        />
        <ImportModal
          state={state}
          active={active}
          InventoryUpdate={InventoryUpdateHandler}
          timeShown={showTimeUser}
        />
      </div>
    </div>
  );
}
