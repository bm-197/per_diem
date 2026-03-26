"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocations } from "@/lib/hooks/useLocations";
import { useCatalog } from "@/lib/hooks/useCatalog";
import { useCategories } from "@/lib/hooks/useCategories";
import { useSearch } from "@/lib/hooks/useSearch";
import { Header } from "./Header";
import { CategoryNav } from "./CategoryNav";
import { MenuSection } from "./MenuSection";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { Footer } from "./Footer";

const STORAGE_KEY = "selectedLocationId";

export function MenuContent() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter by selected category
  const displayedCategories =
    selectedCategoryId === null
      ? filteredBySearch
      : filteredBySearch.filter(
          (group) => group.category.id === selectedCategoryId
        );

  // Restore location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedLocationId(saved);
  }, []);

  // Auto-select first location if none saved
  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const id = saved && locations.some((l) => l.id === saved) ? saved : locations[0].id;
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

  // Scroll to category section when selected
  const handleCategoryChange = useCallback((id: string | null) => {
    setSelectedCategoryId(id);
    if (id) {
      const el = document.getElementById(`section-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Error state
  if (locationsError) {
    return (
      <>
        <Header
          locations={[]}
          selectedLocationId={null}
          onLocationChange={handleLocationChange}
          onSearch={handleSearch}
        />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4">
          <ErrorState message={locationsError} onRetry={retryLocations} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={handleLocationChange}
        onSearch={handleSearch}
      />

      {/* Category navigation */}
      {categorySummaries.length > 0 && (
        <div className="sticky top-[73px] z-10 bg-white border-b border-border-light max-w-7xl mx-auto w-full">
          <CategoryNav
            categories={categorySummaries}
            selectedId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-10">
        {locationsLoading || catalogLoading ? (
          <LoadingSkeleton />
        ) : catalogError ? (
          <ErrorState message={catalogError} onRetry={retryCatalog} />
        ) : displayedCategories.length === 0 ? (
          <EmptyState />
        ) : (
          displayedCategories.map((group) => (
            <MenuSection key={group.category.id} group={group} />
          ))
        )}
      </main>

      <Footer />
    </>
  );
}
