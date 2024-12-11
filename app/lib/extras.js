export const resourceName = {
  singular: "order",
  plural: "orders",
};

export const sortOptions = [
  { label: "Order", value: "order asc", directionLabel: "Ascending" },
  { label: "Order", value: "order desc", directionLabel: "Descending" },
  { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
  { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
  { label: "Date", value: "date asc", directionLabel: "A-Z" },
  { label: "Date", value: "date desc", directionLabel: "Z-A" },
  { label: "Total", value: "total asc", directionLabel: "Ascending" },
  { label: "Total", value: "total desc", directionLabel: "Descending" },
];

export const heading = [
  { title: "Product" },
  { title: "SKU" },
  { title: "Barcode" },
  { title: "Unavailable" },
  { title: "Committed" },
  { title: "Available" },
  { title: "On hand" },
];

export const customdataAdditional = (data) => {
  return data.map((value) => ({
    id: value.id,
    sku: value.sku,
    COO: value.countryCodeOfOrigin,
    hsCode: value.harmonizedSystemCode,
    product: value.variant.product,
    variant: value.variant,
    inventoryLevels: value.inventoryLevel,
  }));
};

// // New Array Structure for All Variants Export

// export const exportDataForMultipleLocationQuantites = (data) => {
//   return data.map(({ node }) => {
//     const { variant } = node;
//     const { product } = variant;

//     // Generate matchingOptions
//     const options = product.options.map((option) => {
//       // Check if the option.values array has more than one value
//       if (option.values.length > 1) {
//         // Filter and map matched values
//         const matchedValues = option.values
//           .filter((value) => value === variant.title)
//           .map((value) => ({
//             name: option.name,
//             values: value,
//           }));

//         // Return matched options if any
//         if (matchedValues.length > 0) {
//           return matchedValues;
//         }
//       }

//       // Fallback: Return the original option with its values
//       return {
//         name: option.name,
//         values: option.values[0],
//       };
//     });

//     const flattenedOptions = options.flat();
//     return {
//       id: node.id,
//       sku: node.sku,
//       COO: node.countryCodeOfOrigin,
//       hsCode: node.harmonizedSystemCode,
//       product: node.variant.product,
//       variant: node.variant,
//       inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
//         id: node.location.id,
//         name: node.location.name,
//         quantities: node.quantities.reduce((acc, { name, quantity }) => {
//           acc[name] = quantity;
//           return acc;
//         }, {}),
//       })),
//       options: flattenedOptions,
//     };
//   });
// };

// export const newInventoryStructureData = (data) => {
//   return data.map(({ node }) => {
//     const { variant } = node;
//     const { product } = variant;

//     // Generate matchingOptions
//     const options = product.options.map((option) => {
//       // Check if the option.values array has more than one value
//       if (option.values.length > 1) {
//         // Filter and map matched values
//         const matchedValues = option.values
//           .filter((value) => value === variant.title)
//           .map((value) => ({
//             name: option.name,
//             values: value,
//           }));

//         // Return matched options if any
//         if (matchedValues.length > 0) {
//           return matchedValues;
//         }
//       }

//       // Fallback: Return the original option with its values
//       return {
//         name: option.name,
//         values: option.values[0],
//       };
//     });

//     // Flatten the matchingOptions if it has arrays inside
//     const flattenedOptions = options.flat();

//     return {
//       id: node.id,
//       sku: node.sku,
//       COO: node.countryCodeOfOrigin,
//       hsCode: node.harmonizedSystemCode,
//       product: node.variant.product,
//       variant: node.variant,
//       inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
//         id: node.location.id,
//         name: node.location.name,
//         quantities: node.quantities.reduce((acc, { name, quantity }) => {
//           acc[name] = quantity;
//           return acc;
//         }, {}),
//       })),
//       options: flattenedOptions,
//     };
//   });
// };
// // New Array Structure for Current Page Export
// export const currentPageSpecificItemsExport = (currentItems, custom) => {
//   let data = currentItems.map((items) => {
//     const matchingItem = custom.find((customItem) => {
//       // Match SKU, variant title, product title, or other relevant fields
//       const isMatch =
//         customItem.variant.title === items.variant.title &&
//         customItem.variant.product.title === items.variant.product.title;

//       return isMatch;
//     });

//     // Return a transformed object or the original item
//     if (matchingItem) {
//       return {
//         id: matchingItem.id, // Add matching data or set to null if not found
//         COO: matchingItem.COO,
//         hsCode: matchingItem.hsCode,
//         variant: matchingItem.variant,
//         inventoryLevels: matchingItem.inventoryLevels,
//         options: matchingItem.options,
//       };
//     }
//   });

//   return data;
// };

export const customdata = (data) => {
  return data.map(({ node }) => ({
    id: node.id,
    sku: node.sku,
    COO: node.countryCodeOfOrigin,
    hsCode: node.harmonizedSystemCode,
    product: node.variant.product,
    variant: node.variant,
    inventoryLevels: {
      location: node.inventoryLevels.edges.map(({ node }) => node.location),
      quantities: node.inventoryLevels.edges.map(({ node }) => node.quantities),
    },
  }));
};

// New Array Structure for All Variants Export

export const exportDataForMultipleLocationQuantites = (data) => {
  return data.map(({ node }) => {
    const { variant } = node;
    const { product } = variant;

    // Generate matchingOptions
    const options = product.options.map((option) => {
      // Check if the option.values array has more than one value
      if (option.values.length > 1) {
        // Filter and map matched values
        const matchedValues = option.values
          .filter((value) => value === variant.title)
          .map((value) => ({
            name: option.name,
            values: value,
          }));

        // Return matched options if any
        if (matchedValues.length > 0) {
          return matchedValues;
        }
      }

      // Fallback: Return the original option with its values
      return {
        name: option.name,
        values: option.values[0],
      };
    });

    const flattenedOptions = options.flat();
    return {
      id: node.id,
      sku: node.sku,
      COO: node.countryCodeOfOrigin,
      hsCode: node.harmonizedSystemCode,
      product: node.variant.product,
      variant: node.variant,
      inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
        id: node.location.id,
        name: node.location.name,
        quantities: node.quantities.reduce((acc, { name, quantity }) => {
          acc[name] = quantity;
          return acc;
        }, {}),
      })),
      options: flattenedOptions,
    };
  });
};

