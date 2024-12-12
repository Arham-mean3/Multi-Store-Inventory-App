import React, { useEffect, useMemo, useState } from "react";
import CustomPopover from "./Popover";
import { useSearchParams } from "@remix-run/react";

function Heading({ location, selection }) {
  const [searchParams, setSearchParams] = useSearchParams(); // Initialize here
  const [selected, setSelected] = useState(location);
  const [locationId, setLocationId] = useState(
    searchParams.get("location") || selected[1].id,
  );

  // Memoize the map for fast lookups
  const locationMap = useMemo(
    () => new Map(selected.map((loc) => [loc.id, loc.name])),
    [selected],
  );

  useEffect(() => {
    selection(locationId);
  }, [locationId, selection]);

  const options = [...location].reverse().map((loc) => ({
    label: loc.name,
    value: loc.id,
    id: loc.id,
  }));

  return (
    <div className="mb-8 md:mb-0">
      <div className="flex gap-4 justify-between items-center my-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-base md:text-lg lg:text-2xl font-bold">
            Smart Stock App
          </h1>

          <div className="hidden md:block">
            <CustomPopover
              options={options}
              selection={selection}
              locationId={locationId}
              setLocationId={setLocationId}
              locationMap={locationMap}
            />
          </div>
        </div>
      </div>

      <div className="block md:hidden">
        <CustomPopover
          options={options}
          selection={selection}
          locationId={locationId}
          setLocationId={setLocationId}
          locationMap={locationMap}
        />
      </div>
    </div>
  );
}

export default Heading;
