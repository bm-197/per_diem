export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Category nav skeleton */}
      <div className="flex gap-2 px-4 md:px-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-20 rounded-full bg-bg-secondary shrink-0"
          />
        ))}
      </div>

      {/* Menu grid skeleton */}
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-4">
          <div className="h-8 w-32 rounded bg-bg-secondary" />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {Array.from({ length: 4 }).map((_, cardIdx) => (
              <div key={cardIdx} className="space-y-2">
                <div className="aspect-square rounded-[34px] md:rounded-lg bg-bg-secondary" />
                <div className="h-4 w-3/4 rounded bg-bg-secondary" />
                <div className="h-4 w-1/2 rounded bg-bg-secondary" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
