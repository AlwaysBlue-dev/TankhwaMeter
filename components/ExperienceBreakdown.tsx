import { formatSalary } from "@/lib/utils/format";

type SalaryRow = { monthly_salary_pkr: number; experience_years: number };

const BANDS = [
  { label: "0–2 years",  values: [0, 1] },
  { label: "3–5 years",  values: [3] },
  { label: "6–10 years", values: [5] },
  { label: "10+ years",  values: [10] },
];

export default function ExperienceBreakdown({ salaries }: { salaries: SalaryRow[] }) {
  const bands = BANDS.map((band) => {
    const matching = salaries.filter((s) => band.values.includes(s.experience_years));
    const count = matching.length;
    const avg =
      count > 0
        ? Math.round(matching.reduce((a, b) => a + b.monthly_salary_pkr, 0) / count)
        : 0;
    return { label: band.label, count, avg };
  });

  const maxAvg = Math.max(...bands.filter((b) => b.count >= 3).map((b) => b.avg), 1);
  if (!bands.some((b) => b.count > 0)) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[#E2E8F0] px-5 py-3.5">
        <h3 className="text-sm font-semibold text-[#0F172A]">
          Salary by Experience Level
        </h3>
      </div>
      <div className="divide-y divide-[#F1F5F9]">
        {bands.map((band) => (
          <div key={band.label} className="flex items-center gap-3 px-5 py-3.5">
            <span className="w-20 shrink-0 text-xs font-medium text-[#64748B] sm:w-24">
              {band.label}
            </span>

            <div className="flex-1">
              {band.count < 3 ? (
                <span className="text-xs italic text-[#94A3B8]">
                  Insufficient data{band.count > 0 ? ` (${band.count})` : ""}
                </span>
              ) : (
                <div className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((band.avg / maxAvg) * 100)}%`,
                      background: "linear-gradient(90deg, #2563EB, #10B981)",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="w-36 shrink-0 text-right sm:w-40">
              {band.count >= 3 ? (
                <span className="text-xs font-semibold tabular-nums text-[#0F172A]">
                  {formatSalary(band.avg)}{" "}
                  <span className="font-normal text-[#94A3B8]">
                    ({band.count})
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
