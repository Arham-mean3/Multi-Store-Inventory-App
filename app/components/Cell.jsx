import { ActionList, Popover, TextField } from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";

export function Cell({ val}) {
  return (
    <div>
      <p className="text-sm w-full ml-0 lg:ml-4 lg:text-sm">{val}</p>
    </div>
  );
}

export function RightCell({ val, type, id, onValueChange, setAvailable }) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [value, setValue] = useState(val);

  // Sync state with prop changes
  useEffect(() => {
    setValue(val);
  }, [val]);

  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue);
      if (onValueChange) {
        onValueChange(id, Number(newValue)); // Pass numeric value to the parent
        setAvailable(Number(newValue));
      }
    },
    [onValueChange],
  );

  // Toggle Popper Active Functionality
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <div className="flex w-full">
      <div className="w-28">
        <TextField
          type="number"
          value={value}
          onChange={handleChange}
          autoComplete="off"
          maxHeight={10}
        />
      </div>
    </div>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      autofocusTarget="first-node"
      onClose={togglePopoverActive}
    >
      {type === "available" && (
        <ActionList actionRole="menuitem" items={[{ content: "values" }]} />
      )}
      {type === "onHand" && (
        <ActionList
          actionRole="menuitem"
          items={[{ content: "On Hand Value" }]}
        />
      )}
    </Popover>
  );
}

//  <Button
// variant="monochromePlain"
// onClick={togglePopoverActive}
// disclosure
// >
// Button content or icon
// </Button>
