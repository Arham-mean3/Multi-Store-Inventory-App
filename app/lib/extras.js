import Inventory from "../components/Inventory";

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

export const newInventoryStructureData = (data) => {
  return data.map(({ node }) => ({
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
  }));
};

// New Array Structure for All Variants Export

export const exportDataForMultipleLocationQuantites = (data) => {
  return data.map(({ node }) => ({
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
  }));
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
      };
    }
  });

  return data;
};
