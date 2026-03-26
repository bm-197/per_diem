"use client";

import type { CategorySummary } from "@/lib/types";

interface CategoryNavProps {
  categories: CategorySummary[];
  selectedId: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function CategoryNav({
  categories,
  selectedId,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <nav className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 py-3 px-4 md:px-0">
        <button
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium transition-colors
            ${
              selectedId === null
                ? "bg-brand text-white"
                : "bg-bg-secondary text-foreground hover:bg-border-default"
            }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium transition-colors
              ${
                selectedId === cat.id
                  ? "bg-brand text-white"
                  : "bg-bg-secondary text-foreground hover:bg-border-default"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
