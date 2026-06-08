export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-admin-border items-center">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-admin-elevated rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-admin-surface border border-admin-border rounded-md p-6 animate-pulse">
        <div className="h-3 w-20 bg-admin-elevated rounded mb-4" />
        <div className="h-8 w-24 bg-admin-elevated rounded mb-2" />
        <div className="h-3 w-16 bg-admin-elevated rounded" />
      </div>
    ))}
  </div>
);

export const RowSkeleton = ({ count = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-12 bg-admin-elevated rounded w-full" />
    ))}
  </div>
);
