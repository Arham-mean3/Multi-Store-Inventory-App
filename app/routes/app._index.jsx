import { authenticate } from "../shopify.server";
import Heading from "../components/Heading";
import Inventory from "../components/Inventory";
import ExportModal from "../components/ExportModal";
import ImportModal from "../components/ImportModal";
import {
  getAllLocations,
  getInventoryItemsQuery,
  getStoreUrl,
  updateInventoryQuantitiesQuery,
  updateProductQuery,
  updateProductVariantQuery,
} from "../lib/queries";
import {
  json,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import { customdata } from "../lib/extras";
import prisma from "../db.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Resend } from "resend";
import { render } from "@react-email/components";
import ImportEmailLayout from "../email/Import-Email-Layout";
import { Button } from "@shopify/polaris";
import Alert from "../components/Alert";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const storeUrlResponse = await admin.graphql(`
    #graphql
    ${getStoreUrl}`);

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
    state: processingState?.isActive || false,
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
        const locationCount = uniqueLocationIds.size;

        const importHTMLTemplate = render(
          <ImportEmailLayout
            length={parsedInventoryData.length}
            size={locationCount}
            errors={errors}
            missing={missingColumns}
          />,
        );
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

        const resolvedHTMLTemplate = await importHTMLTemplate;

        const { data, error } = await resend.emails.send({
          from: `${name} <onboarding@resend.dev>`,
          to: ["arham.khan@mean3.com"],
          subject: "Importing CSV File Testing!",
          html: resolvedHTMLTemplate,
        });

        if (error) {
          console.log("Error while sending an email", error);
          return json({
            message: "Error while sending an email",
            _error: error,
          });
        }

        if (data) {
          console.log("Successfully email", data);
        }

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

export default function Index() {
  // GET-DATA-FROM-SERVER-HERE--------------
  const { data, locations, url, name } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const revalidator = useRevalidator();

  // STATE-HANDLING-START-START-HERE
  const [fetchData, setFetchData] = useState(data);
  // const [currentPage, setCurrentPage] = useState(0);
  const [custom, setCustom] = useState([]);
  const [showTimeUser, setShowTimeUser] = useState(0);
  const [active, setActive] = useState(false);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  // STATE-HANDLING-START-END-HERE
  const {
    transformedData,
    setLocations,
    matchData,
    columnMissing,
    setMatchData,
    setImportBtn,
    setChangesArray,
    changesArray,
    selected,
    setSelected,
  } = useContext(InventoryContext);
  // Deselection Of Data
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

  // const deselectedInventoryData = useMemo(
  //   () =>
  //     fetchData.map(({ node }) => {
  //       const {
  //         id,
  //         sku,
  //         countryCodeOfOrigin: COO,
  //         harmonizedSystemCode: hsCode,
  //         variant,
  //       } = node;
  //       const { product } = variant;

  //       // Find matching options based on the variant title
  //       const options = product.options.flatMap((option) => {
  //         // Check if the option.values array has more than one value
  //         if (option.values.length > 1) {
  //           // Filter and map matched values
  //           const matchedValues = option.values
  //             .filter((value) => value === variant.title)
  //             .map((value) => ({
  //               name: option.name,
  //               value,
  //             }));

  //           // Return matched options if any
  //           if (matchedValues.length > 0) {
  //             return matchedValues;
  //           }
  //         }

  //         // Fallback: Return the original option with its values
  //         return {
  //           name: option.name,
  //           values: option.values, // Include all values for options with a single value or no match
  //         };
  //       });

  //       // Compute quantities for the selected location
  //       const quantities = node.inventoryLevels.edges.reduce(
  //         (acc, { node }) => {
  //           if (selected && node.location.id === selected) {
  //             node.quantities.forEach(({ name, quantity }) => {
  //               acc[name] = quantity;
  //             });
  //           }
  //           return acc;
  //         },
  //         {},
  //       );

  //       return {
  //         id,
  //         sku,
  //         COO,
  //         hsCode,
  //         variant,
  //         quantities,
  //         inventoryLevels: {
  //           location: node.inventoryLevels.edges.map(
  //             ({ node }) => node.location.id,
  //           ),
  //         },
  //         options, // Add matchOptions to the result
  //       };
  //     }),
  //   [fetchData, selected],
  // );

  const deselectedInventoryData = useMemo(() => {
    if (!fetchData) return [];

    return fetchData.map(({ node }) => {
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
  }, [fetchData, selected]);

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

  let inventoryData = filteredInventoryData;

  let matchedData = transformedData
    .map((parsedItem) => {
      // Find a matching record in customdata
      const matchingItem = custom.find((customItem) => {
        // Match SKU, variant title, product title, or other relevant fields
        const isMatch =
          customItem.variant.title === parsedItem.variant.title &&
          customItem.variant.product.title === parsedItem.variant.product.title;

        // Check if the location matches any in inventoryLevels
        const locationMatch = customItem.inventoryLevels.location.some(
          (loc) => loc.name === parsedItem.location,
        );

        return isMatch && locationMatch;
      });

      // console.log("Matched Items", matchingItem);

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
            quantities: parsedItem.quantities, // Quantities from customdata
          },
        };
      }

      // Optionally, handle unmatched cases
      return null;
    })
    .filter((item) => item !== null); // Filter out unmatched records

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
      console.log("API-CALL", formData);
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

  // Inventory Row Available Update Functionality

  const InventoryRowUpdate = async () => {
    const formData = {
      actionKey: "RowUpdates",
      data: JSON.stringify(changesArray),
    };
    try {
      await fetcher.submit(formData, { method: "POST" });
      setChangesArray([]);
    } catch (error) {
      console.log("Something went wrong! --client");
    }
  };

  useEffect(() => {
    const custom = customdata(data);
    setCustom(custom);
  }, []);

  useEffect(() => {
    setLocations(deselectedLocationData);
  }, [deselectedLocationData]);

  useEffect(() => {
    console.log("Matched Data", matchedData);
    setMatchData(matchedData);
  }, [matchedData.length > 0]);

  useEffect(() => {
    if (isLoading) {
      shopify.toast.show("Importing...");
    }
  }, [isLoading]);

  useEffect(() => {
    setFetchData(data);
  }, [data]);

  useEffect(() => {
    if (fetcher.data?.success) {
      // console.log("New Data", data);
      setFetchData(data);
      // console.log("fetcher json 2", fetcher.data);
      // shopify.toast.show("Data Updated Sucessfully");
    }
  }, [fetcher.data?.success]);

  return (
    <div className="mx-4 lg:mx-10">
      {changesArray.length > 0 && (
        <Alert InventoryRowUpdate={InventoryRowUpdate} />
      )}
      <Heading
        location={deselectedLocationData}
        selection={setSelected}
        selectedLocation={selected}
      />
      <Inventory data={inventoryData} setPaginatedOrders={setPaginatedOrders} />
      <div>
        <ExportModal
          locations={deselectedLocationData}
          currentPageData={paginatedOrders}
          value={data}
        />
        <ImportModal
          active={active}
          InventoryUpdate={InventoryUpdateHandler}
          timeShown={showTimeUser}
        />
      </div>
    </div>
  );
}
