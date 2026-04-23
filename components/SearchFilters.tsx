"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { JobCategory } from "@/lib/types";

const SELECT_CLS =
  "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] " +
  "outline-none transition-all duration-200 " +
  "focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 " +
  "disabled:opacity-50";

type Props = {
  categories: JobCategory[];
  values: {
    q: string;
    city: string;
    industry: string;
    experience: string;
    period: string;
    sort: string;
    company: string;
    jobTitle: string;
  };
};

export default function SearchFilters({ categories, values }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(values.q);
  const [city, setCity] = useState(values.city);
  const [industry, setIndustry] = useState(values.industry);
  const [experience, setExperience] = useState(values.experience);
  const [period, setPeriod] = useState(values.period);
  const [sort, setSort] = useState(values.sort || "recent");

  const hasActiveFilters = useMemo(
    () =>
      !!(
        q ||
        city ||
        industry ||
        experience ||
        period ||
        (sort && sort !== "recent") ||
        values.company ||
        values.jobTitle
      ),
    [q, city, industry, experience, period, sort, values.company, values.jobTitle]
  );

  useEffect(() => {
    setQ(values.q);
    setCity(values.city);
    setIndustry(values.industry);
    setExperience(values.experience);
    setPeriod(values.period);
    setSort(values.sort || "recent");
  }, [values.q, values.city, values.industry, values.experience, values.period, values.sort]);

  function updateUrl(next: {
    q?: string;
    city?: string;
    industry?: string;
    experience?: string;
    period?: string;
    sort?: string;
  }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextCity = next.city ?? city;
    const nextIndustry = next.industry ?? industry;
    const nextExperience = next.experience ?? experience;
    const nextPeriod = next.period ?? period;
    const nextSort = next.sort ?? sort;

    if (nextQ) params.set("q", nextQ);
    if (values.jobTitle) params.set("job_title", values.jobTitle);
    if (values.company) params.set("company", values.company);
    if (nextCity) params.set("city", nextCity);
    if (nextIndustry) params.set("industry", nextIndustry);
    if (nextExperience) params.set("experience", nextExperience);
    if (nextPeriod) params.set("period", nextPeriod);
    if (nextSort && nextSort !== "recent") params.set("sort", nextSort);

    const query = params.toString();
    router.replace(query ? `/search?${query}` : "/search", { scroll: false });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== values.q) {
        updateUrl({ q });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search job title or company..."
          className={
            "h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] " +
            "outline-none placeholder:text-[#94A3B8] transition-all duration-200 " +
            "focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={city}
          onChange={(e) => {
            const v = e.target.value;
            setCity(v);
            updateUrl({ city: v });
          }}
          className={SELECT_CLS}
        >
          <option value="">All Cities</option>
          {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan", "Remote"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={industry}
          onChange={(e) => {
            const v = e.target.value;
            setIndustry(v);
            updateUrl({ industry: v });
          }}
          className={SELECT_CLS}
        >
          <option value="">All Industries</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select
          value={experience}
          onChange={(e) => {
            const v = e.target.value;
            setExperience(v);
            updateUrl({ experience: v });
          }}
          className={SELECT_CLS}
        >
          <option value="">Any Experience</option>
          <option value="0">0–1 year</option>
          <option value="1">1–3 years</option>
          <option value="3">3–5 years</option>
          <option value="5">5–10 years</option>
          <option value="10">10+ years</option>
        </select>

        <select
          value={period}
          onChange={(e) => {
            const v = e.target.value;
            setPeriod(v);
            updateUrl({ period: v });
          }}
          className={SELECT_CLS}
        >
          <option value="">All Time</option>
          <option value="3mo">Last 3 Months</option>
          <option value="6mo">Last 6 Months</option>
          <option value="12mo">Last 12 Months</option>
        </select>
      </div>

      <div className="flex gap-3">
        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            updateUrl({ sort: v });
          }}
          className={`${SELECT_CLS} flex-1 sm:max-w-[200px]`}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Salary</option>
          <option value="lowest">Lowest Salary</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.replace("/search", { scroll: false })}
            className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            Remove all filters (Show all)
          </button>
        )}
      </div>
    </div>
  );
}
