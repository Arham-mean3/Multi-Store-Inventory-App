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
  columnMissing: [],
  matchData: [],
  setActive: () => {},
  selectedExport: [],
  selectedExportAs: [],
  transformedData: [],
  popoverActive: false,
  loading: false,
  changesArray: [],
  selected: "",
  selectedItems: [],
  setMatchData: () => {},
  handleImport: () => {},
  handleClose: () => {},
  handleSelectedExport: () => {},
  handleSelectedExportAs: () => {},
  handleModalChange: () => {},
  handleCheckbox: () => {},
  toggleImport: () => {},
  handleDropZoneDrop: () => {},
  setImportBtn: () => {},
  togglePopoverActive: () => {},
  setPopoverActive: () => {},
  setLoading: () => {},
  setChangesArray: () => {},
  setSelected: () => {},
  setSelectedItems: () => {},
};

export const InventoryContext = createContext(INITIAL_STATES);

export default function InventoryContextProvider({ children }) {
  // Selected Locations Id
  const [selected, setSelected] = useState("");

  // Import Modal Button State
  const [importBtn, setImportBtn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [file, setFile] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Export Modal Button State
  const [active, setActive] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_plain"]);
  const [popoverActive, setPopoverActive] = useState(false);

  // Inventory Real-times Row Changes
  const [changesArray, setChangesArray] = useState([]);

  // Missing Column States
  const [columnMissing, setColumnMissing] = useState([]);

  // Selected Inventory Items For Exporting
  const [selectedItems, setSelectedItems] = useState([]);

  const compulsoryColumns = [
    "Handle",
    "Title",
    "Barcode",
    "HS Code",
    "COO",
    "Location",
    "Available",
  ];

  // Parsed-Data From Papa-Parser
  const [parsedData, setParsedData] = useState([]);

  // Match-Data
  const [matchData, setMatchData] = useState([]);

  // Effects
  useEffect(() => {
    setParsedData([]);
  }, []);

  // Import Modal Functionality
  const toggleImport = useCallback(() => {
    setImportBtn((importBtn) => !importBtn);
    if (!importBtn) setFile([]);
    setMatchData([]);
    setParsedData([]);
    setColumnMissing([]); // Clear missing column state when the model is closed!
  }, []);

  const handleCheckbox = useCallback((value) => setChecked(value), []);

  const handleImport = () => {
    if (file.length > 0) {
      setLoading(true); // Start loading
      setColumnMissing([]); // Clear errors from previous runs

      const acceptedFiles = file[0];
      Papa.parse(acceptedFiles, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Parsed Data:", results.data);
          setParsedData(results.data); // Save parsed data to context/state

          // Validate columns
          const parsedColumns = results.meta.fields;
          const missingColumns = compulsoryColumns.filter(
            (column) => !parsedColumns.includes(column),
          );

          if (missingColumns.length > 0) {
            console.error("Missing Columns:", missingColumns);
            setColumnMissing([...new Set(missingColumns)]); // Set new errors
          } else {
            setColumnMissing([]); // Clear errors if none are missing
          }

          setTimeout(() => {
            setLoading(false); // End loading after 1 second
          }, 1000);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setLoading(false); // Stop loading immediately on error
        },
      });
    }
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      // Replace the current file with the new one
      const newFile = acceptedFiles.slice(0, 1);
      setFile(newFile); // Replace the old file with the new file
      setColumnMissing([]); // Clear previous column errors
      setMatchData([]); // Clear matched data from the previous file
      setLoading(false); // Reset loading state
    },
    [],
  );

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

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  // Inventory Row Functionality
  // Transforming the data that is coming from a CSV
  let transformedData = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return [];

    return parsedData.map((row) => ({
      sku: row["SKU"] || null,
      COO: row["COO"] || null,
      hsCode: row["HS Code"] || null,
      location: row["Location"] || "",
      variant: {
        title: row["Option1 Value"] || "",
        barCode: row["Barcode"] || null,
        product: {
          title: row["Title"] || "",
          handle: row["Handle"] || "",
        },
      },
      quantities: {
        available:
          row["Available"] === "not stocked"
            ? "not stocked"
            : row["Available"] === ""
              ? null // Explicitly set to null for empty string
              : isNaN(parseFloat(row["Available"])) // Check if parsing results in NaN
                ? null // Set to null if parsing fails
                : parseFloat(row["Available"]),
        committed:
          row["Committed"] === "not stocked"
            ? "not stocked"
            : isNaN(parseFloat(row["Committed"]))
              ? null
              : parseFloat(row["Committed"]),
        damaged:
          row["Damaged"] === "not stocked"
            ? "not stocked"
            : isNaN(parseFloat(row["Damaged"]))
              ? null
              : parseFloat(row["Damaged"]),
        on_hand:
          row["On Hand"] === "not stocked"
            ? "not stocked"
            : isNaN(parseFloat(row["On Hand"]))
              ? null
              : parseFloat(row["On Hand"]),
      },
    }));
  }, [parsedData]);

  const value = {
    active,
    matchData,
    selectedExport,
    selectedExportAs,
    importBtn,
    checked,
    file,
    parsedData,
    transformedData,
    popoverActive,
    locations,
    columnMissing,
    loading,
    changesArray,
    selected,
    selectedItems,
    setSelectedItems,
    setSelected,
    setLoading,
    setPopoverActive,
    setMatchData,
    setLocations,
    setImportBtn,
    handleImport,
    handleModalChange,
    handleClose,
    handleSelectedExport,
    handleSelectedExportAs,
    handleCheckbox,
    toggleImport,
    handleDropZoneDrop,
    togglePopoverActive,
    setChangesArray,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
