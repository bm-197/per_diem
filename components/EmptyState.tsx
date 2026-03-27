export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <svg
        className="w-16 h-16 text-text-muted/40 mb-4"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="text-lg font-semibold text-text-heading mb-2">
        No items found
      </h3>
      <p className="text-sm text-text-muted max-w-sm">
        No menu items are available for this location. Try selecting a different
        location.
      </p>
    </div>
  );
}
