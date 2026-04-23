export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-64 rounded bg-[#E2E8F0]" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-[#E2E8F0]" />
      </div>

      <div className="mb-8 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <div className="h-12 rounded-xl bg-[#F1F5F9]" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="h-20 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-20 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-20 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-20 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
      </div>

      <div className="space-y-3">
        <div className="h-28 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-28 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-28 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
      </div>
    </div>
  );
}
