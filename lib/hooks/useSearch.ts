"use client";

import { useMemo } from "react";
import type { CategoryGroup } from "@/lib/types";

/** Client-side filter: returns categories with items matching the search query. */
export function useSearch(
  categories: CategoryGroup[],
  query: string
): CategoryGroup[] {
  return useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return categories;

    return categories
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(trimmed) ||
            item.description.toLowerCase().includes(trimmed)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, query]);
}
