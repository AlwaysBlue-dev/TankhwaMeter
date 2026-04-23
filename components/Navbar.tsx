"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/trust", label: "How It Works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#E2E8F0]"
      style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[#0F172A]">
          <TrendingUp className="h-5 w-5 text-[#2563EB]" />
          <span className="text-base">TankhwaMeter</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[#64748B] transition-colors duration-200 hover:text-[#2563EB]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/submit"
          className="hidden rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1D4ED8] hover:scale-[1.03] active:scale-[0.97] md:inline-flex"
        >
          Submit Salary
        </Link>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-[#F8FAFC] md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 pb-4 pt-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="/submit"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl bg-[#2563EB] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                Submit Salary
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}