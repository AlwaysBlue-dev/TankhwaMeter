import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Config ─────────────────────────────────────────────────────────────────────

const ALLOWED_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Multan",
  "Remote",
] as const;

const MAX_PER_IP    = 3;
const WINDOW_MS     = 24 * 60 * 60 * 1000; // 24 hours

// ── Supabase (server-side) ─────────────────────────────────────────────────────
// Uses service role key so it bypasses RLS for trusted server operations.
// Falls back to anon key during local dev when service key isn't set.

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── IP extraction ──────────────────────────────────────────────────────────────

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ── Validation ─────────────────────────────────────────────────────────────────

type FieldError = { field: string; message: string };

function validate(body: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];

  const jobTitle = String(body.job_title ?? "").trim();
  if (!jobTitle)             errors.push({ field: "job_title", message: "Job title is required." });
  else if (jobTitle.length < 2)  errors.push({ field: "job_title", message: "Job title must be at least 2 characters." });
  else if (jobTitle.length > 100) errors.push({ field: "job_title", message: "Job title must be 100 characters or less." });

  const company = String(body.company ?? "").trim();
  if (!company)              errors.push({ field: "company", message: "Company is required." });
  else if (company.length < 2)   errors.push({ field: "company", message: "Company must be at least 2 characters." });
  else if (company.length > 100) errors.push({ field: "company", message: "Company must be 100 characters or less." });

  const salary = Number(body.monthly_salary_pkr);
  if (!body.monthly_salary_pkr && body.monthly_salary_pkr !== 0) {
    errors.push({ field: "monthly_salary_pkr", message: "Salary is required." });
  } else if (isNaN(salary) || salary < 5_000 || salary > 5_000_000) {
    errors.push({ field: "monthly_salary_pkr", message: "Salary must be between PKR 5,000 and 5,000,000." });
  }

  const exp = Number(body.experience_years);
  if (body.experience_years === undefined || body.experience_years === null || body.experience_years === "") {
    errors.push({ field: "experience_years", message: "Experience is required." });
  } else if (isNaN(exp) || exp < 0 || exp > 50) {
    errors.push({ field: "experience_years", message: "Experience must be between 0 and 50 years." });
  }

  const city = String(body.city ?? "");
  if (!(ALLOWED_CITIES as readonly string[]).includes(city)) {
    errors.push({ field: "city", message: "Please select a valid city." });
  }

  return errors;
}

// ── POST handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── 1. Honeypot — silent rejection for bots ────────────────────────────────
  if (body.website) {
    // Return a fake success so the bot thinks it worked
    return Response.json({ id: "ok" }, { status: 201 });
  }

  // ── 2. Validation ──────────────────────────────────────────────────────────
  const errors = validate(body);
  if (errors.length > 0) {
    return Response.json({ errors }, { status: 422 });
  }

  const supabase = serverClient();
  const ip       = getIp(request);

  // ── 3. Rate limiting ───────────────────────────────────────────────────────
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("submission_logs")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("submitted_at", windowStart);

  if ((count ?? 0) >= MAX_PER_IP) {
    return Response.json(
      { error: "Too many submissions. Please wait 24 hours." },
      { status: 429 }
    );
  }

  // ── 4. Outlier flagging ────────────────────────────────────────────────────
  const salary     = Number(body.monthly_salary_pkr);
  const is_flagged = salary > 1_500_000 || salary < 8_000;

  // ── 5. Insert salary ───────────────────────────────────────────────────────
  const isVerified     = body.is_verified === true;
  const verifiedDomain = isVerified ? String(body.verified_domain ?? "").trim() || null : null;
  if (isVerified) console.info("[submit-salary] verified submission received");

  const { data, error: salaryError } = await supabase
    .from("salaries")
    .insert({
      job_title:          String(body.job_title).trim(),
      company:            String(body.company).trim(),
      industry:           String(body.industry   ?? "").trim(),
      city:               String(body.city),
      experience_years:   Number(body.experience_years),
      monthly_salary_pkr: salary,
      education:          String(body.education  ?? ""),
      is_remote:          Boolean(body.is_remote),
      is_flagged,
      is_verified:        isVerified,
      verified_domain:    verifiedDomain,
    })
    .select("id")
    .single();

  if (salaryError) {
    console.error("[submit-salary] insert error:", salaryError.message);
    return Response.json({ error: "Failed to save submission." }, { status: 500 });
  }

  // ── 6. Log IP (fire-and-forget; never block the success response) ──────────
  supabase
    .from("submission_logs")
    .insert({ ip_address: ip })
    .then(({ error }) => {
      if (error) console.error("[submit-salary] log error:", error.message);
    });

  return Response.json({ id: data.id }, { status: 201 });
}
