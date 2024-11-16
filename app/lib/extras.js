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
  { title: "Order" },
  { title: "Date" },
  { title: "Customer" },
  { title: "Total", alignment: "end" },
  { title: "Payment status" },
  { title: "Fulfillment status" },
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