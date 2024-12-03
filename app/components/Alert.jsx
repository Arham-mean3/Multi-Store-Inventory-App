import { Button, ContextualSaveBar, Frame } from "@shopify/polaris";
import React, { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";

export default function Alert({ InventoryRowUpdate }) {
  const { setChangesArray } = useContext(InventoryContext);
  return (
    <div className="sticky top-0 right-0 left-0 z-50 mx-4">
      <div className="bg-slate-800 p-3 text-white rounded-xl">
        <div className="flex justify-between items-center">
          <p>Save Changes</p>
          <div className="flex gap-4">
            <Button
              variant="primary"
              tone="critical"
              onClick={() => setChangesArray([])}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              tone="success"
              onClick={InventoryRowUpdate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
    // <div style={{ height: "50px" }}>
    //   <Frame
    //     logo={{
    //       width: 86,
    //       contextualSaveBarSource:
    //         "https://cdn.shopify.com/s/files/1/2376/3301/files/Shopify_Secondary_Inverted.png",
    //     }}
    //   >
    //     <ContextualSaveBar
    //       message="Unsaved changes"
    //       saveAction={{
    //         onAction: () => console.log("add form submit logic"),
    //         loading: false,
    //         disabled: false,
    //       }}
    //       discardAction={{
    //         onAction: () => console.log("add clear form logic"),
    //       }}
    //     />
    //   </Frame>
    // </div>
  );
}
