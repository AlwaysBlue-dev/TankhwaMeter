function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E2E8F0] ${className ?? ""}`}
    />
  );
}

function StatCardSkeleton({ accent }: { accent: string }) {
  return (
    <div
      className="rounded-xl border-l-4 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      style={{ borderLeftColor: accent }}
    >
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-6 w-28" />
    </div>
  );
}

function ResultCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Search card */}
      <div className="mb-8 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-5 space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCardSkeleton accent="#2563EB" />
        <StatCardSkeleton accent="#10B981" />
        <StatCardSkeleton accent="#F59E0B" />
        <StatCardSkeleton accent="#8B5CF6" />
      </div>

      {/* Result rows */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
