"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/data";
import type { Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import { ChapterHead } from "../ui/ChapterHead";
import { Illus } from "../ui/Illus";
import { PhotoSlot } from "../ui/PhotoSlot";
import { PosterFooter } from "../ui/PosterFooter";
import { SplitHeadline } from "../ui/SplitHeadline";

const RoastScene = dynamic(() => import("../three/RoastScene"), { ssr: false });
const SteamScene = dynamic(() => import("../three/SmallScenes").then((m) => m.SteamScene), { ssr: false });
const LatteScene = dynamic(() => import("../three/SmallScenes").then((m) => m.LatteScene), { ssr: false });

const CARDS = [
  { n: "01", t: "Small-batch roasting", b: "Roasted in-house on Saipan by Hafa Adai Roasting Company, in small batches." },
  { n: "02", t: "SCA specialty standards", b: "Brewed to Specialty Coffee Association standards — the same bar the best cafés in New York hold." },
  { n: "03", t: "SCA-certified roaster", b: "Owner John Lee, born and raised in the CNMI, is an SCA-certified professional roaster." },
];

/** 003 · Roasted fresh (HARC). Dark campaign panel, 3D bag, craft proof. */
export function Roast({ media }: { media: Media }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const { cinematic, allow3D, ready } = useApp();
  const [origin, setOrigin] = useState(0);
  const o = site.coffee.origins[origin];

  useGSAP(
    () => {
      if (!ready || !cinematic) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current!.querySelector("[data-stage]"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (s) => (progress.current = s.progress),
        },
      });
      gsap.from(root.current!.querySelectorAll("[data-card]"), { y: 60, opacity: 0, stagger: 0.12, duration: 1, scrollTrigger: { trigger: root.current!.querySelector("[data-cards]"), start: "top 80%", once: true } });
    },
    { dependencies: [cinematic, ready], scope: root },
  );

  return (
    <section ref={root} id="roast" aria-labelledby="roast-title" className="on-dark grain relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-32">
        <ChapterHead n="003" kicker="HARC · Hafa Adai Roasting Company" tone="white" />

        <div data-stage className="relative mt-8 grid items-center gap-8 lg:min-h-[86vh] lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-6">
            <SplitHeadline id="roast-title" className="display text-[16vw] sm:text-[14vw] lg:text-[min(7.6vw,116px)]">
              Roasted fresh.
            </SplitHeadline>
            <p className="mt-6 max-w-md text-lg text-paper/80">{site.taglines.roast} Small batches, roasted on island, brewed to SCA specialty standards.</p>
            <div className="mt-8">
              <p className="label mb-3 text-sprout">On the roaster now</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Coffee origin">
                {site.coffee.origins.map((x, i) => (
                  <button
                    key={x.name}
                    type="button"
                    role="radio"
                    aria-checked={origin === i}
                    onClick={() => setOrigin(i)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${origin === i ? "bg-paper text-ink" : "bg-white/10 hover:bg-white/15"}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-hibiscus" /> {x.name} {x.roast}
                  </button>
                ))}
              </div>
              <p className="label mt-3 text-[10px] opacity-50">Current lineup to be confirmed by HARC</p>
            </div>
          </div>
          <div className="relative h-[60vh] min-h-[420px] lg:col-span-6 lg:h-[80vh]">
            <div aria-hidden className="absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,240,215,.18),transparent)]" />
            {allow3D ? (
              <RoastScene progress={progress} origin={o.name} roast={o.roast} />
            ) : media["harc-bags"]?.src ? (
              <PhotoSlot slot={media["harc-bags"]} quiet className="h-full w-full" sizes="100vw" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Illus k="bag" className="h-64 w-64" label={`HARC coffee bag, ${o.name} ${o.roast}`} />
              </div>
            )}
            <span className="label absolute bottom-2 right-0 text-[10px] opacity-50">{allow3D ? "3D illustration · not a product photo" : media["harc-bags"]?.src ? "Photo · chacafeusa.com" : "Illustration"}</span>
          </div>
        </div>

        <div data-cards className="mt-10 grid gap-4 md:grid-cols-3">
          {CARDS.map((c) => (
            <article key={c.n} data-card className="rounded-3xl border border-white/12 bg-white/[0.04] p-7">
              <span className="label text-sprout">{c.n}</span>
              <h3 className="mt-4 font-display text-2xl font-extrabold uppercase leading-tight">{c.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/75">{c.b}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <figure className="relative overflow-hidden rounded-3xl lg:col-span-8">
            <PhotoSlot slot={media["harc-machine"]} dark quiet className="aspect-[16/10] w-full" sizes="(max-width:1024px) 100vw, 66vw" />
            {allow3D && <SteamScene color="#ffffff" strength={0.75} columns={2} />}
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16">
              <span className="font-display text-xl font-extrabold uppercase">Official La Marzocco / Mazzer distributor</span>
              <span className="label opacity-70">Also Curtis · Schaerer · WMF</span>
            </figcaption>
          </figure>
          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-crema/25 p-7 lg:col-span-4">
            <p className="label text-sprout">The first shot of the day</p>
            <h3 className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight">Stir the latte.</h3>
            <p className="mt-2 text-sm text-paper/70">Move your pointer across the cup.</p>
            <div className="relative mx-auto mt-6 aspect-square w-full max-w-[300px] rounded-full bg-[#5a3519] shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] ring-[14px] ring-white/90">
              {allow3D ? <LatteScene /> : <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle at 50% 45%, #f6ead8 0 22%, #a8693a 23% 60%, #5a3519 61%)" }} />}
            </div>
          </div>
        </div>

        <PosterFooter className="mt-16" />
      </div>
    </section>
  );
}
