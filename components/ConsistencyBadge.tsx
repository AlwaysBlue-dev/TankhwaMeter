import type { ConsistencyResult } from "@/lib/utils/consistency";

const COLOR_MAP = {
  green: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    tooltip: "bg-green-900 dark:bg-green-800",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    tooltip: "bg-amber-900 dark:bg-amber-800",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    tooltip: "bg-red-900 dark:bg-red-800",
  },
};

export default function ConsistencyBadge({
  consistency,
}: {
  consistency: ConsistencyResult;
}) {
  const c = COLOR_MAP[consistency.color];

  return (
    <div className="group relative mb-4 inline-flex">
      <span
        className={`inline-flex cursor-default items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${c.badge}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
        {consistency.label} — {consistency.score}% of submissions in similar range
      </span>

      {/* Tooltip */}
      <div
        className={`pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-72 rounded-lg px-3 py-2.5 text-xs leading-relaxed text-white shadow-lg group-hover:block ${c.tooltip}`}
      >
        <p className="mb-1 font-semibold">What does this mean?</p>
        <p>{consistency.description}</p>
        <p className="mt-1.5 opacity-75">
          Confidence measures how tightly salary submissions cluster around the median.
          High confidence means the data is consistent and reliable.
        </p>
      </div>
    </div>
  );
}
