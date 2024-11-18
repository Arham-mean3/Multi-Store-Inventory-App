import {
  Checkbox,
  DropZone,
  Frame,
  LegacyStack,
  Modal,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import { NoteIcon } from "@shopify/polaris-icons";
export default function ImportModal() {
  const {
    file,
    checked,
    importBtn,
    toggleImport,
    handleCheckbox,
    handleDropZoneDrop,
  } = useContext(InventoryContext);

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

  return (
    <div style={{ height: "300px" }}>
      {/* <Frame> */}
        <Modal
          size="small"
          open={importBtn}
          onClose={toggleImport}
          title="Import inventory by CSV"
          primaryAction={{
            content: "Import Inventory",
            onAction: toggleImport,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: toggleImport,
            },
          ]}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <div className="">
                <h3>
                  This CSV file updates your Available or On hand inventory
                  quantities.
                </h3>
              </div>

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
            </LegacyStack>
          </Modal.Section>
        </Modal>
      {/* </Frame> */}
    </div>
  );
}
