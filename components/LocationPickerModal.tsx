"use client";

import { useState, useEffect, useCallback } from "react";
import type { Location } from "@/lib/types";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  selectedId: string | null;
  onConfirm: (id: string) => void;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  locations,
  selectedId,
  onConfirm,
}: LocationPickerModalProps) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedId);

  useEffect(() => {
    setTempSelectedId(selectedId);
  }, [selectedId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (tempSelectedId) {
      onConfirm(tempSelectedId);
    }
    onClose();
  }, [tempSelectedId, onConfirm, onClose]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      onClick={handleBackdrop}
    >
      <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-t-2xl md:rounded-2xl flex flex-col mx-0 md:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-lg font-bold">Select a location</h2>
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

        {/* Location list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {locations.map((loc) => {
            const isSelected = loc.id === tempSelectedId;
            return (
              <button
                key={loc.id}
                onClick={() => setTempSelectedId(loc.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors
                  ${isSelected
                    ? "border-brand bg-brand/5"
                    : "border-border-default hover:border-border-muted"
                  }`}
              >
                {/* Radio circle */}
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isSelected ? "border-brand bg-brand" : "border-border-muted"}`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Location details */}
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {loc.name}
                  </h4>
                  {(loc.address.line1 || loc.address.city) && (
                    <p className="text-sm text-text-muted mt-0.5">
                      {[loc.address.line1, loc.address.city, loc.address.state, loc.address.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="p-4 border-t border-border-default">
          <button
            onClick={handleConfirm}
            disabled={!tempSelectedId}
            className="w-full py-3 bg-brand text-white rounded-full text-sm font-semibold
                       hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  );
}
