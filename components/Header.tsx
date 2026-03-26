"use client";

import Image from "next/image";
import type { Location } from "@/lib/types";
import { LocationSelector } from "./LocationSelector";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  locations: Location[];
  selectedLocationId: string | null;
  onOpenLocationPicker: () => void;
  onSearch: (query: string) => void;
}

export function Header({
  locations,
  selectedLocationId,
  onOpenLocationPicker,
  onSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Image
            src="/per_diem_logo.svg"
            alt="Per Diem"
            width={50}
            height={32}
            className="shrink-0"
            priority
          />

          {/* Search bar */}
          <SearchBar onSearch={onSearch} />

          {/* Location selector */}
          <LocationSelector
            locations={locations}
            selectedId={selectedLocationId}
            onOpenPicker={onOpenLocationPicker}
          />
        </div>
      </div>
    </header>
  );
}
