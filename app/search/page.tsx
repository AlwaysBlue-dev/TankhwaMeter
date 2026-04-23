import type { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, Building2, Clock, Users, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Salary, JobCategory } from "@/lib/types";
import SalaryComparison from "@/components/SalaryComparison";
import BackToTop from "@/components/BackToTop";
import ConsistencyBadge from "@/components/ConsistencyBadge";
import ExperienceBreakdown from "@/components/ExperienceBreakdown";
import FlagButton from "@/components/FlagButton";
import { formatSalary, timeAgo } from "@/lib/utils/format";
import { calculateConsistency } from "@/lib/utils/consistency";

export const revalidate = 300;

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi",
  "Peshawar", "Quetta", "Multan", "Remote",
];

const EXPERIENCE_OPTIONS = [
  { label: "0–1 year", value: "0" },
  { label: "1–3 years", value: "1" },
  { label: "3–5 years", value: "3" },
  { label: "5–10 years", value: "5" },
  { label: "10+ years", value: "10" },
];

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Highest Salary", value: "highest" },
  { label: "Lowest Salary", value: "lowest" },
];

const PERIOD_OPTIONS = [
  { label: "All Time", value: "" },
  { label: "Last 3 Months", value: "3mo" },
  { label: "Last 6 Months", value: "6mo" },
  { label: "Last 12 Months", value: "12mo" },
];

const SELECT_CLS =
  "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] " +
  "outline-none transition-all duration-200 " +
  "focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 " +
  "disabled:opacity-50";

// ── Helpers ────────────────────────────────────────────────────────────────────

