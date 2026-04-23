export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-64 rounded bg-[#E2E8F0]" />
        <div className="mt-2 h-4 w-136 max-w-full rounded bg-[#E2E8F0]" />
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
          <div className="h-10 rounded-lg bg-[#F1F5F9]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-56 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-56 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-56 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
        <div className="h-56 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
      </div>
    </div>
  );
}
