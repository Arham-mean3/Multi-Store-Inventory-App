import {
  Banner,
  DropZone,
  LegacyStack,
  Modal,
  Spinner,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import React, { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";
import { NoteIcon } from "@shopify/polaris-icons";

const ImportModal = React.memo(
  ({ state, active, InventoryUpdate, timeShown }) => {
    const {
      file,
      matchData,
      importBtn,
      columnMissing,
      loading,
      importLoading,
      handleImport,
      toggleImport,
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
              {file.name}
              <Text variant="bodySm" as="p">
                {file.size} bytes
              </Text>
            </div>
          </LegacyStack>
        ))}
      </LegacyStack>
    );

    const text =
      !loading && matchData.length === 0 ? "Import Inventory" : "Start Import";
    const actionFunc =
      !loading && matchData.length === 0 ? handleImport : InventoryUpdate;

    const isMissingRequiredColumns =
      columnMissing.length > 0 &&
      columnMissing.includes("title") &&
      columnMissing.includes("handle");

    // console.log("Import Modal Component Re-Renders");
    // console.log("State", state, "Loading", loading);
    return (
      <div className="">
        <Modal
          open={importBtn}
          onClose={toggleImport}
          title="Import inventory by CSV"
          primaryAction={{
            content: text,
            onAction: actionFunc,
            disabled: file.length === 0 || isMissingRequiredColumns, // Disable if no file or missing required columns
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
            {/* {importLoading ? (
            <div className="w-full h-40 flex justify-center items-center">
              <div className="flex flex-col gap-4 items-center justify-center">
                <Spinner size="large" />
                <p>Loading data...</p>
              </div>
            </div>
          ) : ( */}
            <LegacyStack vertical>
              <div>
                <div className="mb-4 bg-yellow-300 p-4 rounded-lg">
                  <h2 className="text-sm font-medium">
                    <span className="font-bold">Important Note: </span>Only 250
                    items can be imported right now.
                  </h2>
                </div>
                <h3>
                  {state || active ? (
                    <strong>
                      You can't upload the file unless previous import is
                      completed.
                    </strong>
                  ) : (
                    <span>
                      This CSV file updates your{" "}
                      <strong>
                        Handle, Title, Barcode, HS Code, COO, Available
                      </strong>{" "}
                      inventory quantities.
                    </span>
                  )}
                </h3>
              </div>

              {!state && !active && (
                <div className="flex flex-col gap-4">
                  {!loading && columnMissing.length > 0 && (
                    <Banner title="Missing Compulsory Columns" tone="critical">
                      <p className="mt-2">
                        The following columns are missing from your CSV:
                      </p>
                      <div className="flex gap-4 items-center">
                        {columnMissing.map((missing, index) => (
                          <ol key={index} className="font-bold text-lg my-2">
                            <li>{missing}</li>
                          </ol>
                        ))}
                      </div>
                    </Banner>
                  )}

                  <DropZone
                    accept=".csv"
                    errorOverlayText="File type must be .csv"
                    type="file"
                    onDrop={handleDropZoneDrop}
                    variableHeight
                    allowMultiple={false}
                  >
                    {fileUpload}
                    {uploadedFiles}
                  </DropZone>
                </div>
              )}
            </LegacyStack>
            {/* )} */}
          </Modal.Section>
        </Modal>
      </div>
    );
  },
);

ImportModal.displayName = "ImportModal";
export default ImportModal;
