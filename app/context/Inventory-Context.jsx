import { createContext, useCallback, useState } from "react";

const INITIAL_STATES = {
  file: [],
  active: true,
  importBtn: false,
  setActive: () => {},
  selectedExport: [],
  selectedExportAs: [],
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
  const [selectedExport, setSelectedExport] = useState([]);
  const [selectedExportAs, setSelectedExportAs] = useState([]);

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
    handleSelectedExport([]);
    handleSelectedExportAs([]);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    [],
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    [],
  );

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile((files) => [...files, ...acceptedFiles]),
    [],
  );

  const value = {
    active,
    selectedExport,
    selectedExportAs,
    importBtn,
    checked,
    file,
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
