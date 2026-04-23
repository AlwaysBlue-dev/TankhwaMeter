import type { Metadata } from "next";
import SalaryComparison from "@/components/SalaryComparison";

export const metadata: Metadata = {
  title: "Compare Salary",
  description:
    "Compare your monthly salary against real anonymous submissions from Pakistani professionals.",
  openGraph: {
    title: "Compare Salary — TankhwaMeter",
    description:
      "Compare your monthly salary against real anonymous submissions from Pakistani professionals.",
  },
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-bold text-[#0F172A]">Compare Salary</h1>
        <p className="text-sm text-[#64748B]">
          Benchmark your salary against market data from Pakistan.
        </p>
      </div>
      <SalaryComparison />
    </div>
  );
}
