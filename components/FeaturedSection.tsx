"use client";

import Image from "next/image";
import type { MenuItem, CategoryGroup } from "@/lib/types";

interface FeaturedSectionProps {
  categories: CategoryGroup[];
  onItemClick: (item: MenuItem) => void;
}

/**
 * Featured section showing a curated selection of items in horizontal card layout.
 * Picks the first item from each category (up to 5 items).
 */
export function FeaturedSection({ categories, onItemClick }: FeaturedSectionProps) {
  // Pick first item from each category for featured display
  const featuredItems: MenuItem[] = [];
  for (const group of categories) {
    if (featuredItems.length >= 5) break;
    if (group.items.length > 0) {
      featuredItems.push(group.items[0]);
    }
  }

  if (featuredItems.length === 0) return null;

  return (
    <section>
      <h3 className="text-2xl font-bold text-text-heading mb-4">Featured</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {featuredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item)}
            className="shrink-0 w-[320px] md:w-[380px] flex bg-white rounded-xl border border-border-default
                       overflow-hidden hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            {/* Image */}
            <div className="relative w-24 h-24 shrink-0 m-3">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-bg-secondary rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 py-3 pr-3 flex flex-col justify-between min-w-0">
              <div>
                <h4 className="text-base font-medium line-clamp-1">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-text-muted line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <p className="text-base font-bold mt-1">
                {item.variations[0]?.formattedPrice}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
