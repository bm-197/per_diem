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
            className="shrink-0 w-[320px] md:w-[380px] flex bg-background rounded-xl border border-border-default
                       overflow-hidden hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200 text-left cursor-pointer active:scale-[0.98]"
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
                <Image
                  src="/placeholder-image.svg"
                  alt=""
                  fill
                  className="object-cover rounded-lg"
                />
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
