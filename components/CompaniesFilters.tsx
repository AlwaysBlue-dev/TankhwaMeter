"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const INPUT_CLS =
  "h-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#0F172A] " +
  "outline-none focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20";

const SELECT_CLS =
  "h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] " +
  "outline-none focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20";

type Props = {
  values: {
    q: string;
    city: string;
    industry: string;
  };
  cities: string[];
  industries: string[];
};

export default function CompaniesFilters({ values, cities, industries }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(values.q);
  const [city, setCity] = useState(values.city);
  const [industry, setIndustry] = useState(values.industry);

  const hasFilters = useMemo(() => !!(q || city || industry), [q, city, industry]);

  useEffect(() => {
    setQ(values.q);
    setCity(values.city);
    setIndustry(values.industry);
  }, [values.q, values.city, values.industry]);

  function updateUrl(next: { q?: string; city?: string; industry?: string }) {
    const nextQ = next.q ?? q;
    const nextCity = next.city ?? city;
    const nextIndustry = next.industry ?? industry;
    const params = new URLSearchParams();

    if (nextQ) params.set("q", nextQ);
    if (nextCity) params.set("city", nextCity);
    if (nextIndustry) params.set("industry", nextIndustry);

    const query = params.toString();
    router.replace(query ? `/companies?${query}` : "/companies", { scroll: false });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== values.q) updateUrl({ q });
    }, 350);
    return () => clearTimeout(timer);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company name..."
          className={INPUT_CLS}
        />

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
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
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
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-start sm:justify-end">
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.replace("/companies", { scroll: false })}
              className="inline-flex h-10 items-center rounded-lg border border-[#E2E8F0] px-4 text-sm font-medium text-[#64748B] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
