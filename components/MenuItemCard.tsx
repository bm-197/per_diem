import Image from "next/image";
import type { MenuItem } from "@/lib/types";

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: () => void;
}

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const primaryPrice =
    item.variations.length > 0 ? item.variations[0].formattedPrice : null;
  const hasMultipleVariations = item.variations.length > 1;
  const isSoldOut = item.availability.status === "SOLD_OUT";
  const isLowStock = item.availability.status === "LOW_STOCK";

  return (
    <button
      type="button"
      onClick={isSoldOut ? undefined : onClick}
      className={`group flex flex-col text-left transition-transform duration-150
        ${isSoldOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]"}`}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[38px] md:rounded-4xl">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform group-hover:scale-105
              ${isSoldOut ? "grayscale" : ""}`}
          />
        ) : (
          <Image
            src="/placeholder-image.svg"
            alt=""
            fill
            className="object-cover"
          />
        )}

        {/* Availability badge */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[38px] md:rounded-4xl">
            <span className="px-4 py-1.5 bg-background/90 backdrop-blur text-sm font-semibold rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
              Only {item.availability.status === "LOW_STOCK" ? item.availability.quantity : ""} left
            </span>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="mt-2 px-1">
        <h4 className="text-base font-medium line-clamp-2">{item.name}</h4>

        {item.description && (
          <p className="mt-1 text-sm text-text-muted hidden md:[-webkit-line-clamp:3] md:[display:-webkit-box] md:[-webkit-box-orient:vertical] md:overflow-hidden">
            {item.description}
          </p>
        )}

        {primaryPrice && (
          <p className={`mt-1 text-base font-bold ${isSoldOut ? "line-through text-text-muted" : ""}`}>
            {hasMultipleVariations ? `From ${primaryPrice}` : primaryPrice}
          </p>
        )}

        {hasMultipleVariations && (
          <p className="hidden md:block mt-0.5 text-xs text-text-muted">
            {item.variations
              .map((v) => `${v.name} ${v.formattedPrice}`)
              .join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
}
