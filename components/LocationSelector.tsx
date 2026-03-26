"use client";

import type { Location } from "@/lib/types";

interface LocationSelectorProps {
  locations: Location[];
  selectedId: string | null;
  onLocationChange: (id: string) => void;
}

export function LocationSelector({
  locations,
  selectedId,
  onLocationChange,
}: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted whitespace-nowrap">
        Pickup from:
      </span>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onLocationChange(e.target.value)}
        className="rounded-full border border-border-light px-4 py-2 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-brand/30
                   truncate max-w-[200px]"
      >
        {locations.length === 0 && (
          <option value="">Loading locations...</option>
        )}
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  );
}