export const newInventoryStructureData = (data) => {
  return data.map(({ node }) => {
    const { variant } = node;
    const { product } = variant;

    // Generate matchingOptions
    const options = product.options.map((option) => {
      // Check if the option.values array has more than one value
      if (option.values.length > 1) {
        // Filter and map matched values
        const matchedValues = option.values
          .filter((value) => value === variant.title)
          .map((value) => ({
            name: option.name,
            values: value,
          }));

        // Return matched options if any
        if (matchedValues.length > 0) {
          return matchedValues;
        }
      }

      // Fallback: Return the original option with its values
      return {
        name: option.name,
        values: option.values[0],
      };
    });

    // Flatten the matchingOptions if it has arrays inside
    const flattenedOptions = options.flat();

    return {
      id: node.id,
      sku: node.sku,
      COO: node.countryCodeOfOrigin,
      hsCode: node.harmonizedSystemCode,
      product: node.variant.product,
      variant: node.variant,
      inventoryLevels: node.inventoryLevels.edges.map(({ node }) => ({
        id: node.location.id,
        name: node.location.name,
        quantities: node.quantities.reduce((acc, { name, quantity }) => {
          acc[name] = quantity;
          return acc;
        }, {}),
      })),
      options: flattenedOptions,
    };
  });
};
// New Array Structure for Current Page Export
export const currentPageSpecificItemsExport = (currentItems, custom) => {
  let data = currentItems.map((items) => {
    const matchingItem = custom.find((customItem) => {
      // Match SKU, variant title, product title, or other relevant fields
      const isMatch =
        customItem.variant.title === items.variant.title &&
        customItem.variant.product.title === items.variant.product.title;

      return isMatch;
    });

    // Return a transformed object or the original item
    if (matchingItem) {
      return {
        id: matchingItem.id, // Add matching data or set to null if not found
        COO: matchingItem.COO,
        hsCode: matchingItem.hsCode,
        variant: matchingItem.variant,
        inventoryLevels: matchingItem.inventoryLevels,
        options: matchingItem.options,
      };
    }
  });

  return data;
};

// const handleImport = () => {
//   if (file.length > 0) {
//     const acceptedFiles = file[0];
//     Papa.parse(acceptedFiles, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         console.log("Parsed Data:", results.data);
//         setParsedData(results.data); // Save parsed data to context/state

//   // Validate columns
//   const parsedColumns = results.meta.fields; // Extract parsed column names
//   // console.log("Parsed Columns", parsedColumns);
//   const missingColumns = compulsoryColumns.filter(
//     (column) => !parsedColumns.includes(column),
//   );

//   if (missingColumns.length > 0) {
//     console.error("Missing Columns:", missingColumns);
//     setColumnMissing((col) => {
//       const uniqueMissing = [...new Set([...col, ...missingColumns])]; // Combine and deduplicate
//       return uniqueMissing;
//     });
//   } else {
//     setColumnMissing([]); // Clear missing column state if none are missing
//   }
// },
//       error: (error) => {
//         console.error("Error parsing CSV:", error);
//       },
//     });
//   }
// };

// const handleImport = () => {
//   if (file.length > 0) {
//     setLoading(true); // Start loading immediately
//     const acceptedFiles = file[0];
//     Papa.parse(acceptedFiles, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         console.log("Parsed Data:", results.data);
//         setParsedData(results.data); // Save parsed data to context/state

//         // Validate columns
//         const parsedColumns = results.meta.fields; // Extract parsed column names
//         // console.log("Parsed Columns", parsedColumns);
//         const missingColumns = compulsoryColumns.filter(
//           (column) => !parsedColumns.includes(column),
//         );

//         if (missingColumns.length > 0) {
//           console.error("Missing Columns:", missingColumns);
//           setColumnMissing((col) => {
//             const uniqueMissing = [...new Set([...col, ...missingColumns])]; // Combine and deduplicate
//             return uniqueMissing;
//           });
//         } else {
//           setColumnMissing([]); // Clear missing column state if none are missing
//         }

//         // Stop loading after a delay
//         setTimeout(() => {
//           setLoading(false);
//         }, 1000); // Ensure loading animation completes
//       },
//       error: (error) => {
//         console.error("Error parsing CSV:", error);
//         setLoading(false); // Stop loading immediately on error
//       },
//     });
//   }
// };

export const normalizeQuantities = (quantities) => {
  return quantities.reduce(
    (acc, item) => {
      acc[item.name] = item.quantity;
      return acc;
    },
    {}, // Default values
  );
};

export const getDataFromCSVFile = (transformedData, custom) => {
  return transformedData
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
    .filter((item) => item !== null); // Filter out unmatched record
};
