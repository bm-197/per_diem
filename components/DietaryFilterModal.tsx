"use client";

import { useState, useEffect, useCallback } from "react";

const ALLERGENS = [
  "Eggs", "Fish", "Gluten", "Lupin", "Milk", "Molluscs",
  "Mustard", "Peanuts", "Sesame", "Soy", "Sulphites",
  "Tree Nuts", "Celery", "Crustaceans",
];

const DIETARY_PREFERENCES = [
  "Dairy Free", "Gluten Free", "Halal", "Kosher",
  "Nut Free", "Vegan", "Vegetarian",
];

export interface DietaryFilters {
  allergens: string[];
  preferences: string[];
}

interface DietaryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: DietaryFilters) => void;
  currentFilters: DietaryFilters;
}

export function DietaryFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: DietaryFilterModalProps) {
  const [allergens, setAllergens] = useState<string[]>(currentFilters.allergens);
  const [preferences, setPreferences] = useState<string[]>(currentFilters.preferences);

  useEffect(() => {
    setAllergens(currentFilters.allergens);
    setPreferences(currentFilters.preferences);
  }, [currentFilters, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleAllergen = useCallback((item: string) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }, []);

  const togglePreference = useCallback((item: string) => {
    setPreferences((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  }, []);

  const handleApply = useCallback(() => {
    onApply({ allergens, preferences });
    onClose();
  }, [allergens, preferences, onApply, onClose]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdrop}
    >
      <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-2xl flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-xl font-bold">Dietary Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Allergens section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔸</span>
                <h3 className="text-base font-semibold">Allergens</h3>
              </div>
              <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded">
                Exclude
              </span>
            </div>
            <p className="text-sm text-text-muted mb-3">
              Exclude products containing these allergens
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGENS.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleAllergen(item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors
                    ${allergens.includes(item)
                      ? "border-brand bg-brand/5"
                      : "border-border-default hover:border-border-muted"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${allergens.includes(item) ? "border-brand bg-brand" : "border-border-muted"}`}
                  >
                    {allergens.includes(item) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preferences section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥗</span>
                <h3 className="text-base font-semibold">Dietary preferences</h3>
              </div>
              <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded">
                Include
              </span>
            </div>
            <p className="text-sm text-text-muted mb-3">
              Show only products matching these preferences
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_PREFERENCES.map((item) => (
                <button
                  key={item}
                  onClick={() => togglePreference(item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors
                    ${preferences.includes(item)
                      ? "border-brand bg-brand/5"
                      : "border-border-default hover:border-border-muted"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${preferences.includes(item) ? "border-brand bg-brand" : "border-border-muted"}`}
                  >
                    {preferences.includes(item) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border-default p-4 flex justify-end">
          <button
            onClick={handleApply}
            className="px-8 py-2.5 bg-brand text-white rounded-full text-sm font-semibold
                       hover:bg-brand/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
