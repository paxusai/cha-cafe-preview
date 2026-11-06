"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/data";
import type { Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import { ChapterHead } from "../ui/ChapterHead";
import { LeafMark } from "../ui/LeafMark";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";

/**
 * 002 · From Hole-in-the-Wall to Island Standard. Verified milestones only.
 * Desktop: pinned horizontal timeline. Mobile / reduced motion: vertical stepper.
 */
export function Story({ media }: { media: Media }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const { cinematic, ready } = useApp();

  useGSAP(
    () => {
      if (!ready || !cinematic) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const t = track.current!;
        const dist = () => t.scrollWidth - window.innerWidth + 80;
        gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current!.querySelector("[data-pin]"),
            pin: true,
            start: "top top",
            end: () => `+=${dist()}`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
        // progress line
        gsap.fromTo(root.current!.querySelector("[data-line]"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current!.querySelector("[data-pin]"), start: "top top", end: () => `+=${dist()}`, scrub: true } });
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((s) => gsap.from(s, { y: 40, opacity: 0, duration: 0.8, scrollTrigger: { trigger: s, start: "top 85%", once: true } }));
      });
      return () => mm.revert();
    },
    { dependencies: [cinematic, ready], scope: root },
  );

  return (
    <section ref={root} id="story" aria-labelledby="story-title" className="relative bg-paper">
      <div data-pin className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 lg:pb-8 lg:pt-[calc(var(--nav-h)+8px)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <ChapterHead n="002" kicker="Our Story" />
          <SplitHeadline id="story-title" className="display mt-6 max-w-5xl text-[7.6vw] sm:text-6xl md:text-7xl lg:text-[4.4vw] 3xl:text-[96px]">
            From hole-in-the-wall to island standard.
          </SplitHeadline>
        </div>

        <div className="relative mt-12 lg:mt-14">
          <div aria-hidden className="absolute left-0 right-0 top-[58px] hidden h-px bg-ink/15 lg:block">
            <span data-line className="absolute inset-0 origin-left bg-leaf" />
          </div>
          <ol ref={track} className="flex flex-col gap-10 px-4 sm:px-6 lg:w-max lg:flex-row lg:gap-8 lg:px-10" aria-label="Cha milestones">
            {site.story.map((m, i) => (
              <li key={m.title} data-step className="relative flex gap-5 lg:w-[360px] lg:flex-col lg:gap-0">
                {/* stepper rail (mobile) */}
                <div aria-hidden className="relative flex flex-col items-center lg:hidden">
                  <span className="mt-1 h-3 w-3 rounded-full bg-leaf ring-4 ring-sprout/40" />
                  {i < site.story.length - 1 && <span className="mt-2 w-px flex-1 bg-ink/15" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 lg:h-[58px]">
                    <span className={`font-mono font-semibold tracking-tight tnum whitespace-nowrap ${m.year.length > 5 ? "text-2xl lg:text-3xl" : "text-4xl lg:text-5xl"}`}>{m.year}</span>
                    <span className="label opacity-60">{String(i + 1).padStart(3, "0")}</span>
                  </div>
                  <span aria-hidden className="mb-5 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-leaf ring-4 ring-sprout/40 lg:block" />
                  <PhotoSlot slot={media[m.photo]} className="aspect-[3/2] w-full rounded-2xl" sizes="(max-width: 1024px) 90vw, 360px" />
                  <h3 className="mt-5 font-display text-xl font-extrabold uppercase leading-tight">{m.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed opacity-80">{m.body}</p>
                  <p className="label mt-3 text-[10px] opacity-50">
                    Source · {m.source}
                    {"confirm" in m && m.confirm ? " · date to confirm" : ""}
                  </p>
                </div>
              </li>
            ))}
            <li data-step className="relative flex flex-col justify-center rounded-3xl bg-ink p-8 text-paper lg:w-[520px] lg:p-10">
              <LeafMark size={44} />
              <blockquote className="mt-6">
                <p className="display text-5xl lg:text-6xl">&ldquo;{site.owner.quote}&rdquo;</p>
                <footer className="mt-5 text-sm opacity-80">
                  <strong className="font-semibold">{site.owner.name}</strong>, owner. {site.owner.bio}
                  <cite className="label mt-1 block text-[10px] not-italic opacity-60">{site.owner.quoteSource}</cite>
                </footer>
              </blockquote>
              <ul className="mt-8 grid gap-2 border-t border-white/15 pt-6 text-sm">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-sprout" /> Hires island youth
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-sprout" /> Employee scholarships
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-sprout" /> &ldquo;{site.owner.quoteLong}&rdquo;
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
