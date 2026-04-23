import Link from "next/link";
import { TrendingUp } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search Salaries" },
  { href: "/submit", label: "Submit Salary" },
  { href: "/trust", label: "How It Works" },
];

const ABOUT_LINKS = [
  { href: "/trust", label: "Trust & Guidelines" },
  { href: "/#faq", label: "FAQ" },
  { href: "mailto:hello@pksalarycompass.com", label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Column 1 — Logo + tagline */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">TankhwaMeter</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Made with purpose for Pakistani professionals.
              <br />
              Know your worth, negotiate with confidence.
            </p>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
              Navigate
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#94A3B8] transition-colors duration-150 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — About */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
              About
            </h3>
            <ul className="space-y-3">
              {ABOUT_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-[#94A3B8] transition-colors duration-150 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-[#475569]">
            © {new Date().getFullYear()} TankhwaMeter. All rights reserved.
          </p>
          <p className="text-xs text-[#475569]">
            Data is crowdsourced and anonymous.
          </p>
        </div>
      </div>
    </footer>
  );
}
