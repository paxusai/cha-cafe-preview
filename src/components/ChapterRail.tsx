"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/lib/data";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { useApp } from "./AppProvider";
import { DigitRoll } from "./ui/ChapterHead";

/** Fixed chapter counter (001–010) + progress line on the right edge, desktop only. */
export function ChapterRail() {
  const pathname = usePathname();
  const { ready } = useApp();
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready || pathname !== "/") return;
    const triggers = CHAPTERS.map((c, i) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(i),
      });
    }).filter(Boolean) as ScrollTrigger[];
    const prog = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => barRef.current && (barRef.current.style.transform = `scaleY(${s.progress})`),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      prog.kill();
    };
  }, [ready, pathname]);

  if (pathname !== "/") return null;
  const c = CHAPTERS[active];

  return (
    <aside data-chrome aria-label="Chapters" className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 text-paper mix-blend-difference lg:block 2xl:right-6">
      <div className="flex flex-col items-end gap-3 2xl:flex-row 2xl:items-center 2xl:gap-4">
        <div className="text-right">
          <div className="font-mono text-[15px] font-semibold leading-none 2xl:text-[28px]">
            <DigitRoll value={c.n} />
          </div>
          <div className="label mt-2 hidden max-w-[9rem] text-[10px] opacity-80 2xl:block" aria-live="polite">
            {c.label}
          </div>
        </div>
        <div className="relative mr-[7px] h-[40vh] w-px bg-white/30 2xl:mr-0 2xl:h-[46vh]">
          <span ref={barRef} className="absolute inset-0 origin-top bg-white" style={{ transform: "scaleY(0)" }} />
          <ol className="pointer-events-auto absolute inset-0">
            {CHAPTERS.map((ch, i) => (
              <li key={ch.id} className="absolute -left-[7px]" style={{ top: `${(i / (CHAPTERS.length - 1)) * 100}%` }}>
                <button
                  type="button"
                  onClick={() => scrollToId(ch.id)}
                  className="group -mt-[7px] flex h-[15px] w-[15px] items-center justify-center"
                  aria-label={`Go to ${ch.n} ${ch.label}`}
                  aria-current={i === active ? "step" : undefined}
                >
                  <span className={`block rounded-full bg-white transition-all duration-500 ${i === active ? "h-[9px] w-[9px]" : "h-[5px] w-[5px] opacity-60 group-hover:opacity-100"}`} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
