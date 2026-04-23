"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/utils/format";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ── Types ──────────────────────────────────────────────────────────────────────

type Position = "below" | "at" | "above";

type ComparisonResult = {
  count: number;
  avg: number;
  min: number;
  max: number;
  userSalary: number;
  jobTitle: string;
  position: Position;
  percentile: number; // 0-100, rough ranking
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPosition(userSalary: number, avg: number): Position {
  const ratio = userSalary / avg;
  if (ratio < 0.9) return "below";
  if (ratio > 1.1) return "above";
  return "at";
}

function calcPercentile(userSalary: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(((userSalary - min) / (max - min)) * 100);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PositionBadge({ position }: { position: Position }) {
  if (position === "below") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <TrendingDown className="h-3.5 w-3.5" />
        Below average
      </span>
    );
  }
  if (position === "above") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
        <TrendingUp className="h-3.5 w-3.5" />
        Above average
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
      <Minus className="h-3.5 w-3.5" />
      At market rate
    </span>
  );
}

function PositionMessage({ position }: { position: Position }) {
  if (position === "below") {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        You may be underpaid.{" "}
        <span className="font-medium text-foreground">
          Here's the market data to negotiate with.
        </span>
      </p>
    );
  }
  if (position === "above") {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        You're earning above the market rate — great work!{" "}
        <span className="font-medium text-foreground">
          Keep that leverage in mind.
        </span>
      </p>
    );
  }
  return (
    <p className="mt-2 text-sm text-muted-foreground">
      Your salary is in line with market rates for this role.{" "}
      <span className="font-medium text-foreground">
        Strong position to negotiate extras.
      </span>
    </p>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SalaryComparison() {
  const [jobTitle, setJobTitle]   = useState("");
  const [salary, setSalary]       = useState("");
  const [status, setStatus]       = useState<"idle" | "loading" | "done" | "none">("idle");
  const [result, setResult]       = useState<ComparisonResult | null>(null);
  const [error, setError]         = useState("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    const userSalary = Number(salary);
    if (!jobTitle.trim()) { setError("Please enter a job title."); return; }
    if (!salary || isNaN(userSalary) || userSalary < 1000) {
      setError("Please enter a valid monthly salary.");
      return;
    }

    setStatus("loading");

    const { data, error: dbError } = await supabase
      .from("salaries")
      .select("monthly_salary_pkr")
      .ilike("job_title", `%${jobTitle.trim()}%`)
      .eq("is_flagged", false)
      .limit(500);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    if (!data || data.length === 0) {
      setStatus("none");
      return;
    }

    const vals   = data.map((r) => r.monthly_salary_pkr as number);
    const avg    = vals.reduce((a, b) => a + b, 0) / vals.length;
    const min    = Math.min(...vals);
    const max    = Math.max(...vals);
    const pos    = getPosition(userSalary, avg);
    const pctile = calcPercentile(userSalary, min, max);

    setResult({
      count: vals.length,
      avg,
      min,
      max,
      userSalary,
      jobTitle: jobTitle.trim(),
      position: pos,
      percentile: Math.min(100, Math.max(0, pctile)),
    });
    setStatus("done");
  }

  // Chart data — 3 bars: Min, Average, Your Salary, Max (horizontal)
  const chartData = result
    ? {
        labels: ["Market Min", "Market Average", "Your Salary", "Market Max"],
        datasets: [
          {
            label: "Monthly Salary (PKR)",
            data: [result.min, result.avg, result.userSalary, result.max],
            backgroundColor: [
              "rgba(148,163,184,0.7)",   // slate — min
              "rgba(99,102,241,0.75)",   // indigo — avg
              result.position === "below"
                ? "rgba(239,68,68,0.85)"    // red — below
                : result.position === "above"
                ? "rgba(34,197,94,0.85)"    // green — above
                : "rgba(59,130,246,0.85)",  // blue — at market
              "rgba(148,163,184,0.7)",   // slate — max
            ],
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      }
    : null;

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            " " + formatSalary(ctx.parsed.x ?? 0),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (v: number | string) =>
            "Rs. " + Number(v).toLocaleString("en-PK"),
          maxTicksLimit: 5,
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  return (
    <section className="border-t pt-12 mt-12">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            How does your salary compare?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your role and salary — we'll benchmark it against real
            submissions instantly.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleCompare} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="cmp-title">Job Title</Label>
            <Input
              id="cmp-title"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => { setJobTitle(e.target.value); setStatus("idle"); }}
              className="h-10"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="cmp-salary">Your Monthly Salary (PKR)</Label>
            <Input
              id="cmp-salary"
              type="number"
              placeholder="e.g. 150000"
              value={salary}
              onChange={(e) => { setSalary(e.target.value); setStatus("idle"); }}
              className="h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="h-10 shrink-0 sm:mb-0"
          >
            {status === "loading" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Comparing…</>
            ) : (
              "Compare"
            )}
          </Button>
        </form>

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-7 w-32 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="h-44 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {/* Fetch error */}
        {error && status !== "loading" && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span className="mt-0.5 shrink-0">⚠</span>
            <div>
              <p className="font-medium">Comparison failed</p>
              <p className="mt-0.5 text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* No data state */}
        {status === "none" && (
          <div className="mt-6 rounded-xl border border-dashed p-6 text-center">
            <p className="font-medium">No data for "{jobTitle}"</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No one has submitted a salary for this role yet.{" "}
              <a href="/submit" className="text-primary underline-offset-2 hover:underline">
                Be the first!
              </a>
            </p>
          </div>
        )}

        {/* Results — only shown once loading is complete */}
        {status === "done" && result && (
          <div className="mt-6 space-y-6">
            {/* Summary row */}
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Your salary</p>
                <p className="text-2xl font-bold tabular-nums text-primary">
                  {formatSalary(result.userSalary)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Market average</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatSalary(result.avg)}
                </p>
              </div>
              <div className="flex flex-col justify-end gap-1">
                <PositionBadge position={result.position} />
              </div>
            </div>

            <PositionMessage position={result.position} />

            {/* Salary range */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Range:{" "}
                <strong className="text-foreground">
                  {formatSalary(result.min)}
                </strong>
                {" — "}
                <strong className="text-foreground">
                  {formatSalary(result.max)}
                </strong>
              </span>
              <span>·</span>
              <span>
                <strong className="text-foreground">{result.count}</strong>{" "}
                {result.count === 1 ? "person" : "people"} submitted for this role
              </span>
              <span>·</span>
              <span>
                Top{" "}
                <strong className="text-foreground">
                  {100 - result.percentile}%
                </strong>
              </span>
            </div>

            {/* Chart */}
            <div className="h-44">
              {chartData && (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
