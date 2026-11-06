/** The small vertical "20 / 12 – 20 / 26" date stack from Cha's 2026 posters. */
export function DateStack({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "white" }) {
  const c = tone === "white" ? "text-paper" : "text-ink";
  return (
    <div className={`font-mono text-[11px] leading-[1.05] font-semibold tracking-[0.08em] tnum ${c} ${className}`} aria-label="Established 2012, 2026 edition">
      <div className="flex flex-col items-end" aria-hidden>
        <span>20</span>
        <span>12</span>
        <span className="my-0.5 h-px w-3 bg-current opacity-60" />
        <span>20</span>
        <span>26</span>
      </div>
    </div>
  );
}
