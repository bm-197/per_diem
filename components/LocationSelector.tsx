"use client";

import type { Location } from "@/lib/types";

interface LocationSelectorProps {
  locations: Location[];
  selectedId: string | null;
  onOpenPicker: () => void;
}

export function LocationSelector({
  locations,
  selectedId,
  onOpenPicker,
}: LocationSelectorProps) {
  const selectedLocation = locations.find((l) => l.id === selectedId);

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className="flex items-center gap-2.5 border border-border-light rounded-full px-4 py-2
                 cursor-pointer hover:border-border-muted transition-colors"
    >
      {/* Location pin icon */}
      <svg className="w-5 h-5 text-brand shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>

      <div className="flex flex-col leading-tight text-left min-w-0">
        <span className="text-[11px] text-text-muted">Pickup from</span>
        <span className="text-sm font-semibold text-text-primary truncate max-w-[168px] md:max-w-[240px]">
          {selectedLocation?.name ?? "Select location..."}
        </span>
      </div>
    </button>
  );
}
