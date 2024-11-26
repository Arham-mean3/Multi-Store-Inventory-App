import { ActionList, Button, Popover, TextField } from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";

export function Cell({ val, type }) {
  const [popoverActive, setPopoverActive] = useState(false);
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <Button variant="monochromePlain" onClick={togglePopoverActive} disclosure>
      <p className="text-xs lg:text-sm">{val}</p>
    </Button>
  );
  return (
    <Popover
      active={popoverActive}
      activator={activator}
      autofocusTarget="first-node"
      onClose={togglePopoverActive}
    >
      {type === "commited" && (
        <ActionList actionRole="menuitem" items={[{ content: "No Value" }]} />
      )}
      {type === "unAvailable" && (
        <ActionList
          actionRole="menuitem"
          items={[{ content: "Unavailable Value" }]}
        />
      )}
    </Popover>
  );
}

export function RightCell({ val, type }) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [value, setValue] = useState(val);

  // Sync state with prop changes
  useEffect(() => {
    setValue(val);
  }, [val]);

  const handleChange = useCallback((newValue) => setValue(newValue), []);
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
      <Button
        variant="monochromePlain"
        onClick={togglePopoverActive}
        disclosure
      >
        {/* Button content or icon */}
      </Button>
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
