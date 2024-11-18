import {
  Modal,
  LegacyStack,
  ChoiceList,
} from "@shopify/polaris";
import { useContext } from "react";
import { InventoryContext } from "../context/Inventory-Context";

export default function ExportModal() {
  const CURRENT_PAGE = "current_page";
  const ALL_VARIANTS = "all_variants";
  const SELECTED_CUSTOMERS = "selected_customers";
  const CSV_EXCEL = "csv_excel";
  const CSV_PLAIN = "csv_plain";

  const {
    active,
    handleClose,
    handleSelectedExport,
    handleSelectedExportAs,
    selectedExport,
    selectedExportAs,
    
  } = useContext(InventoryContext);

  return (
    <div>
      {/* <Frame> */}
        <Modal
          open={active}
          onClose={handleClose}
          title="Export customers"
          primaryAction={{
            content: "Export customers",
            onAction: handleClose,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleClose,
            },
          ]}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                <ChoiceList
                  title="Export"
                  choices={[
                    { label: "Current page", value: CURRENT_PAGE },
                    { label: "All variants", value: ALL_VARIANTS },
                    { label: "Selected customers", value: SELECTED_CUSTOMERS },
                  ]}
                  selected={selectedExport}
                  onChange={handleSelectedExport}
                />
              </LegacyStack.Item>
              <LegacyStack.Item>
                <ChoiceList
                  title="Export as"
                  choices={[
                    {
                      label:
                        "CSV for Excel, Numbers, or other spreadsheet programs",
                      value: CSV_EXCEL,
                    },
                    { label: "Plain CSV file", value: CSV_PLAIN },
                  ]}
                  selected={selectedExportAs}
                  onChange={handleSelectedExportAs}
                />
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
      {/* </Frame> */}
    </div>
  );
}
