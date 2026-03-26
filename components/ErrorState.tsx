interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <svg
        className="w-16 h-16 text-brand mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-text-heading mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-text-muted mb-6 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-brand text-white rounded-full text-sm font-medium
                   hover:bg-brand/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
