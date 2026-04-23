import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Target,
  UserCheck,
  ShieldAlert,
  EyeOff,
  Filter,
  Clock,
  BarChart2,
  Flag,
  Lock,
  Ban,
  Globe,
  ArrowRight,
  Shield,
  ShieldCheck,
} from "lucide-react";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "How It Works & Community Guidelines",
  description:
    "Learn how TankhwaMeter collects, verifies, and protects anonymous salary data from Pakistani professionals.",
  openGraph: {
    title: "How It Works & Community Guidelines — TankhwaMeter",
    description:
      "Learn how TankhwaMeter collects, verifies, and protects anonymous salary data from Pakistani professionals.",
  },
};

const SUBMISSION_RULES = [
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Be honest",
    description:
      "Submit your actual current or most recent salary. Inflated or deflated numbers hurt the community you're part of.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Be specific",
    description:
      "Select the most accurate job title and industry. Vague entries are less useful to others searching for their exact role.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "One submission per role",
    description:
      "Don't submit the same job multiple times. If your salary changes or you move to a new role, submit a fresh entry instead.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: <ShieldAlert className="h-5 w-5" />,
    title: "No fake data",
    description:
      "Intentionally false submissions hurt everyone — including you. Our statistical systems detect and remove outliers automatically.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: <EyeOff className="h-5 w-5" />,
    title: "Respect privacy",
    description:
      "Never include identifying information about yourself or colleagues. The platform is built on anonymity — protect it.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

const PROTECTION_STEPS = [
  {
    icon: <Filter className="h-5 w-5 text-[#2563EB]" />,
    title: "Automatic outlier detection",
    description:
      "Salaries outside realistic ranges for a given role are automatically flagged and withheld from public view until reviewed.",
  },
  {
    icon: <Clock className="h-5 w-5 text-[#2563EB]" />,
    title: "Rate limiting",
    description:
      "A maximum of 3 submissions per IP per day prevents coordinated spam. Bots are filtered by a honeypot field invisible to real users.",
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-[#2563EB]" />,
    title: "Statistical confidence scoring",
    description:
      "Every search result shows a confidence badge — High, Medium, or Low — based on how tightly submissions cluster around the median.",
  },
  {
    icon: <Flag className="h-5 w-5 text-[#2563EB]" />,
    title: "Community flagging",
    description:
      "Every salary card has a Report button. When something looks suspicious, the community can flag it for review instantly.",
  },
];

const COMMITMENT_ITEMS = [
  { icon: <Lock className="h-5 w-5" />,       text: "We never collect your name or email address." },
  { icon: <Ban className="h-5 w-5" />,        text: "We never sell individual salary data to third parties." },
  { icon: <EyeOff className="h-5 w-5" />,     text: "We never share data that could identify a specific person." },
  { icon: <Globe className="h-5 w-5" />,      text: "The aggregate data is always free to browse — no account, no paywall." },
  { icon: <ShieldCheck className="h-5 w-5" />, text: "When you verify with a work email, only your company domain (e.g. systemslimited.com) is saved — your full email address is never stored or logged." },
];

export default function TrustPage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── dark navy */}
      <section className="bg-[#0F172A] px-4 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]/20">
              <Shield className="h-7 w-7 text-[#3B82F6]" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-5xl">
            Transparency is how
            <br />
            we build trust
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#94A3B8]">
            Everything about how we collect, protect, and present salary data —
            openly explained.
          </p>
        </div>
      </section>

      {/* ── SECTION 1: HOW OUR DATA WORKS ── white */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
            How Our Data Works
          </h2>
          <div className="space-y-4 text-base leading-[1.8] text-[#64748B]">
            <p>
              PK Salary Compass is built on crowdsourced salary data — the same
              model used by Glassdoor and Levels.fyi globally. Individual
              submissions don't need to be verified because the{" "}
              <strong className="text-[#0F172A]">
                patterns across hundreds of submissions
              </strong>{" "}
              are what matters.
            </p>
            <p>
              When 50 software engineers in Karachi independently report similar
              salaries, that pattern is statistically meaningful — even if any
              single number could be slightly off. Outliers are caught by our
              confidence scoring and flagging systems, leaving you with data you
              can actually use to negotiate.
            </p>
            <p>
              No human reviewer reads your submission. No one stores your name
              or email. The process is designed so that{" "}
              <strong className="text-[#0F172A]">
                we couldn't identify you even if we wanted to.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: SUBMISSION RULES ── light gray */}
      <section className="bg-[#F8FAFC] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-[#0F172A]">
            Our Submission Rules
          </h2>
          <p className="mb-10 text-[#64748B]">
            These rules exist to protect the community, not to police you.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SUBMISSION_RULES.map((rule) => (
              <div
                key={rule.title}
                className="flex gap-4 rounded-xl border-l-4 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderLeftColor: rule.color }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: rule.bg, color: rule.color }}
                >
                  {rule.icon}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-[#0F172A]">{rule.title}</p>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW WE PROTECT DATA ── white */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-[#0F172A]">
            How We Protect Data Quality
          </h2>
          <p className="mb-10 text-[#64748B]">
            Four layers of protection work together to keep the data you see accurate.
          </p>
          <div className="space-y-0">
            {PROTECTION_STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    {step.icon}
                  </div>
                  {i < PROTECTION_STEPS.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-[#E2E8F0]" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="mb-1 font-semibold text-[#0F172A]">{step.title}</p>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHY COMPANIES DENY ── light gray */}
      <section className="bg-[#F8FAFC] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
            Why Companies Deny This Data
          </h2>
          <div className="space-y-4 text-base leading-[1.8] text-[#64748B]">
            <p>
              There is a simple reason companies prefer you don't know what your
              colleagues earn:{" "}
              <strong className="text-[#0F172A]">
                information asymmetry is profitable.
              </strong>{" "}
              When you don't know the market rate, you're more likely to accept a
              low offer or stay in a role that underpays you.
            </p>
            <p>
              Glassdoor and Levels.fyi faced the same pushback when they launched
              in Western markets. Companies called their data "inaccurate,"
              "misleading," and "harmful to business." Today, those platforms have
              hundreds of millions of users and are considered essential tools for
              anyone navigating their career.
            </p>
            <p>
              The pattern repeats every time salary transparency expands:{" "}
              <strong className="text-[#0F172A]">
                companies resist, workers benefit.
              </strong>{" "}
              Pakistani professionals deserve the same advantage their counterparts
              in other markets already have.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: OUR COMMITMENT ── white */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-[#0F172A]">
            Our Commitment to You
          </h2>
          <p className="mb-8 text-[#64748B]">
            These aren't policies — they're the design principles the platform is
            built on.
          </p>
          <div className="mb-10 space-y-4">
            {COMMITMENT_ITEMS.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                  {item.icon}
                </div>
                <p className="pt-1.5 text-base leading-snug text-[#0F172A]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] hover:scale-[1.02]"
            >
              Submit Your Salary <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#E2E8F0] px-6 text-sm font-semibold text-[#64748B] transition-all duration-200 hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              Browse Salaries
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="bg-[#F8FAFC]">
        <FAQ />
      </div>
    </div>
  );
}
