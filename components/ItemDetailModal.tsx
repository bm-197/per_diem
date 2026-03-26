"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    setSelectedVariationIdx(0);
    setQuantity(1);
    setShowFullDescription(false);
    setSpecialInstructions("");
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!item) return null;

  const selectedVariation = item.variations[selectedVariationIdx] ?? null;
  const basePrice = item.variations[0]?.price ?? 0;
  const description = item.description || "";
  const isLongDescription = description.length > 120;
  const displayDescription =
    isLongDescription && !showFullDescription
      ? description.slice(0, 120).trimEnd() + "..."
      : description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col">
        {/* Close button */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center
                       shadow-md hover:bg-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main layout: image left, details right on desktop; stacked on mobile */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image — left side on desktop, top on mobile */}
          <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-bg-secondary shrink-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[250px]">
                <svg className="w-20 h-20 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details — right side on desktop, below on mobile */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Name + Price */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-text-heading">{item.name}</h1>
                <span className="text-xl font-bold text-text-heading shrink-0">
                  {selectedVariation?.formattedPrice ?? item.variations[0]?.formattedPrice}
                </span>
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-text-muted leading-relaxed">
                  {displayDescription}
                  {isLongDescription && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-brand font-medium ml-1 hover:underline"
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </button>
                  )}
                </p>
              )}

              {/* Variations — always shown */}
              {item.variations.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-2">Variations</h3>
                  <div className="space-y-2">
                    {item.variations.map((variation, idx) => {
                      const priceDiff = variation.price - basePrice;
                      const isSelected = idx === selectedVariationIdx;
                      return (
                        <button
                          key={variation.id}
                          onClick={() => setSelectedVariationIdx(idx)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm
                            transition-colors
                            ${isSelected
                              ? "border-brand bg-brand/5 ring-1 ring-brand"
                              : "border-border-default hover:border-border-muted"
                            }`}
                        >
                          <span className="font-medium">{variation.name}</span>
                          {priceDiff > 0 && (
                            <span className="text-text-muted">+ {formatPriceDiff(priceDiff, variation.currency)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modifier lists (Milk, Flavor, etc.) */}
              {item.modifierLists.map((ml) => (
                <div key={ml.id}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-semibold">{ml.name}</h3>
                    <span className="text-xs text-text-muted">
                      {ml.minSelected > 0 ? "Required" : "Optional"}
                    </span>
                  </div>
                  {ml.maxSelected > 0 && (
                    <p className="text-xs text-text-muted mb-2">
                      Select maximum of {ml.maxSelected}
                    </p>
                  )}
                  <div className="space-y-2">
                    {ml.modifiers.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-border-default text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            ${mod.onByDefault ? "border-brand bg-brand" : "border-border-muted"}`}
                          >
                            {mod.onByDefault && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{mod.name}</span>
                        </div>
                        {mod.formattedPrice && (
                          <span className="text-text-muted">{mod.formattedPrice}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div>
                <h3 className="text-base font-semibold mb-2">Special instructions</h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add special instructions..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-border-default text-sm
                             placeholder:text-text-muted resize-none
                             focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Sticky bottom bar: quantity + add to cart */}
            <div className="border-t border-border-default p-4 flex items-center gap-4">
              <div className="flex items-center gap-0 bg-brand rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-white text-lg font-bold
                             disabled:opacity-40 transition-opacity"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-white text-lg font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button className="flex-1 h-11 bg-brand text-white rounded-full text-sm font-semibold
                                 hover:bg-brand/90 transition-colors">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPriceDiff(amountInCents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}
