export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-default">
      <p className="text-center text-sm text-text-muted/60 py-6">
        You&apos;ve reached the end!
      </p>
      <div className="text-center pb-6 px-4 space-y-2">
        <p className="text-sm font-semibold text-text-secondary">
          Per Diem
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a
            href="#"
            className="text-text-secondary underline font-medium hover:text-text-primary"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-text-secondary underline font-medium hover:text-text-primary"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
