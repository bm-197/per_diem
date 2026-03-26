export function DownloadBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* App icon placeholder */}
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-brand" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zm-5-3c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Download our app</p>
            <p className="text-xs text-text-muted">20 points on your first order</p>
          </div>
        </div>

        {/* Desktop: button, Mobile: arrow */}
        <button className="hidden md:block px-5 py-2 bg-brand text-white rounded-full text-sm font-medium
                           hover:bg-brand/90 transition-colors">
          Download
        </button>
        <button className="md:hidden w-8 h-8 flex items-center justify-center" aria-label="Download app">
          <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
