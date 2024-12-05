import { Button, ContextualSaveBar, Frame } from "@shopify/polaris";
import React, { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";

export default function Alert({ InventoryRowUpdate }) {
  const { setChangesArray } = useContext(InventoryContext);
  return (
    <div className="sticky top-0 right-0 left-0 z-50 transition-all ease-in-out border-b-[1px] border-gray-400">
      <div className="bg-[#F9F9F9] px-2 py-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-black font-semibold">Save Changes</p>
          <div className="flex gap-4">
            <Button variant="tertiary" onClick={() => setChangesArray([])}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={InventoryRowUpdate}>
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
