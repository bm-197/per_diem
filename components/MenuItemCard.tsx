import Image from "next/image";
import type { MenuItem } from "@/lib/types";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const primaryPrice =
    item.variations.length > 0 ? item.variations[0].formattedPrice : null;
  const hasMultipleVariations = item.variations.length > 1;

  return (
    <div className="group flex flex-col cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[34px] md:rounded-lg">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
            <svg
              className="w-12 h-12 text-text-muted/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="mt-2 px-1">
        <h4 className="text-base font-medium line-clamp-2">{item.name}</h4>

        {/* Description — hidden on mobile */}
        {item.description && (
          <p className="hidden md:block mt-1 text-sm text-text-muted line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price */}
        {primaryPrice && (
          <p className="mt-1 text-base font-bold">
            {hasMultipleVariations ? `From ${primaryPrice}` : primaryPrice}
          </p>
        )}

        {/* Multiple variations */}
        {hasMultipleVariations && (
          <p className="hidden md:block mt-0.5 text-xs text-text-muted">
            {item.variations
              .map((v) => `${v.name} ${v.formattedPrice}`)
              .join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
