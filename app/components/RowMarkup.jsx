import {
  ActionList,
  Button,
  IndexTable,
  Popover,
  Text,
} from "@shopify/polaris";
import { useCallback, useState } from "react";

export const RowMarkup = ({ selectedResources }) => {
  const [popoverActive, setPopoverActive] = useState(true);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      More actions
    </Button>
  );

  const inventoryItems = [
    {
      id: "1",
      productName: "Short Sleeve T-shirts",
      variant: "variant1",
      sku: "No SKU",
      quantity: 0,
      price: 50,
      committed: (
        <Popover
          active={popoverActive}
          activator={activator}
          autofocusTarget="first-node"
          onClose={togglePopoverActive}
        >
          <ActionList
            actionRole="menuitem"
            items={[{ content: "Import" }, { content: "Export" }]}
          />
        </Popover>
      ),
    },
    {
      id: "2",
      productName: "Short Sleeve T-shirts",
      variant: "variant1",
      sku: "No SKU",
      quantity: 0,
      price: 49,
    },
  ];

  return inventoryItems.map(
    ({ id, productName, sku, committed, price }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {productName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{sku === 0 ? "No SKU" : sku}</IndexTable.Cell>
        <IndexTable.Cell>null</IndexTable.Cell>
        <IndexTable.Cell>{committed}</IndexTable.Cell>
        <IndexTable.Cell>null</IndexTable.Cell>
        <IndexTable.Cell>null</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );
};
