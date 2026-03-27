"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full md:max-w-md">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search items..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-full border border-border-muted pl-11 pr-4 h-10 text-sm
                   bg-background text-foreground transition-colors duration-200
                   hover:border-border-muted/80
                   focus:outline-none focus:border-brand
                   placeholder:text-text-muted"
      />
    </div>
  );
}
