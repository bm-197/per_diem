"use client";

import Image from "next/image";
import type { Location } from "@/lib/types";
import type { CategorySummary } from "@/lib/types";
import { LocationSelector } from "./LocationSelector";
import { SearchBar } from "./SearchBar";
import { CategoryNav } from "./CategoryNav";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationChange: (id: string) => void;
  onSearch: (query: string) => void;
  categorySummaries: CategorySummary[];
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  onOpenDietaryFilter: () => void;
  activeDietaryFilterCount: number;
}

export function Header({
  locations,
  selectedLocationId,
  onLocationChange,
  onSearch,
  categorySummaries,
  selectedCategoryId,
  onCategoryChange,
  onOpenDietaryFilter,
  activeDietaryFilterCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background w-full">
      <div className="px-4 md:px-8">

        {/* ── Mobile layout (stacked rows) ── */}
        <div className="md:hidden">
          {/* Row 1: Logo + Location + Theme toggle */}
          <div className="flex items-center gap-3 py-4">
            <Image
              src="/per_diem_logo.svg"
              alt="Per Diem"
              width={40}
              height={26}
              className="shrink-0"
              priority
            />
            <LocationSelector
              locations={locations}
              selectedId={selectedLocationId}
              onLocationChange={onLocationChange}
            />
            <div className="flex-1" />
            <ThemeToggle />
          </div>

          {/* Row 2: Search bar (full width) */}
          <div className="pb-3">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>

        {/* ── Desktop layout (single row) ── */}
        <div className="hidden md:flex items-center gap-4 py-4">
          <Image
            src="/per_diem_logo.svg"
            alt="Per Diem"
            width={50}
            height={32}
            className="shrink-0"
            priority
          />

          <SearchBar onSearch={onSearch} />

          <LocationSelector
            locations={locations}
            selectedId={selectedLocationId}
            onLocationChange={onLocationChange}
          />

          <div className="flex-1" />

          <ThemeToggle />
        </div>

        {/* ── Category pills + Dietary filter (shared) ── */}
        {categorySummaries.length > 0 && (
          <div className="flex items-center border-t border-border-light">
            <div className="flex-1 overflow-hidden">
              <CategoryNav
                categories={categorySummaries}
                selectedId={selectedCategoryId}
                onCategoryChange={onCategoryChange}
              />
            </div>

            <div className="shrink-0 pr-0 pl-2">
              <button
                onClick={onOpenDietaryFilter}
                aria-label={`Dietary filters${activeDietaryFilterCount > 0 ? `, ${activeDietaryFilterCount} active` : ""}`}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-border-default
                           text-sm hover:bg-bg-secondary transition-colors relative"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="hidden md:inline text-text-muted">Dietary Filter</span>
                {activeDietaryFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand text-white text-xs
                                   rounded-full flex items-center justify-center font-medium">
                    {activeDietaryFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
