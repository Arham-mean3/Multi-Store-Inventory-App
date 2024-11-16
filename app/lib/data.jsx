import { Badge, Text } from "@shopify/polaris";

export const orders = [
  {
    id: "1020",
    order: (
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        #1020
      </Text>
    ),
    date: "Jul 20 at 4:34pm",
    customer: "Jaydon Stanton",
    total: "$969.44",
    paymentStatus: <Badge progress="complete">Paid</Badge>,
    fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  },
  {
    id: "1019",
    order: (
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        #1019
      </Text>
    ),
    date: "Jul 20 at 3:46pm",
    customer: "Ruben Westerfelt",
    total: "$701.19",
    paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
    fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  },
  {
    id: "1018",
    order: (
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        #1018
      </Text>
    ),
    date: "Jul 20 at 3.44pm",
    customer: "Leo Carder",
    total: "$798.24",
    paymentStatus: <Badge progress="complete">Paid</Badge>,
    fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  },
];
