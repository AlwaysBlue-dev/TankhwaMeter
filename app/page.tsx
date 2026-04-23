import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Building2,
  MapPin,
  Briefcase,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Salary } from "@/lib/types";
import FAQ from "@/components/FAQ";
import { formatSalary, timeAgo } from "@/lib/utils/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "PK Salary Compass — Know Your Worth in Pakistan",
  openGraph: { title: "PK Salary Compass — Know Your Worth in Pakistan" },
};

const INDUSTRIES = [
  "Software Engineering",
  "Banking",
  "Marketing",
  "Healthcare",
  "Education",
  "Data Science",
  "Finance",
  "Sales",
];

const HOW_IT_WORKS = [
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Submit Anonymously",
    description: "Share your salary without revealing your identity. No account required — just honest data.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Browse Salaries",
    description: "Filter by city, industry, and experience to find data that's actually relevant to you.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Negotiate with Confidence",
    description: "Walk into your next salary negotiation backed by real market data, not guesswork.",
  },
];

async function getStats() {
  const [submissionsRes, companiesRes, citiesRes, salaryRes] = await Promise.all([
    supabase.from("salaries").select("id", { count: "exact", head: true }),
    supabase.from("salaries").select("company").limit(2000),
    supabase.from("salaries").select("city").limit(2000),
    supabase.from("salaries").select("monthly_salary_pkr").eq("is_flagged", false).limit(1000),
  ]);

  const totalSubmissions = submissionsRes.count ?? 0;
  const uniqueCompanies = new Set((companiesRes.data ?? []).map((r) => r.company)).size;
  const uniqueCities = new Set((citiesRes.data ?? []).map((r) => r.city)).size;
  const vals = (salaryRes.data ?? []).map((r) => r.monthly_salary_pkr as number);
  const avgSalary = vals.length
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : 0;

  return { totalSubmissions, uniqueCompanies, uniqueCities, avgSalary };
}

