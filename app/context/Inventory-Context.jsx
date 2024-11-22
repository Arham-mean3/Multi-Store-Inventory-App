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
  matchData: [],
  setActive: () => {},
  selectedExport: [],
  selectedExportAs: [],
  transformedData: [],
  setMatchData: () => {},
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
  const [locations, setLocations] = useState([]);
  console.log("Locations data", locations);

  // Export Modal Button State
  const [active, setActive] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_plain"]);

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
    }
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile((files) => [...files, ...acceptedFiles]),
    [],
  );

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
          row["Available"] === "not stocked" ? 0 : parseFloat(row["Available"]),
        committed:
          row["Committed"] === "not stocked" ? 0 : parseFloat(row["Committed"]),
        damaged:
          row["Damaged"] === "not stocked" ? 0 : parseFloat(row["Damaged"]),
        on_hand:
          row["On Hand"] === "not stocked" ? 0 : parseFloat(row["On Hand"]),
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
    setMatchData,
    setLocations,
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
