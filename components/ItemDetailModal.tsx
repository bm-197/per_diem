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
  // Track selected modifiers per modifier list: { [listId]: Set<modifierId> }
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Set<string>>>({});

  // Reset all state when item changes
  useEffect(() => {
    if (!item) return;
    setSelectedVariationIdx(0);
    setQuantity(1);
    setShowFullDescription(false);
    setSpecialInstructions("");
    // Initialize modifier selections with defaults
    const initial: Record<string, Set<string>> = {};
    for (const ml of item.modifierLists) {
      const defaults = new Set<string>();
      for (const mod of ml.modifiers) {
        if (mod.onByDefault) defaults.add(mod.id);
      }
      initial[ml.id] = defaults;
    }
    setSelectedModifiers(initial);
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

  const toggleModifier = useCallback(
    (listId: string, modId: string, maxSelected: number) => {
      setSelectedModifiers((prev) => {
        const current = new Set(prev[listId] ?? []);
        if (current.has(modId)) {
          current.delete(modId);
        } else {
          // Enforce max selection
          if (maxSelected > 0 && current.size >= maxSelected) return prev;
          current.add(modId);
        }
        return { ...prev, [listId]: current };
      });
    },
    []
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="relative bg-background w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ animation: "item-modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Close button */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center
                       shadow-md hover:bg-background transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main layout: image left, details right on desktop; stacked on mobile */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-[3/2] md:aspect-auto bg-bg-secondary shrink-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <Image
                src="/placeholder-image.svg"
                alt=""
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Availability badge */}
              {item.availability.status === "SOLD_OUT" && (
                <div role="status" aria-live="polite" className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium text-center dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
                  This item is currently sold out
                </div>
              )}
              {item.availability.status === "LOW_STOCK" && (
                <div role="status" aria-live="polite" className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium text-center dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
                  Only {item.availability.quantity} left — order soon!
                </div>
              )}

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

              {/* Variations */}
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
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm
                            transition-all duration-200
                            ${isSelected
                              ? "border-brand bg-brand/5 shadow-sm shadow-brand/10"
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

              {/* Modifier lists (Milk, Flavor, etc.) — now interactive */}
              {item.modifierLists.map((ml) => {
                const selected = selectedModifiers[ml.id] ?? new Set();
                return (
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
                      {ml.modifiers.map((mod) => {
                        const isChecked = selected.has(mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModifier(ml.id, mod.id, ml.maxSelected)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm
                              transition-all duration-200 text-left
                              ${isChecked
                                ? "border-brand bg-brand/5 shadow-sm shadow-brand/10"
                                : "border-border-default hover:border-border-muted"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                  transition-all duration-200
                                  ${isChecked ? "border-brand bg-brand scale-110" : "border-border-muted"}`}
                              >
                                {isChecked && (
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special instructions */}
              <div>
                <h3 className="text-base font-semibold mb-2">Special instructions</h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add special instructions..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border-default text-sm
                             bg-background placeholder:text-text-muted resize-none
                             transition-colors duration-200
                             focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Sticky bottom bar */}
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

              <button
                disabled={item.availability.status === "SOLD_OUT"}
                className="flex-1 h-11 bg-brand text-white rounded-full text-sm font-semibold
                           hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.availability.status === "SOLD_OUT" ? "Sold Out" : "Add to cart"}
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
