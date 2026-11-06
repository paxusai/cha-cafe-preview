"use client";
import { useEffect, useState } from "react";
import { openStatus, saipanNow, type OpenStatus } from "@/lib/hours";
import type { Location } from "@/lib/types";

/** Re-evaluates every 30 s against Chamorro Time (Pacific/Saipan). */
export function useOpenStatus(loc: Pick<Location, "hours">) {
  const [s, setS] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setS(openStatus(loc, saipanNow()));
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, [loc]);
  return s;
}

export function OpenBadge({ loc, size = "md", tone = "light", short }: { loc: Location; size?: "sm" | "md"; tone?: "light" | "dark"; short?: boolean }) {
  const s = useOpenStatus(loc);
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  const bg = tone === "dark" ? "bg-white/10 text-paper" : "bg-ink/[0.06] text-ink";
  if (!s)
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full ${pad} ${bg} font-semibold`} aria-hidden>
        <span className="h-2 w-2 rounded-full bg-steel" />
        Checking hours…
      </span>
    );
  const dot = s.open ? (s.closingSoon ? "bg-[#e0a526]" : "bg-leaf") : "bg-hibiscus";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${pad} ${bg} font-semibold tnum`} role="status" aria-live="polite">
      <span className="relative flex h-2 w-2">
        {s.open && <span className={`pulse-ring absolute inset-0 rounded-full ${dot}`} />}
        <span className={`relative h-2 w-2 rounded-full ${dot}`} />
      </span>
      {short ? (s.open ? `Open · ${s.short}` : s.short) : s.label}
      {!loc.hoursConfirmed && <span className="sr-only"> (hours to be confirmed)</span>}
    </span>
  );
}
