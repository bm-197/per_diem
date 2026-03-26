"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocations } from "@/lib/hooks/useLocations";
import { useCatalog } from "@/lib/hooks/useCatalog";
import { useCategories } from "@/lib/hooks/useCategories";
import { useSearch } from "@/lib/hooks/useSearch";
import { Header } from "./Header";
import { CategoryNav } from "./CategoryNav";
import { MenuSection } from "./MenuSection";
import { FeaturedSection } from "./FeaturedSection";
import { ItemDetailModal } from "./ItemDetailModal";
import { LocationPickerModal } from "./LocationPickerModal";
import { DietaryFilterModal, type DietaryFilters } from "./DietaryFilterModal";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { Footer } from "./Footer";
import type { MenuItem } from "@/lib/types";

const STORAGE_KEY = "selectedLocationId";

export function MenuContent() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isDietaryFilterOpen, setIsDietaryFilterOpen] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    allergens: [],
    preferences: [],
  });

  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    retry: retryLocations,
  } = useLocations();

  const {
    categories: catalogCategories,
    loading: catalogLoading,
    error: catalogError,
    retry: retryCatalog,
  } = useCatalog(selectedLocationId);

  const { categories: categorySummaries } = useCategories(selectedLocationId);

  const filteredBySearch = useSearch(catalogCategories, searchQuery);

  const displayedCategories =
    selectedCategoryId === null
      ? filteredBySearch
      : filteredBySearch.filter(
          (group) => group.category.id === selectedCategoryId
        );

  const activeDietaryFilterCount =
    dietaryFilters.allergens.length + dietaryFilters.preferences.length;

  // Restore location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedLocationId(saved);
  }, []);

  // Auto-select first location if none saved
  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const id =
        saved && locations.some((l) => l.id === saved) ? saved : locations[0].id;
      setSelectedLocationId(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, [locations, selectedLocationId]);

  const handleLocationConfirm = useCallback((id: string) => {
    setSelectedLocationId(id);
    setSelectedCategoryId(null);
    setSearchQuery("");
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((id: string | null) => {
    setSelectedCategoryId(id);
    if (id) {
      const el = document.getElementById(`section-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseItemModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleApplyDietaryFilters = useCallback((filters: DietaryFilters) => {
    setDietaryFilters(filters);
  }, []);

  // Error state
  if (locationsError) {
    return (
      <>
        <Header
          locations={[]}
          selectedLocationId={null}
          onOpenLocationPicker={() => {}}
          onSearch={handleSearch}
        />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4">
          <ErrorState message={locationsError} onRetry={retryLocations} />
        </main>
        <Footer />
      </>
    );
  }

  const hasItems = displayedCategories.length > 0;

  return (
    <>
      <Header
        locations={locations}
        selectedLocationId={selectedLocationId}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onSearch={handleSearch}
      />

      {/* Category navigation + Dietary filter */}
      {categorySummaries.length > 0 && (
        <div className="sticky top-[65px] z-10 bg-white border-b border-border-light">
          <div className="max-w-7xl mx-auto w-full flex items-center">
            <div className="flex-1 overflow-hidden">
              <CategoryNav
                categories={categorySummaries}
                selectedId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Dietary filter button */}
            <div className="shrink-0 pr-4 pl-2">
              <button
                onClick={() => setIsDietaryFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default
                           text-sm hover:bg-bg-secondary transition-colors relative"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-10">
        {locationsLoading || catalogLoading ? (
          <LoadingSkeleton />
        ) : catalogError ? (
          <ErrorState message={catalogError} onRetry={retryCatalog} />
        ) : !hasItems ? (
          <EmptyState />
        ) : (
          <>
            {selectedCategoryId === null && !searchQuery && (
              <FeaturedSection
                categories={catalogCategories}
                onItemClick={handleItemClick}
              />
            )}

            {displayedCategories.map((group) => (
              <MenuSection
                key={group.category.id}
                group={group}
                onItemClick={handleItemClick}
              />
            ))}
          </>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <ItemDetailModal item={selectedItem} onClose={handleCloseItemModal} />

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        locations={locations}
        selectedId={selectedLocationId}
        onConfirm={handleLocationConfirm}
      />

      <DietaryFilterModal
        isOpen={isDietaryFilterOpen}
        onClose={() => setIsDietaryFilterOpen(false)}
        onApply={handleApplyDietaryFilters}
        currentFilters={dietaryFilters}
      />
    </>
  );
}
