"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocations } from "@/lib/hooks/useLocations";
import { useCatalog } from "@/lib/hooks/useCatalog";
import { useCategories } from "@/lib/hooks/useCategories";
import { useSearch } from "@/lib/hooks/useSearch";
import { Header } from "./Header";
import { MenuSection } from "./MenuSection";
import { FeaturedSection } from "./FeaturedSection";
import { ItemDetailModal } from "./ItemDetailModal";
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
  const displayedCategories = filteredBySearch;

  const activeDietaryFilterCount =
    dietaryFilters.allergens.length + dietaryFilters.preferences.length;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedLocationId(saved);
  }, []);

  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const id =
        saved && locations.some((l) => l.id === saved) ? saved : locations[0].id;
      setSelectedLocationId(id);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, [locations, selectedLocationId]);

  const handleLocationChange = useCallback((id: string) => {
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
      document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (locationsError) {
    return (
      <>
        <Header
          locations={[]}
          selectedLocationId={null}
          onLocationChange={handleLocationChange}
          onSearch={handleSearch}
          categorySummaries={[]}
          selectedCategoryId={null}
          onCategoryChange={() => {}}
          onOpenDietaryFilter={() => {}}
          activeDietaryFilterCount={0}
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
        onLocationChange={handleLocationChange}
        onSearch={handleSearch}
        categorySummaries={categorySummaries}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        onOpenDietaryFilter={() => setIsDietaryFilterOpen(true)}
        activeDietaryFilterCount={activeDietaryFilterCount}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-10" aria-live="polite">
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

      <ItemDetailModal item={selectedItem} onClose={handleCloseItemModal} />

      <DietaryFilterModal
        isOpen={isDietaryFilterOpen}
        onClose={() => setIsDietaryFilterOpen(false)}
        onApply={handleApplyDietaryFilters}
        currentFilters={dietaryFilters}
      />
    </>
  );
}
