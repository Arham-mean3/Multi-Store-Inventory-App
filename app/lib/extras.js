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

// const fetcher = useFetcher();
// const shopify = useAppBridge();
// const isLoading =
//   ["loading", "submitting"].includes(fetcher.state) &&
//   fetcher.formMethod === "POST";
// const productId = fetcher.data?.product?.id.replace(
//   "gid://shopify/Product/",
//   "",
// );

// useEffect(() => {
//   if (productId) {
//     shopify.toast.show("Product created");
//   }
// }, [productId, shopify]);
// const generateProduct = () => fetcher.submit({}, { method: "POST" });

export const customdata = (data) => {
  return data
    .filter(({ node }) => node.variant.product.hasOutOfStockVariants)
    .map(({ node }) => ({
      id: node.id,
      sku: node.sku,
      COO: node.countryCodeOfOrigin,
      hsCode: node.harmonizedSystemCode,
      product: node.variant.product,
      variant: node.variant,
      inventoryLevels: {
        location: node.inventoryLevels.edges.map(
          ({ node }) => node.location,
        ),
        quantities: node.inventoryLevels.edges.map(
          ({ node }) => node.quantities,
        ),
      },
    }));
};
