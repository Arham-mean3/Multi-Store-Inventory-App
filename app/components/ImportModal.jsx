import {
  Checkbox,
  DropZone,
  LegacyStack,
  Modal,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import React, { useContext, useEffect, useState } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import { NoteIcon } from "@shopify/polaris-icons";

const ImportModal = React.memo(({ active, InventoryUpdate, timeShown }) => {
  const {
    file,
    checked,
    matchData,
    importBtn,
    handleImport,
    toggleImport,
    handleCheckbox,
    handleDropZoneDrop,
  } = useContext(InventoryContext);

  const [loading, setLoading] = useState(false);

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const fileUpload = !file.length && (
    <DropZone.FileUpload actionHint="Accepts .csv" />
  );

  const uploadedFiles = file.length > 0 && (
    <LegacyStack vertical>
      {file.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
          />
          <div>
            {file.name}{" "}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const text = matchData.length === 0 ? "Import Inventory" : "Update Inventory";
  const actionFunc = matchData.length === 0 ? handleImport : InventoryUpdate;

  useEffect(() => {
    if (matchData.length > 0) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000); // 1-second delay

      return () => clearTimeout(timeout); // Clean up the timeout
    }
  }, [matchData.length > 0]);

  return (
    <div className="w-10 h-32 lg:h-80">
      {/* <Frame> */}
      <Modal
        size="small"
        open={importBtn}
        onClose={toggleImport}
        title="Import inventory by CSV"
        primaryAction={{
          content: text,
          onAction: actionFunc,
          disabled: file.length === 0,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleImport,
          },
        ]}
        loading={loading}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <div className="">
              <h3>
                {active ? (
                  <strong>
                    You can't upload the file unless previous import is
                    completed. It will take {timeShown}.
                  </strong>
                ) : (
                  "This CSV file updates your Available or On hand inventory quantities."
                )}
              </h3>
            </div>

            {!active && (
              <>
                <DropZone
                  accept=".csv"
                  errorOverlayText="File type must be .csv"
                  type="file"
                  onDrop={handleDropZoneDrop}
                  variableHeight
                >
                  {fileUpload}
                  {uploadedFiles}
                </DropZone>
                <Checkbox
                  checked={checked}
                  label="Overwrite existing inventory"
                  onChange={handleCheckbox}
                />
              </>
            )}
          </LegacyStack>
        </Modal.Section>
      </Modal>
      {/* </Frame> */}
    </div>
  );
});
// Add displayName to the wrapped component
ImportModal.displayName = "ImportModal";
export default ImportModal;