function str(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

function pageUrl(params: Record<string, string>, page: number): string {
  return `/search?${new URLSearchParams({ ...params, page: String(page) })}`;
}

function periodCutoff(period: string): string | null {
  const ms = period === "3mo" ? 90 : period === "6mo" ? 180 : period === "12mo" ? 365 : 0;
  if (!ms) return null;
  return new Date(Date.now() - ms * 86_400_000).toISOString();
}

function periodLabel(period: string): string {
  if (period === "3mo") return "last 3 months";
  if (period === "6mo") return "last 6 months";
  if (period === "12mo") return "last 12 months";
  return "all time";
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const raw      = await searchParams;
  const q        = str(raw.q);
  const jobTitle = str(raw.job_title);
  const city     = str(raw.city);
  const industry = str(raw.industry);
  const role     = jobTitle || q || industry;

  let title       = "Search Salaries";
  let description = "Browse anonymous salary data from Pakistani professionals. Filter by city, industry, and experience.";

  if (role && city) {
    title       = `${role} Salaries in ${city}`;
    description = `See real ${role} salaries in ${city}. Compare anonymous salary data from Pakistani professionals.`;
  } else if (role) {
    title       = `${role} Salaries in Pakistan`;
    description = `See real ${role} salaries in Pakistan. Compare anonymous salary data from Pakistani professionals.`;
  } else if (city) {
    title       = `Salaries in ${city}`;
    description = `Browse salary data from professionals in ${city}. Compare anonymous salaries submitted by Pakistanis.`;
  }

  return {
    title,
    description,
    openGraph: { title: `${title} — TankhwaMeter`, description },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

type SalaryStats = Pick<Salary, "monthly_salary_pkr" | "experience_years" | "is_verified">;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;

  const q          = str(raw.q);
  const jobTitle   = str(raw.job_title);
  const city       = str(raw.city);
  const industry   = str(raw.industry);
  const experience = str(raw.experience);
  const sort       = str(raw.sort) || "recent";
  const period     = str(raw.period);
  const page       = Math.max(1, Number(str(raw.page)) || 1);
  const offset     = (page - 1) * PAGE_SIZE;

  const orderCol  = sort === "highest" || sort === "lowest" ? "monthly_salary_pkr" : "submitted_at";
  const ascending = sort === "lowest";
  const cutoff    = periodCutoff(period);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyFilters(qb: any, includeDateFilter = true): any {
    qb = qb.eq("is_flagged", false);
    if (q)          qb = qb.or(`job_title.ilike.%${q}%,company.ilike.%${q}%`);
    if (jobTitle)   qb = qb.ilike("job_title", `%${jobTitle}%`);
    if (city)       qb = qb.eq("city", city);
    if (industry)   qb = qb.eq("industry", industry);
    if (experience) qb = qb.eq("experience_years", Number(experience));
    if (includeDateFilter && cutoff) qb = qb.gte("submitted_at", cutoff);
    return qb;
  }

  let fetchError   = false;
  let categories: JobCategory[] = [];
  let salaries:   SalaryStats[] = [];
  let results:    Salary[]      = [];
  let totalCount  = 0;
  let allTimeCount: number | null = null;

  try {
    const [catsRes, statsRes, resultsRes, allTimeRes] = await Promise.all([
      supabase.from("job_categories").select("id, name").order("name"),

      applyFilters(
        supabase
          .from("salaries")
          .select("monthly_salary_pkr, experience_years, is_verified", { count: "exact" })
          .limit(5000)
      ),

      applyFilters(
        supabase
          .from("salaries")
          .select("*")
          .order(orderCol, { ascending })
          .range(offset, offset + PAGE_SIZE - 1)
      ),

      cutoff
        ? applyFilters(
            supabase.from("salaries").select("id", { count: "exact", head: true }),
            false
          )
        : Promise.resolve({ count: null, error: null }),
    ]);

    if (statsRes.error || resultsRes.error) throw new Error("Supabase query failed");

    categories   = (catsRes.data  ?? []) as JobCategory[];
    salaries     = (statsRes.data ?? []) as SalaryStats[];
    results      = (resultsRes.data ?? []) as Salary[];
    totalCount   = statsRes.count ?? 0;
    allTimeCount = allTimeRes.count ?? null;
  } catch {
    fetchError = true;
  }

  const total      = totalCount;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasResults = results.length > 0;
  const hasFilters = !!(q || jobTitle || city || industry || experience);

  const vals          = salaries.map((s) => s.monthly_salary_pkr);
  const verifiedCount = salaries.filter((s) => s.is_verified).length;
  const avgSal = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const maxSal = vals.length ? Math.max(...vals) : 0;
  const minSal = vals.length ? Math.min(...vals) : 0;

  const consistency = vals.length >= 5 ? calculateConsistency(vals, verifiedCount) : null;

  const hiddenCount =
    allTimeCount !== null && allTimeCount > total * 1.2
      ? allTimeCount - total
      : 0;

  const linkParams: Record<string, string> = {};
  if (q)          linkParams.q          = q;
  if (jobTitle)   linkParams.job_title  = jobTitle;
  if (city)       linkParams.city       = city;
  if (industry)   linkParams.industry   = industry;
  if (experience) linkParams.experience = experience;
  if (sort)       linkParams.sort       = sort;
  if (period)     linkParams.period     = period;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* ── Fetch error ── */}
      {fetchError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-4 text-sm text-[#EF4444]">
          <span className="mt-0.5 shrink-0">⚠</span>
          <div>
            <p className="font-medium">Couldn&apos;t load salary data</p>
            <p className="mt-0.5 opacity-80">
              There was a problem connecting to the database. Please refresh the page.
            </p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-bold text-[#0F172A]">Search Salaries</h1>
        <p className="text-sm text-[#64748B]">
          Browse anonymous salary data from Pakistani professionals.
        </p>
      </div>

      {/* ── Filter card ── */}
      <div className="mb-8 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <form action="/search" method="GET" className="space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search job title or company..."
              className={
                "h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] " +
                "outline-none placeholder:text-[#94A3B8] transition-all duration-200 " +
                "focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20"
              }
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select name="city" defaultValue={city} className={SELECT_CLS}>
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select name="industry" defaultValue={industry} className={SELECT_CLS}>
              <option value="">All Industries</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            <select name="experience" defaultValue={experience} className={SELECT_CLS}>
              <option value="">Any Experience</option>
              {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select name="period" defaultValue={period} className={SELECT_CLS}>
              {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Sort + submit */}
          <div className="flex gap-3">
            <select name="sort" defaultValue={sort} className={`${SELECT_CLS} flex-1 sm:max-w-[200px]`}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.97]"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Active job_title pill */}
      {jobTitle && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-[#64748B]">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-sm font-medium text-[#2563EB]">
            {jobTitle}
            <Link href="/search" className="opacity-60 hover:opacity-100" aria-label="Clear filter">
              ×
            </Link>
          </span>
        </div>
      )}

      {/* ── Stats cards ── */}
      {hasResults && (
        <div className={`mb-4 grid grid-cols-2 gap-3 ${verifiedCount > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
          {[
            { label: "Results Found",  value: total.toLocaleString(),    accent: "#2563EB" },
            { label: "Average Salary", value: formatSalary(avgSal),      accent: "#10B981" },
            { label: "Highest Salary", value: formatSalary(maxSal),      accent: "#10B981" },
            { label: "Lowest Salary",  value: formatSalary(minSal),      accent: "#F59E0B" },
            ...(verifiedCount > 0 ? [{ label: "Verified", value: verifiedCount.toLocaleString(), accent: "#10B981" }] : []),
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border-l-4 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              style={{ borderLeftColor: stat.accent }}
            >
              <p className="flex items-center gap-1 text-xs text-[#94A3B8]">
                {stat.label === "Verified" && <ShieldCheck className="h-3 w-3 text-[#10B981]" />}
                {stat.label}
              </p>
              <p className="mt-0.5 truncate text-base font-bold tabular-nums text-[#0F172A]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Period note */}
      {hasResults && (
        <p className="mb-3 text-xs text-[#94A3B8]">
          Showing data from <span className="font-medium text-[#64748B]">{periodLabel(period)}</span>.
        </p>
      )}

      {/* All-time tip */}
      {hasResults && hiddenCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          <span className="mt-0.5 shrink-0">💡</span>
          <span>
            Tip: Select &quot;All Time&quot; to see{" "}
            <strong>{hiddenCount.toLocaleString()} more submission{hiddenCount !== 1 ? "s" : ""}</strong>.
          </span>
        </div>
      )}

      {/* Consistency badge */}
      {hasResults && consistency && total >= 5 && (
        <div className="mb-3">
          <ConsistencyBadge consistency={consistency} />
        </div>
      )}

      {/* Experience breakdown */}
      {hasResults && total >= 3 && (
        <ExperienceBreakdown salaries={salaries} />
      )}

      {/* ── Empty state ── */}
      {!hasResults ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Users className="h-10 w-10 text-[#CBD5E1]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">No salaries found</h2>
          <p className="mb-6 max-w-sm text-sm text-[#64748B]">
            {hasFilters
              ? "Try broadening your filters or changing your search terms."
              : "No salaries have been submitted yet."}
          </p>
          <Link
            href="/submit"
            className="rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1D4ED8]"
          >
            Submit the first salary
          </Link>
        </div>
      ) : (
        <>
          {/* ── Results list ── */}
          <div className="space-y-3">
            {results.map((s) => (
              <div
                key={s.id}
                className="group relative rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: title + company */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-[#0F172A]">{s.job_title}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{s.company}</span>
                    </div>
                  </div>

                  {/* Center: badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                      <MapPin className="h-3 w-3" />
                      {s.city}
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                      {s.experience_years}+ yrs
                    </span>
                    {s.is_remote && (
                      <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                        Remote
                      </span>
                    )}
                  </div>

                  {/* Right: salary + time + flag */}
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-xl font-bold tabular-nums text-[#10B981]">
                      {formatSalary(s.monthly_salary_pkr)}
                      <span className="ml-1 text-xs font-normal text-[#94A3B8]">/mo</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <Clock className="h-3 w-3" />
                        {timeAgo(s.submitted_at)}
                      </span>
                      {s.is_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#10B981]">
                          <ShieldCheck className="h-3 w-3" />
                          Work Email Verified
                        </span>
                      )}
                      <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <FlagButton id={s.id} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-3"
            >
              {page > 1 ? (
                <Link
                  href={pageUrl(linkParams, page - 1)}
                  className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#0F172A] transition-all hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] px-5 text-sm font-medium text-[#CBD5E1]">
                  ← Previous
                </span>
              )}

              <span className="text-sm text-[#94A3B8]">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={pageUrl(linkParams, page + 1)}
                  className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#0F172A] transition-all hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  Next →
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] px-5 text-sm font-medium text-[#CBD5E1]">
                  Next →
                </span>
              )}
            </nav>
          )}
        </>
      )}

      <SalaryComparison />
      <BackToTop />
    </div>
  );
}