import { Modal, LegacyStack, Frame } from "@shopify/polaris";

function ScreenModal({ open, modalType, onClose }) {
  return (
    <div style={{ height: "500px" }}>
      <Frame>
        <Modal
          open={open}
          onClose={onClose}
          title={
            modalType === "import"
              ? "Import inventory by CSV"
              : "Export inventory to CSV"
          }
          primaryAction={{
            content: modalType === "import" ? "Import" : "Export",
            onAction: onClose,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: onClose,
            },
          ]}
        >
          <Modal.Section>
            <p>
              {modalType === "import"
                ? "Upload a CSV file to import inventory."
                : "Download a CSV file of your inventory."}
            </p>
          </Modal.Section>
        </Modal>
      </Frame>
    </div>
  );
}

export default ScreenModal;