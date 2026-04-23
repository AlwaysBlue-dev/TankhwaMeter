"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FlagButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleFlag() {
    if (state !== "idle") return;
    setState("loading");
    await supabase.from("salaries").update({ is_flagged: true }).eq("id", id);
    setState("done");
  }

  if (state === "done") {
    return (
      <span className={`text-xs text-[#94A3B8] ${className ?? ""}`}>
        Reported
      </span>
    );
  }

  return (
    <button
      onClick={handleFlag}
      disabled={state === "loading"}
      aria-label="Flag this submission as suspicious"
      className={`flex items-center gap-1 text-xs text-[#94A3B8] transition-all duration-200 hover:text-[#EF4444] disabled:opacity-40 ${className ?? ""}`}
    >
      <Flag className="h-3 w-3" />
      {state === "loading" ? "…" : "Report"}
    </button>
  );
}
