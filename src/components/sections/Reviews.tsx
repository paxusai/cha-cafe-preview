"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { reviews, site } from "@/lib/data";
import { useApp } from "../AppProvider";
import { IconArrow, IconPause, IconPlay, IconStar } from "../ui/Icons";
import { LeafMark } from "../ui/LeafMark";

/** Reviews — real, verbatim, attributed. Auto-advancing, pausable carousel (§4.11). Never invent reviews. */
export function Reviews() {
  const { motionPaused, reducedMotion } = useApp();
  const list = reviews.reviews;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const auto = !paused && !hold && !motionPaused && !reducedMotion;

  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % list.length), 6500);
    return () => window.clearTimeout(t);
  }, [auto, i, list.length]);

  const r = list[i];
  const go = (d: number) => setI((n) => (n + d + list.length) % list.length);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="relative overflow-hidden bg-paper">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label text-leaf-text">What Saipan says</p>
            <h2 id="reviews-title" className="display mt-3 text-5xl sm:text-6xl">
              Saipan&apos;s most-reviewed café.
            </h2>
            <div className="mt-8 flex items-center gap-4">
              <div className="font-display text-6xl font-black tnum">{reviews.aggregate.stars}</div>
              <div>
                <div className="flex text-[#e0a526]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, n) => (
                    <IconStar key={n} width={18} height={18} className={n < Math.round(reviews.aggregate.stars) ? "" : "opacity-25"} />
                  ))}
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {reviews.aggregate.stars}★ on Google · {reviews.aggregate.count} reviews
                </p>
                <p className="text-xs opacity-60">Facebook {site.ratings.facebook.recommend}% recommend ({site.ratings.facebook.count})</p>
              </div>
            </div>
            {/* Best of the Marianas badge (text badge, not the award's own artwork) */}
            <div className="mt-8 inline-flex items-center gap-4 rounded-full border-2 border-[#c99a2e] bg-[#fff8e6] py-2 pl-2 pr-5">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#c99a2e] text-white">
                <span className="text-[9px] font-bold uppercase tracking-widest">Gold</span>
                <span className="font-display text-lg font-black leading-none">{site.award.year}</span>
              </span>
              <span>
                <span className="block font-display text-sm font-extrabold uppercase">{site.award.title}</span>
                <span className="block text-xs opacity-70">{site.award.program}</span>
              </span>
            </div>
          </div>

          <div
            className="relative lg:col-span-8"
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer reviews"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
            <div className="relative min-h-[320px] rounded-[32px] bg-ink p-8 text-paper sm:p-12" aria-live={auto ? "off" : "polite"}>
              <LeafMark size={40} />
              <AnimatePresence mode="wait">
                <motion.figure key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${list.length}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}>
                  <blockquote className="mt-6 font-display text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-5xl">&ldquo;{r.quote}&rdquo;</blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <strong>{r.name}</strong>
                    <span className="opacity-50">·</span>
                    <span className="opacity-80">{r.platform}</span>
                    <span className="opacity-50">·</span>
                    <span className="opacity-60">{r.date}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline hover:bg-ink hover:text-paper" aria-label="Previous review">
                <IconArrow className="rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline hover:bg-ink hover:text-paper" aria-label="Next review">
                <IconArrow />
              </button>
              <button type="button" onClick={() => setPaused((p) => !p)} className="inline-flex h-12 items-center gap-2 rounded-full border hairline px-4 text-sm font-semibold hover:bg-ink/5" aria-pressed={paused}>
                {paused ? <IconPlay width={16} /> : <IconPause width={16} />} {paused ? "Play" : "Pause"}
              </button>
              <div className="ml-auto flex gap-1.5" aria-hidden>
                {list.map((_, n) => (
                  <span key={n} className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-8 bg-leaf" : "w-1.5 bg-ink/20"}`} />
                ))}
              </div>
            </div>
            <p className="label mt-3 text-[10px] opacity-50">Public reviews quoted verbatim · publication pending Cha&apos;s approval</p>
          </div>
        </div>
      </div>
    </section>
  );
}
