"use client";

import type { Location } from "@/lib/types";
import { LocationSelector } from "./LocationSelector";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationChange: (id: string) => void;
  onSearch: (query: string) => void;
}

export function Header({
  locations,
  selectedLocationId,
  onLocationChange,
  onSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Mobile: stacked rows */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          {/* Row 1: Logo + Location + (desktop) search */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-brand-dark whitespace-nowrap">
              Per Diem
            </h1>
            <LocationSelector
              locations={locations}
              selectedId={selectedLocationId}
              onLocationChange={onLocationChange}
            />
          </div>

          {/* Row 2: Search */}
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
    </header>
  );
}
