import { Button } from "@shopify/polaris";
import React from "react";

function Heading({ openModal }) {
  return (
    <div className="flex justify-between items-center my-4">
      <div>
        <h1 className="text-2xl font-bold">Multi-Store-Inventory-App</h1>
      </div>
      <div className="flex gap-4 items-center">
        <Button
          variant="secondary"
          onClick={() => {
            openModal("export");
          }}
        >
          Export
        </Button>
        <Button
          variant="primary"
          // onClick={() => openModal("import")} // Pass "import" type
        >
          Import
        </Button>
      </div>
    </div>
  );
}

export default Heading;
