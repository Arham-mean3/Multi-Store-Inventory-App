import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Papa from "papaparse";

const INITIAL_STATES = {
  file: [],
  parsedData: [],
  active: true,
  importBtn: false,
  setActive: () => {},
  selectedExport: [],
  selectedExportAs: [],
  transformedData: [],
  handleImport: () => {},
  handleClose: () => {},
  handleSelectedExport: () => {},
  handleSelectedExportAs: () => {},
  handleModalChange: () => {},
  handleCheckbox: () => {},
  toggleImport: () => {},
  handleDropZoneDrop: () => {},
};

export const InventoryContext = createContext(INITIAL_STATES);

export default function InventoryContextProvider({ children }) {
  // Import Modal Button State
  const [importBtn, setImportBtn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [file, setFile] = useState([]);

  // Export Modal Button State
  const [active, setActive] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_plain"]);

  // Parsed-Data From Papa-Parser

  const [parsedData, setParsedData] = useState([]);

  // Effects

  useEffect(() => {
    setParsedData([]);
  }, []);

  // Import Modal Functionality

  const toggleImport = useCallback(() => {
    setImportBtn((importBtn) => !importBtn);
    if (!importBtn) setFile([]);
  }, []);

  const handleCheckbox = useCallback((value) => setChecked(value), []);

  // Export Modal Functionality
  const handleModalChange = useCallback(() => setActive(!active), [active]);

  const handleClose = () => {
    handleModalChange();
  };

  const handleSelectedExport = useCallback((value) => {
    setSelectedExport(value);
  }, []);

  const handleSelectedExportAs = useCallback((value) => {
    setSelectedExportAs(value);
  }, []);

  const handleImport = () => {
    if (file.length > 0) {
      const acceptedFiles = file[0];
      Papa.parse(acceptedFiles, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Parsed Data:", results.data);
          setParsedData(results.data); // Save parsed data to context/state
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
      setImportBtn(false);
    }
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile((files) => [...files, ...acceptedFiles]),
    [],
  );

  const transformedData = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return [];

    return parsedData.map((row) => ({
      id: row["Id"], // Assuming "Handle" is equivalent to `id`
      variant: {
        title: row["Option1 Value"] || "",
        barCode: row["Barcode"] || null,
        product: {
          title: row["Title"] || "",
          handle: row["Handle"] || "",
          featuredMedia: {
            preview: {
              image: {
                url: row["Image"] || "",
              },
            },
          },
        },
      },
      quantities: {
        available: parseFloat(row["Available"]),
        committed: parseFloat(row["Committed"]),
        damaged: parseFloat(row["Damaged"]),
        incoming: parseFloat(["Incoming"]),
        on_hand: parseFloat(row["On Hand"]),
        quality_control: parseFloat(row["Quality Control"]),
        reserved: parseFloat(row["Reserved"]),
        safety_stock: parseFloat(row["Safety Stock"]),
      },
      sku: row["SKU"] || null,
      COO: row["COO"] || null,
      hsCode: row["HS Code"] || null,
    }));
  }, [parsedData]);

  const value = {
    active,
    selectedExport,
    selectedExportAs,
    importBtn,
    checked,
    file,
    parsedData,
    transformedData,
    handleImport,
    handleModalChange,
    handleClose,
    handleSelectedExport,
    handleSelectedExportAs,
    handleCheckbox,
    toggleImport,
    handleDropZoneDrop,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
