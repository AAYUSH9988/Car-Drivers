// Shared loading primitives — use these instead of inline animate-pulse divs or ad-hoc SVG spinners

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <svg
      className={`animate-spin text-primary ${sizes[size] ?? sizes.md} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const InlineLoader = ({ rows = 3 }) => (
  <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-4 bg-outline-variant/30 rounded w-full" style={{ width: `${100 - i * 10}%` }} />
    ))}
  </div>
);

export default Spinner;
