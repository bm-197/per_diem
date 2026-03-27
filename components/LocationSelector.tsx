"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Location } from "@/lib/types";

interface LocationSelectorProps {
  locations: Location[];
  selectedId: string | null;
  onLocationChange: (id: string) => void;
}

export function LocationSelector({
  locations,
  selectedId,
  onLocationChange,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedLocation = locations.find((l) => l.id === selectedId);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (id: string) => {
      onLocationChange(id);
      setIsOpen(false);
    },
    [onLocationChange]
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            setDropdownTop(buttonRef.current.getBoundingClientRect().bottom + 6);
          }
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Pickup from ${selectedLocation?.name ?? "Select location"}`}
        className={`flex items-center gap-2 border rounded-full pl-1.5 pr-4 h-11
                   cursor-pointer transition-all duration-300
                   ${isOpen
                     ? "border-brand shadow-lg shadow-brand/10"
                     : "border-border-muted hover:border-brand/40"
                   }`}
      >
        <div className="w-8 h-8 rounded-full border border-border-default bg-bg-secondary
                        flex items-center justify-center shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.621 8.45c-1.05-4.62-5.08-6.7-8.62-6.7h-.01c-3.53 0-7.57 2.07-8.62 6.69-1.17 5.16 1.99 9.53 4.85 12.28a5.436 5.436 0 0 0 3.78 1.53c1.36 0 2.72-.51 3.77-1.53 2.86-2.75 6.02-7.11 4.85-12.27Zm-8.62 5.01a3.15 3.15 0 1 1 0-6.3 3.15 3.15 0 0 1 0 6.3Z"
              className="fill-brand"
            />
          </svg>
        </div>

        <div className="flex flex-col leading-tight text-left min-w-0">
          <span className="text-[11px] text-text-muted">Pickup from</span>
          <span className="text-sm font-semibold text-text-primary truncate max-w-[156px] md:max-w-[364px]">
            {selectedLocation?.name ?? "Select location..."}
          </span>
        </div>

        <svg
          className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-300
            ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select pickup location"
          className="fixed left-3 right-3 md:left-auto md:right-auto md:w-[420px] z-50
                     bg-background border border-border-default rounded-2xl
                     shadow-xl shadow-black/10 overflow-hidden"
          style={{ top: `${dropdownTop}px`,
            ...(buttonRef.current && window.innerWidth >= 768
              ? { left: `${buttonRef.current.getBoundingClientRect().left}px` }
              : {}),
          }}
        >
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
            {locations.map((loc) => {
              const isSelected = loc.id === selectedId;
              return (
                <button
                  key={loc.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(loc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                    transition-all duration-150
                    ${isSelected
                      ? "bg-brand/10 border border-brand/20"
                      : "hover:bg-bg-secondary border border-transparent"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    transition-all duration-200
                    ${isSelected ? "border-brand bg-brand scale-110" : "border-border-muted"}`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-text-primary">{loc.name}</h4>
                    {(loc.address.line1 || loc.address.city) && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {[loc.address.line1, loc.address.city, loc.address.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <svg className="w-4 h-4 text-brand shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
