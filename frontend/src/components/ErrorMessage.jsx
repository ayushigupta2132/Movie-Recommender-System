export default function ErrorMessage({
  message,
  title = "Something went wrong",
  onRetry,
  compact = false,
}) {
  // Compact variant

  if (compact) {
    return (
      <>
        <svg
          className="w-4 h-4 shrink-0 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
        <span>{message}</span>
      </>
    );
  }

  // Full panel variant
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-16 rounded-2xl border border-zinc-800 bg-zinc-900/40"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          className="w-7 h-7 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center px-4">
        <p className="text-white font-semibold">{title}</p>
        <p className="text-zinc-400 text-sm mt-1.5 max-w-sm text-balance">
          {message}
        </p>
      </div>

      {/* Retry button — only rendered when onRetry is provided */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover active:scale-95 text-white text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}