async function getRecentSalaries(): Promise<Salary[]> {
  const { data } = await supabase
    .from("salaries")
    .select("*")
    .eq("is_flagged", false)
    .order("submitted_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

type TopRole = { job_title: string; avg_salary: number; count: number };

async function getTopRoles(): Promise<TopRole[]> {
  const { data } = await supabase
    .from("salaries")
    .select("job_title, monthly_salary_pkr")
    .eq("is_flagged", false)
    .limit(2000);

  if (!data || data.length === 0) return [];

  const groups = new Map<string, number[]>();
  for (const row of data) {
    const arr = groups.get(row.job_title) ?? [];
    arr.push(row.monthly_salary_pkr as number);
    groups.set(row.job_title, arr);
  }

  return Array.from(groups.entries())
    .map(([job_title, v]) => ({
      job_title,
      avg_salary: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
      count: v.length,
    }))
    .sort((a, b) => b.avg_salary - a.avg_salary)
    .slice(0, 5);
}

export default async function Home() {
  const [stats, recentSalaries, topRoles] = await Promise.all([
    getStats(),
    getRecentSalaries(),
    getTopRoles(),
  ]);

  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-grid relative flex min-h-[85vh] items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-1.5 text-sm font-medium text-[#2563EB]">
            <span>🇵🇰</span>
            <span>Built for Pakistan</span>
          </div>

          {/* Heading */}
          <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-6xl lg:text-7xl">
            Know Your Worth
            <br />
            <span className="text-[#2563EB]">in Pakistan</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-[#64748B]">
            Real salary data from Pakistani professionals — anonymous,
            crowdsourced, and always free. Make informed career decisions backed
            by numbers you can trust.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#2563EB] px-8 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)] hover:scale-[1.03] active:scale-[0.97]"
            >
              Browse Salaries
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/submit"
              className="inline-flex h-12 items-center rounded-full border-2 border-[#2563EB] bg-white px-8 text-sm font-semibold text-[#2563EB] transition-all duration-200 hover:bg-[#EFF6FF] hover:scale-[1.03] active:scale-[0.97]"
            >
              Submit Yours — It&apos;s Free
            </Link>
          </div>

          {/* Trust signals */}
          <p className="mt-6 text-xs text-[#94A3B8]">
            🔒 100% Anonymous&nbsp; · &nbsp;No signup required&nbsp; · &nbsp;Free forever
          </p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-0 -mt-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.10)] sm:grid-cols-4">
            {[
              { icon: <BarChart2 className="h-5 w-5 text-[#2563EB]" />, label: "Submissions", value: stats.totalSubmissions.toLocaleString() },
              { icon: <Building2 className="h-5 w-5 text-[#2563EB]" />, label: "Companies", value: stats.uniqueCompanies.toLocaleString() },
              { icon: <MapPin className="h-5 w-5 text-[#2563EB]" />, label: "Cities", value: stats.uniqueCities.toLocaleString() },
              { icon: <TrendingUp className="h-5 w-5 text-[#10B981]" />, label: "Avg Monthly Salary", value: stats.avgSalary > 0 ? formatSalary(stats.avgSalary) : "—" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 bg-white px-4 py-5 text-center">
                {stat.icon}
                <p className="text-xl font-bold text-[#0F172A] tabular-nums">{stat.value}</p>
                <p className="text-xs text-[#94A3B8]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-[#0F172A]">
            How It Works
          </h2>
          <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-3">
            {/* Connecting dashed line on desktop */}
            <div
              aria-hidden
              className="absolute left-1/6 right-1/6 top-8 hidden border-t-2 border-dashed border-[#E2E8F0] sm:block"
              style={{ left: "calc(16.67% + 24px)", right: "calc(16.67% + 24px)" }}
            />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#2563EB] bg-white text-[#2563EB]">
                  {step.icon}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-[#0F172A]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT SALARIES ──────────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                Recently Added
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Real data from Pakistani professionals
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentSalaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-20 text-center">
              <p className="font-medium text-[#0F172A]">No submissions yet</p>
              <p className="mt-1 text-sm text-[#64748B]">
                Be the first to share your salary.
              </p>
              <Link
                href="/submit"
                className="mt-4 inline-flex h-9 items-center rounded-full bg-[#2563EB] px-5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                Submit Salary
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentSalaries.map((s) => (
                <Link
                  key={s.id}
                  href={`/search?job_title=${encodeURIComponent(s.job_title)}`}
                  className="group block rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                >
                  {/* Top: title + city */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug text-[#0F172A] line-clamp-2">
                      {s.job_title}
                    </p>
                    <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                      {s.city}
                    </span>
                  </div>
                  {/* Middle: company + exp */}
                  <div className="mb-4 flex items-center gap-2 text-xs text-[#64748B]">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{s.company}</span>
                    <span aria-hidden>·</span>
                    <span>{s.experience_years}+ yrs</span>
                  </div>
                  {/* Bottom: salary + time */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-[#10B981]">
                        {formatSalary(s.monthly_salary_pkr)}
                      </p>
                      <p className="text-xs text-[#94A3B8]">per month</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                      <Clock className="h-3 w-3" />
                      {timeAgo(s.submitted_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TOP PAYING ROLES ─────────────────────────────────────────────────── */}
      {topRoles.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                Top Paying Roles
              </h2>
              <Link
                href="/search"
                className="flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
              >
                Browse all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              {topRoles.map((role, i) => (
                <Link
                  key={role.job_title}
                  href={`/search?job_title=${encodeURIComponent(role.job_title)}`}
                  className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F8FAFC] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#0F172A]">{role.job_title}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {role.count} {role.count === 1 ? "submission" : "submissions"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="font-bold tabular-nums text-[#10B981]">
                      {formatSalary(role.avg_salary)}
                    </p>
                    <ArrowRight className="h-4 w-4 text-[#94A3B8] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POPULAR INDUSTRIES ───────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-[#0F172A]">
            Explore by Industry
          </h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:pb-0">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry}
                href={`/search?industry=${encodeURIComponent(industry)}`}
                className="shrink-0 rounded-full border border-[#E2E8F0] bg-white px-5 py-2 text-sm font-medium text-[#64748B] transition-all duration-200 hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white"
              >
                {industry}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <div id="faq">
        <FAQ />
      </div>
    </div>
  );
}