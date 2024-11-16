// import { Fragment, useEffect } from "react";
import { json } from "@remix-run/node";
// import { useFetcher } from "@remix-run/react";
// import { Button } from "@shopify/polaris";
// import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
// import { authenticate } from "../shopify.server";
import Heading from "../components/Heading";
import Inventory from "../components/Inventory";
import { useCallback, useState } from "react";
import ScreenModal from "../components/Modal";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);

//   return json({});
// };

export default function Index() {
  // STATE-HANDLING-START-START-HERE
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // To track "Export" or "Import"
  // STATE-HANDLING-START-END-HERE

  const openModal = useCallback((type) => {
    setModalType(type);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setModalType(null);
  }, []);

  return (
    <div className="mx-10">
      <Heading openModal={openModal} />
      <Inventory />
      <ScreenModal open={open} modalType={modalType} openModal={openModal} onClose={closeModal} />
    </div>
  );
}

