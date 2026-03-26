"use client";

import { useState, useEffect, useCallback } from "react";
import type { CategoryGroup } from "@/lib/types";

export function useCatalog(locationId: string | null) {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/catalog?location_id=${locationId}`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return { categories, loading, error, retry: fetchCatalog };
}
