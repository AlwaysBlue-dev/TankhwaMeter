"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  CheckCheck,
  Users,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobCategory } from "@/lib/types";
import { formatSalary } from "@/lib/utils/format";

// ── Static option lists ────────────────────────────────────────────────────────

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi",
  "Peshawar", "Quetta", "Multan", "Remote",
];

const EXPERIENCE_OPTIONS: { label: string; years: number }[] = [
  { label: "0 – 1 year", years: 0 },
  { label: "1 – 3 years", years: 1 },
  { label: "3 – 5 years", years: 3 },
  { label: "5 – 10 years", years: 5 },
  { label: "10+ years", years: 10 },
];

const EDUCATION_OPTIONS = ["Matric", "Intermediate", "Bachelor's", "Master's", "PhD"];

// ── Types ──────────────────────────────────────────────────────────────────────

type FormData = {
  job_title: string;
  company: string;
  industry: string;
  city: string;
  experience_years: string;
  monthly_salary_pkr: string;
  education: string;
  is_remote: boolean;
};

type FormErrors  = Partial<Record<keyof FormData | "submit", string>>;
type Status      = "idle" | "submitting" | "success" | "rate_limited";
type VerifyStep  = "card" | "sending" | "otp" | "verifying" | "verified" | "skipped";

const INITIAL_FORM: FormData = {
  job_title: "", company: "", industry: "", city: "",
  experience_years: "", monthly_salary_pkr: "", education: "", is_remote: false,
};

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.job_title.trim())  errors.job_title  = "Job title is required.";
  if (!data.company.trim())    errors.company    = "Company name is required.";
  if (!data.industry)          errors.industry   = "Please select an industry.";
  if (!data.city)              errors.city       = "Please select a city.";
  if (!data.experience_years)  errors.experience_years = "Please select your experience range.";
  if (!data.education)         errors.education  = "Please select your education level.";

  const salary = Number(data.monthly_salary_pkr);
  if (!data.monthly_salary_pkr.trim()) {
    errors.monthly_salary_pkr = "Monthly salary is required.";
  } else if (isNaN(salary) || salary < 5_000 || salary > 5_000_000) {
    errors.monthly_salary_pkr = "Salary must be between PKR 5,000 and PKR 5,000,000.";
  }
  return errors;
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[#0F172A]">{label}</Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SubmitForm() {
  const [form, setForm]             = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [status, setStatus]         = useState<Status>("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  // ── Verification state ────────────────────────────────────────────────────────
  const [verifyStep,     setVerifyStep]     = useState<VerifyStep>("card");
  const [verifyEmail,    setVerifyEmail]    = useState("");
  const [otpValue,       setOtpValue]       = useState("");
  const [verifyError,    setVerifyError]    = useState("");
  const [verifyLoading,  setVerifyLoading]  = useState(false);
  const [expiresAt,      setExpiresAt]      = useState(0);
  const [resendAfter,    setResendAfter]    = useState(0);
  const [tickNow,        setTickNow]        = useState(() => Date.now());
  const [verifiedDomain, setVerifiedDomain] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("job_categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (verifyStep !== "otp" && verifyStep !== "verifying") return;
    const interval = setInterval(() => setTickNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [verifyStep]);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function sendOtp() {
    setVerifyError("");
    setVerifyStep("sending");
    const res  = await fetch("/api/verify/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setVerifyError(data.error ?? "Failed to send code.");
      setVerifyStep("card");
      return;
    }
    setExpiresAt(Date.now() + 15 * 60 * 1000);
    setResendAfter(Date.now() + 60 * 1000);
    setOtpValue("");
    setVerifyStep("otp");
  }

  async function resendOtp() {
    setVerifyError("");
    setVerifyLoading(true);
    const res  = await fetch("/api/verify/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail }),
    });
    const data = await res.json();
    setVerifyLoading(false);
    if (!res.ok) {
      setVerifyError(data.error ?? "Failed to resend code.");
      return;
    }
    setExpiresAt(Date.now() + 15 * 60 * 1000);
    setResendAfter(Date.now() + 60 * 1000);
    setOtpValue("");
    setVerifyError("");
  }

  async function confirmOtp() {
    setVerifyError("");
    setVerifyStep("verifying");
    const res  = await fetch("/api/verify/confirm-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail, otp: otpValue }),
    });
    const data = await res.json();
    if (!data.verified) {
      setVerifyError(data.error ?? "Verification failed.");
      setVerifyStep("otp");
      return;
    }
    setVerifiedDomain(data.domain);
    setVerifyStep("verified");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setStatus("submitting");

    const res = await fetch("/api/submit-salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_title:          form.job_title.trim(),
        company:            form.company.trim(),
        industry:           form.industry,
        city:               form.city,
        experience_years:   Number(form.experience_years),
        monthly_salary_pkr: Number(form.monthly_salary_pkr),
        education:          form.education,
        is_remote:          form.is_remote,
        website:            honeypotRef.current?.value ?? "",
        is_verified:        verifyStep === "verified",
        verified_domain:    verifyStep === "verified" ? verifiedDomain : null,
      }),
    });

    if (res.status === 429) { setStatus("rate_limited"); return; }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (Array.isArray(body.errors)) {
        const fieldErrors: FormErrors = {};
        for (const e of body.errors as { field: string; message: string }[]) {
          (fieldErrors as Record<string, string>)[e.field] = e.message;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: body.error ?? "Something went wrong. Please try again." });
      }
      setStatus("idle");
      return;
    }

    setStatus("success");
  }

  // ── Rate limited ──────────────────────────────────────────────────────────────

  if (status === "rate_limited") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFFBEB]">
            <Clock className="h-10 w-10 text-[#F59E0B]" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">Slow down!</h1>
          <p className="mb-8 text-[#64748B]">
            You&apos;ve reached the limit of{" "}
            <strong className="text-[#0F172A]">3 submissions per 24 hours</strong>.
            Come back tomorrow!
          </p>
          <Link
            href="/search"
            className="rounded-full border-2 border-[#2563EB] px-6 py-2.5 text-sm font-semibold text-[#2563EB] transition-all hover:bg-[#EFF6FF]"
          >
            Browse existing salaries
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="animate-bounce-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#ECFDF5]">
            <CheckCircle2 className="h-12 w-12 text-[#10B981]" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-[#0F172A]">
            Thank you for contributing!
          </h1>
          <p className="mb-8 text-[#64748B] leading-relaxed">
            Your submission helps thousands of Pakistanis know their market
            value and negotiate better salaries.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/search"
              className="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1D4ED8]"
            >
              View Similar Salaries
            </Link>
            <button
              onClick={() => { setForm(INITIAL_FORM); setErrors({}); setStatus("idle"); }}
              className="rounded-full border-2 border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#64748B] transition-all hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  const secondsLeft   = (verifyStep === "otp" || verifyStep === "verifying") && expiresAt > 0
    ? Math.max(0, Math.floor((expiresAt - tickNow) / 1000))
    : 0;
  const timerDisplay  = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canResend     = (verifyStep === "otp" || verifyStep === "verifying") && resendAfter > 0 && tickNow >= resendAfter;

  const salaryNum = Number(form.monthly_salary_pkr);
  const salaryPreview =
    form.monthly_salary_pkr && !isNaN(salaryNum) && salaryNum >= 5000
      ? formatSalary(salaryNum)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">

        {/* ── LEFT: FORM ── */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#10B981]">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Anonymous
            </span>
            <h1 className="mb-1 text-3xl font-bold text-[#0F172A]">Submit Your Salary</h1>
            <p className="text-[#64748B]">Help thousands of Pakistanis know their worth.</p>
          </div>

          {/* ── Verification card ── */}
          {verifyStep === "skipped" ? (
            <p className="mb-4 text-xs text-[#94A3B8]">
              Submitting without verification — you can verify to earn a trust badge
            </p>
          ) : (
            <div className="mb-6 rounded-2xl border-l-4 border-[#10B981] bg-[#ECFDF5] p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#10B981]" />
                <h2 className="font-semibold text-[#065F46]">Verify your employment (optional)</h2>
              </div>

              {verifyStep === "verified" ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981]">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-[#065F46]">
                    Verified! Your submission will include a Work Email Verified badge.
                  </p>
                </div>
              ) : verifyStep === "otp" || verifyStep === "verifying" ? (
                <div>
                  <p className="mb-3 text-sm text-[#064E3B]">
                    Enter the 6-digit code we sent to your work email
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={otpValue}
                      onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "")); setVerifyError(""); }}
                      disabled={verifyStep === "verifying"}
                      className="h-11 w-32 rounded-lg border-[#A7F3D0] bg-white text-center text-xl font-bold tracking-widest focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                    />
                    <button
                      type="button"
                      onClick={confirmOtp}
                      disabled={otpValue.length !== 6 || verifyStep === "verifying"}
                      className="h-11 rounded-xl bg-[#10B981] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-50"
                    >
                      {verifyStep === "verifying"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : "Verify"}
                    </button>
                  </div>

                  {verifyError && (
                    <p className="mt-2 text-xs text-[#DC2626]">{verifyError}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#047857]">
                    {secondsLeft > 0 ? (
                      <span>Code expires in {timerDisplay}</span>
                    ) : (
                      <span className="text-[#DC2626]">Code expired — request a new one</span>
                    )}
                    {canResend && (
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={verifyLoading}
                        className="underline hover:no-underline disabled:opacity-50"
                      >
                        {verifyLoading ? "Sending…" : "Resend code"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-[#064E3B]">
                    Get a verified badge on your submission. We send a one-time code to your work email.
                    We never store your email.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="yourname@company.com"
                      value={verifyEmail}
                      onChange={(e) => { setVerifyEmail(e.target.value); setVerifyError(""); }}
                      disabled={verifyStep === "sending"}
                      className="h-11 flex-1 rounded-lg border-[#A7F3D0] bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={!verifyEmail.includes("@") || verifyStep === "sending"}
                      className="h-11 rounded-xl bg-[#10B981] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-50"
                    >
                      {verifyStep === "sending"
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : "Send Code"}
                    </button>
                  </div>

                  {verifyError && (
                    <p className="mt-2 text-xs text-[#DC2626]">{verifyError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setVerifyStep("skipped")}
                    className="mt-2.5 text-xs text-[#6EE7B7] transition-colors hover:text-[#065F46]"
                  >
                    Skip — submit without verification →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Card */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)] sm:p-8">
            {/* Honeypot */}
            <div aria-hidden="true" className="absolute -top-[9999px] left-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Job Title */}
              <Field label="Job Title" error={errors.job_title}>
                <Input
                  id="job_title"
                  list="job-title-suggestions"
                  placeholder="e.g. Software Engineer"
                  value={form.job_title}
                  onChange={(e) => setField("job_title", e.target.value)}
                  aria-invalid={!!errors.job_title || undefined}
                  className="h-12 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <datalist id="job-title-suggestions">
                  {categories.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </Field>

              {/* Company */}
              <Field label="Company Name" error={errors.company}>
                <Input
                  id="company"
                  placeholder="e.g. Systems Limited"
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  aria-invalid={!!errors.company || undefined}
                  className="h-12 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </Field>

              {/* Industry */}
              <Field label="Industry" error={errors.industry}>
                <Select value={form.industry} onValueChange={(v) => setField("industry", v)}>
                  <SelectTrigger className="h-12 w-full rounded-lg border-[#E2E8F0] bg-[#F8FAFC]" aria-invalid={!!errors.industry || undefined}>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* City + Experience */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="City" error={errors.city}>
                  <Select value={form.city} onValueChange={(v) => setField("city", v)}>
                    <SelectTrigger className="h-12 w-full rounded-lg border-[#E2E8F0] bg-[#F8FAFC]" aria-invalid={!!errors.city || undefined}>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Years of Experience" error={errors.experience_years}>
                  <Select value={form.experience_years} onValueChange={(v) => setField("experience_years", v)}>
                    <SelectTrigger className="h-12 w-full rounded-lg border-[#E2E8F0] bg-[#F8FAFC]" aria-invalid={!!errors.experience_years || undefined}>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <SelectItem key={o.years} value={String(o.years)}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Salary + Education */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Monthly Salary (PKR)" error={errors.monthly_salary_pkr}>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="e.g. 150000"
                    min={5000}
                    max={5000000}
                    value={form.monthly_salary_pkr}
                    onChange={(e) => setField("monthly_salary_pkr", e.target.value)}
                    aria-invalid={!!errors.monthly_salary_pkr || undefined}
                    className="h-12 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                  {salaryPreview && !errors.monthly_salary_pkr && (
                    <p className="text-xs font-semibold text-[#10B981]">= {salaryPreview}</p>
                  )}
                  {!salaryPreview && !errors.monthly_salary_pkr && (
                    <p className="text-xs text-[#94A3B8]">Between PKR 5,000 and 5,000,000</p>
                  )}
                </Field>

                <Field label="Education" error={errors.education}>
                  <Select value={form.education} onValueChange={(v) => setField("education", v)}>
                    <SelectTrigger className="h-12 w-full rounded-lg border-[#E2E8F0] bg-[#F8FAFC]" aria-invalid={!!errors.education || undefined}>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Remote toggle */}
              <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5">
                <Checkbox
                  id="is_remote"
                  checked={form.is_remote}
                  onCheckedChange={(checked) => setField("is_remote", checked === true)}
                  className="border-[#E2E8F0]"
                />
                <Label htmlFor="is_remote" className="cursor-pointer font-normal text-[#64748B]">
                  This is a remote position
                </Label>
              </div>

              {errors.submit && (
                <div className="flex items-start gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] active:scale-[0.98] disabled:opacity-60"
              >
                {status === "submitting" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                ) : (
                  "Submit Anonymously"
                )}
              </button>

              <p className="text-center text-xs text-[#94A3B8]">
                By submitting you agree this data is truthful and will be shared
                anonymously with the community.
              </p>
            </form>
          </div>
        </div>

        {/* ── RIGHT: INFO PANEL ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Why This Matters */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <h3 className="mb-4 font-semibold text-[#0F172A]">Why This Matters</h3>
            <ul className="space-y-3">
              {[
                { icon: <Users className="h-4 w-4 text-[#10B981]" />, text: "Used by 1,000s of Pakistani professionals" },
                { icon: <TrendingUp className="h-4 w-4 text-[#10B981]" />, text: "Helps workers negotiate better salaries" },
                { icon: <CheckCheck className="h-4 w-4 text-[#10B981]" />, text: "100% free, always" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-[#64748B]">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Your Privacy */}
          <div className="rounded-2xl bg-[#EFF6FF] p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-[#2563EB]" />
              <h3 className="font-semibold text-[#0F172A]">Your Privacy</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#64748B]">
              We collect zero identifying information. No name, email, or phone.
              Your IP is used only to prevent spam and is never stored. We
              couldn&apos;t identify you even if we wanted to.
            </p>
          </div>

          {/* Submission Guidelines */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-3 font-semibold text-[#0F172A]">Quick Guidelines</h3>
            <ul className="space-y-2">
              {[
                "Submit your current or most recent salary",
                "Select the most accurate job title",
                "Don't submit the same role multiple times",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-[#64748B]">
                  <span className="mt-0.5 text-[#10B981]">✓</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}