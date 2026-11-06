import { locations } from "@/lib/data";

/** The footer row from Cha's 2026 posters: the three locations. */
export function PosterFooter({ tone = "white", className = "" }: { tone?: "white" | "ink"; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-3 ${tone === "white" ? "border-white/20 text-paper" : "border-ink/15 text-ink"} ${className}`}>
      {locations.map((l, i) => (
        <div key={l.id} className="flex items-baseline gap-3">
          <span className="label opacity-60">{String(i + 1).padStart(2, "0")}</span>
          <span className="font-display text-sm font-extrabold uppercase tracking-wide">
            {l.type === "cafe" ? "Beach Road · Garapan" : l.address.street.replace("Mobil ", "Mobil · ")}
          </span>
        </div>
      ))}
    </div>
  );
}
