import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { Company } from "@/lib/types";
import CompaniesFilters from "@/components/CompaniesFilters";

export const revalidate = 0;

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Browse companies listed on TankhwaMeter with their locations and salary roles.",
  openGraph: {
    title: "Companies — TankhwaMeter",
    description:
      "Browse companies listed on TankhwaMeter with their locations and salary roles.",
  },
};

type CompanyRoleRow = {
  company_id: string;
  role_name: string;
};

type CompanyGroup = {
  name: string;
  locations: string[];
  industries: string[];
  companyIds: string[];
  roles: string[];
};

const PAGE_SIZE = 12;
const COMPANIES_FETCH_CHUNK = 1000;

function str(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

function companiesUrl(params: Record<string, string>, page: number): string {
  const q = new URLSearchParams({ ...params, page: String(page) }).toString();
  return q ? `/companies?${q}` : "/companies";
}

async function getCompaniesWithRoles(filters: {
  q: string;
  city: string;
  industry: string;
  page: number;
}): Promise<{
  companies: CompanyGroup[];
  totalCount: number;
  cities: string[];
  industries: string[];
  error: boolean;
}> {
  const supabase = serverClient();
  async function fetchCompaniesChunked(applyFilter: boolean): Promise<{
    data: Company[];
    error: boolean;
  }> {
    const rows: Company[] = [];
    for (let offset = 0; ; offset += COMPANIES_FETCH_CHUNK) {
      let query = supabase
        .from("companies")
        .select("id, name, industry, city, size, created_at")
        .order("name")
        .range(offset, offset + COMPANIES_FETCH_CHUNK - 1);

      if (applyFilter) {
        if (filters.q) query = query.ilike("name", `%${filters.q}%`);
        if (filters.city) query = query.eq("city", filters.city);
        if (filters.industry) query = query.eq("industry", filters.industry);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: true };
      const chunk = (data ?? []) as Company[];
      rows.push(...chunk);
      if (chunk.length < COMPANIES_FETCH_CHUNK) break;
    }
    return { data: rows, error: false };
  }

  const [filteredCompaniesRes, allCompaniesRes] = await Promise.all([
    fetchCompaniesChunked(true),
    fetchCompaniesChunked(false),
  ]);

  if (filteredCompaniesRes.error) {
    return { companies: [], totalCount: 0, cities: [], industries: [], error: true };
  }

  const companiesData = filteredCompaniesRes.data;
  const allRows = allCompaniesRes.data;
  const cities = Array.from(
    new Set(
      allRows
        .map((r) => String(r.city ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const industries = Array.from(
    new Set(
      allRows
        .map((r) => String(r.industry ?? "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const groupsMap = new Map<string, {
    name: string;
    locations: Set<string>;
    industries: Set<string>;
    companyIds: string[];
  }>();

  for (const row of companiesData as Company[]) {
    const key = row.name.trim().toLowerCase();
    if (!key) continue;
    const existing = groupsMap.get(key) ?? {
      name: row.name.trim(),
      locations: new Set<string>(),
      industries: new Set<string>(),
      companyIds: [],
    };
    if (row.city?.trim()) existing.locations.add(row.city.trim());
    if (row.industry?.trim()) existing.industries.add(row.industry.trim());
    existing.companyIds.push(row.id);
    groupsMap.set(key, existing);
  }

  const allGroups = Array.from(groupsMap.values())
    .map((group) => ({
      ...group,
      locations: Array.from(group.locations).sort((a, b) => a.localeCompare(b)),
      industries: Array.from(group.industries).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalCount = allGroups.length;
  if (totalCount === 0) {
    return { companies: [], totalCount: 0, cities, industries, error: false };
  }

  const offset = (filters.page - 1) * PAGE_SIZE;
  const pageGroups = allGroups.slice(offset, offset + PAGE_SIZE);
  const companyIds = pageGroups.flatMap((group) => group.companyIds);

  const { data: rolesData, error: rolesError } = await supabase
    .from("company_roles")
    .select("company_id, role_name")
    .in("company_id", companyIds);

  if (rolesError) {
    return { companies: [], totalCount: 0, cities, industries, error: true };
  }

  const rolesByCompanyId = new Map<string, Set<string>>();
  for (const row of (rolesData ?? []) as CompanyRoleRow[]) {
    const role = row.role_name?.trim();
    if (!role) continue;
    const existing = rolesByCompanyId.get(row.company_id) ?? new Set<string>();
    existing.add(role);
    rolesByCompanyId.set(row.company_id, existing);
  }

  const companies: CompanyGroup[] = pageGroups.map((group) => {
    const roleSet = new Set<string>();
    for (const companyId of group.companyIds) {
      for (const role of rolesByCompanyId.get(companyId) ?? []) {
        roleSet.add(role);
      }
    }

    return {
      name: group.name,
      locations: group.locations,
      industries: group.industries,
      companyIds: group.companyIds,
      roles: Array.from(roleSet).sort((a, b) => a.localeCompare(b)),
    };
  });

  return { companies, totalCount, cities, industries, error: false };
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const q = str(raw.q);
  const city = str(raw.city);
  const industry = str(raw.industry);
  const page = Math.max(1, Number(str(raw.page)) || 1);

  const { companies, totalCount, cities, industries, error } = await getCompaniesWithRoles({
    q,
    city,
    industry,
    page,
  });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const activeParams: Record<string, string> = {};
  if (q) activeParams.q = q;
  if (city) activeParams.city = city;
  if (industry) activeParams.industry = industry;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold text-[#0F172A]">Listed Companies</h1>
        <p className="text-sm text-[#64748B]">
          See which companies are currently in the salary dataset, where they are listed, and which roles are available.
        </p>
      </div>

      <CompaniesFilters
        values={{ q, city, industry }}
        cities={cities}
        industries={industries}
      />

      {error ? (
        <div className="rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
          Couldn&apos;t load companies right now. Please refresh and try again.
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white px-6 py-10 text-center">
          <p className="font-medium text-[#0F172A]">No companies listed yet</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Companies will appear here as salary submissions are added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {companies.map((company) => (
            <div
              key={company.name}
              className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-lg font-semibold text-[#0F172A]">{company.name}</p>
                <Link
                  href={`/search?company=${encodeURIComponent(company.name)}`}
                  className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#DBEAFE]"
                >
                  View salaries
                </Link>
              </div>

              <div className="mb-3 space-y-1.5 text-sm text-[#64748B]">
                <p className="mb-1 inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Locations
                </p>
                {company.locations.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">Unknown location</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {company.locations.map((location) => (
                      <span
                        key={`${company.name}-${location}`}
                        className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-medium text-[#475569]"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mb-1 mt-2 inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Industries
                </p>
                {company.industries.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">Unknown industry</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {company.industries.map((item) => (
                      <span
                        key={`${company.name}-${item}`}
                        className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#475569]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Roles
                </p>
                {company.roles.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">No roles mapped yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {company.roles.map((role) => (
                      <Link
                        key={`${company.name}-${role}`}
                        href={`/search?company=${encodeURIComponent(company.name)}&job_title=${encodeURIComponent(role)}`}
                        className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB]"
                      >
                        {role}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!error && totalPages > 1 && (
        <nav aria-label="Companies pagination" className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={companiesUrl(activeParams, page - 1)}
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
              href={companiesUrl(activeParams, page + 1)}
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
    </div>
  );
}
