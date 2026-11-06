"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { menu } from "@/lib/data";
import type { Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import { ChapterHead } from "../ui/ChapterHead";
import { Illus } from "../ui/Illus";
import { IconArrow } from "../ui/Icons";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";

const BakeryScene = dynamic(() => import("../three/BakeryScene"), { ssr: false });

const CAROUSEL = ["croissant", "coconut-croissant", "danish", "taro-bread", "cinnamon-roll", "blueberry-tart", "banana-walnut-bread", "choc-chip-cookie", "bagels"];

/** White subway tile, as in Cha's kitchen photos (CSS only). */
const tile = {
  backgroundColor: "#f4f2ec",
  backgroundImage: "linear-gradient(#dcd8cf 1px, transparent 1px), linear-gradient(90deg, #dcd8cf 1px, transparent 1px)",
  backgroundSize: "64px 32px, 64px 64px",
};

/** 004 · Baked every morning. Pinned: dark 5 AM kitchen → lights on → flour dust. */
export function Bakery({ media }: { media: Media }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const progress = useRef(0);
  const clock = useRef<HTMLSpanElement>(null);
  const { cinematic, allow3D, ready } = useApp();
  const bakery = menu.categories.find((c) => c.id === "bakery")!;
  const items = CAROUSEL.map((id) => bakery.items.find((i) => i.id === id)!).filter(Boolean);

  useGSAP(
    () => {
      if (!ready || !cinematic) return;
      const el = root.current!;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el.querySelector("[data-pin]"),
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: 0.6,
          onUpdate: (s) => {
            progress.current = s.progress;
            const m = Math.round(s.progress * 60);
            if (clock.current) clock.current.textContent = `${5 + Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
          },
        },
      });
      tl.to(el.querySelector("[data-dark]"), { opacity: 0, duration: 0.3, ease: "steps(6)" }, 0.08)
        .fromTo(el.querySelector("[data-headline]"), { opacity: 0.25 }, { opacity: 1, duration: 0.2 }, 0.1)
        .fromTo(el.querySelector("[data-line]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2 }, 0.3)
        .to({}, { duration: 0.5 });
    },
    { dependencies: [cinematic, ready], scope: root },
  );

  const scrollRail = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * Math.min(560, rail.current.clientWidth * 0.8), behavior: "smooth" });

  return (
    <section ref={root} id="bakery" aria-labelledby="bakery-title" className="relative bg-paper">
      <div data-pin className="relative h-[100svh] min-h-[620px] overflow-hidden" style={tile}>
        <div className="absolute inset-0">{allow3D ? <BakeryScene progress={progress} /> : <PhotoSlot slot={media["bakery-kitchen"]} illus="croissant" quiet className="h-full w-full" sizes="100vw" />}</div>
        {/* 5 AM darkness, switched off by the pendant lamp */}
        <div data-dark aria-hidden className={`pointer-events-none absolute inset-0 bg-[#0c0c0c] ${cinematic ? "opacity-[0.9]" : "opacity-0"}`} style={{ mixBlendMode: "multiply" }} />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 pb-24 pt-[calc(var(--nav-h)+16px)] sm:px-6 md:pb-12 lg:px-10">
          <ChapterHead n="004" kicker="Bakery" tone={cinematic ? "white" : "ink"} className="mix-blend-difference" />
          <p className="label mt-2 text-leaf-text mix-blend-normal" aria-hidden={!cinematic}>
            <span className="rounded-full bg-paper/90 px-2.5 py-1">
              <span ref={clock}>5:00</span> AM · bakers in
            </span>
          </p>
          <div className="mt-auto max-w-3xl">
            {/* Fade wrapper sits outside the split: SplitText clones nested elements per line, so a span inside would only fade its last line. */}
            <div data-headline>
              <SplitHeadline id="bakery-title" className="display text-[13.5vw] text-ink sm:text-[11vw] lg:text-[7.6vw] 3xl:text-[150px]">
                Baked every morning.
              </SplitHeadline>
            </div>
            <p data-line className="mt-5 max-w-lg rounded-2xl bg-paper/85 p-4 text-lg leading-snug backdrop-blur-sm">
              Our bakers are in before sunrise, making every croissant, loaf and bagel from scratch. Every day.
            </p>
          </div>
          <span className="label absolute bottom-6 right-6 hidden rounded-full bg-paper/80 px-2 py-1 text-[10px] md:block">3D illustration</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="label text-leaf-text">From the bakery case</p>
            <h3 className="display mt-2 text-4xl sm:text-5xl">Today&apos;s bakery case</h3>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scrollRail(-1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline hover:bg-ink hover:text-paper" aria-label="Scroll bakery items left">
              <IconArrow className="rotate-180" />
            </button>
            <button type="button" onClick={() => scrollRail(1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline hover:bg-ink hover:text-paper" aria-label="Scroll bakery items right">
              <IconArrow />
            </button>
          </div>
        </div>
        <ul ref={rail} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10" aria-label="Bakery items">
          {items.map((it, i) => (
            <li key={it.id} className="lift w-[72vw] shrink-0 snap-start overflow-hidden rounded-3xl bg-white sm:w-[300px]">
              <PhotoSlot slot={it.photo ? media[it.photo] : undefined} illus={it.illustration} className="aspect-[4/5] w-full" sizes="300px" quiet={i > 0} />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display text-lg font-extrabold uppercase leading-tight">{it.name}</h4>
                  <span className="label opacity-50">{String(i + 1).padStart(3, "0")}</span>
                </div>
                <p className="mt-1.5 text-sm opacity-75">{it.description}</p>
              </div>
            </li>
          ))}
          <li className="flex w-[60vw] shrink-0 snap-start items-center justify-center rounded-3xl bg-ink p-8 text-center text-paper sm:w-[260px]">
            <div>
              <Illus k="bread" className="mx-auto h-20 w-20" />
              <Link href="/menu#bakery" className="btn btn-leaf mt-5">
                Full bakery menu
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
