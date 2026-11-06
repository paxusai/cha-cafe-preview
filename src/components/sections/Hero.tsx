"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { locations, site } from "@/lib/data";
import { distanceKm, openStatus, saipanNow } from "@/lib/hours";
import { scrollToId } from "@/lib/scroll";
import type { Location, Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import { DateStack } from "../ui/DateStack";
import { LeafMark } from "../ui/LeafMark";
import { Logo } from "../ui/Logo";
import { OpenBadge } from "../ui/OpenBadge";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";
import { IconArrow, IconLocate } from "../ui/Icons";

const HeroScene = dynamic(() => import("../three/HeroScene"), { ssr: false });

/** Nearest open location: geolocation if the visitor allows it, else the main café. */
function LocationPill() {
  const [loc, setLoc] = useState<Location>(locations[0]);
  const [state, setState] = useState<"idle" | "busy" | "denied" | "near">("idle");

  useEffect(() => {
    // Default to the first location that is open right now.
    const now = saipanNow();
    const open = locations.find((l) => openStatus(l, now).open);
    if (open) setLoc(open);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return setState("denied");
    setState("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const me = { lat: p.coords.latitude, lng: p.coords.longitude };
        const now = saipanNow();
        const ranked = locations
          .filter((l) => l.geo)
          .map((l) => ({ l, d: distanceKm(me, l.geo!), open: openStatus(l, now).open }))
          .sort((a, b) => Number(b.open) - Number(a.open) || a.d - b.d);
        if (ranked[0]) setLoc(ranked[0].l);
        setState("near");
      },
      () => setState("denied"),
      { timeout: 8000, maximumAge: 600_000 },
    );
  };

  return (
    <div className="on-dark flex w-full max-w-sm items-center gap-3 rounded-full border border-white/15 bg-white/8 py-1.5 pl-4 pr-1.5 backdrop-blur-md sm:w-auto">
      <div className="min-w-0 flex-1">
        <div className="label text-[10px] text-sprout">{state === "near" ? "Nearest to you" : "Open near you"}</div>
        <a href="#drive-thru" onClick={(e) => (e.preventDefault(), scrollToId("drive-thru"))} className="block truncate text-sm font-semibold">
          {loc.name}
        </a>
      </div>
      <OpenBadge loc={loc} size="sm" tone="dark" short />
      <button type="button" onClick={locate} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Find the nearest Cha using my location" title={state === "denied" ? "Location unavailable" : "Use my location"}>
        <IconLocate className={state === "busy" ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export function Hero({ media }: { media: Media }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const { cinematic: motionOk, allow3D, ready, openOrder, isMobile } = useApp();
  // §4.1: mobile and reduced motion get a static hero (photo + leaf draw only).
  const cinematic = motionOk && !isMobile;
  const clock = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ready) return;
      const el = root.current!;
      const logoWrap = el.querySelector("[data-logo]");
      gsap.fromTo(logoWrap, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, delay: 0.7, ease: "power2.inOut" });
      gsap.from(el.querySelectorAll("[data-rise]"), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, delay: 1.1 });
      if (!cinematic) return;

      // Pre-dawn → sunrise → bakery white, scrubbed.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (s) => {
            progress.current = s.progress;
            const mins = Math.round(s.progress * 122); // 4:58 → 7:00 AM
            const h = 4 + Math.floor((58 + mins) / 60);
            if (clock.current) clock.current.textContent = `${h}:${String((58 + mins) % 60).padStart(2, "0")}`;
          },
        },
      });
      tl.to(el.querySelector("[data-sky]"), { backgroundColor: "#1d2546", duration: 0.25, ease: "none" })
        .to(el.querySelector("[data-sun]"), { opacity: 1, yPercent: -35, duration: 0.35, ease: "none" }, 0.1)
        .to(el.querySelector("[data-sky]"), { backgroundColor: "#f2d7b4", duration: 0.3, ease: "none" }, 0.25)
        .to(el.querySelector("[data-copy]"), { opacity: 0, y: -60, duration: 0.25, ease: "power1.in" }, 0.32)
        .to(el.querySelector("[data-sky]"), { backgroundColor: "#FAF8F3", duration: 0.3, ease: "none" }, 0.55)
        .to(el.querySelector("[data-sun]"), { opacity: 0, duration: 0.2 }, 0.7)
        .fromTo(el.querySelector("[data-morning]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.72)
        .to({}, { duration: 0.1 });
    },
    { dependencies: [cinematic, ready], scope: root },
  );

  return (
    <section ref={root} id="sunrise" aria-labelledby="hero-title" className={`relative ${cinematic ? "h-[260vh]" : "min-h-[100svh]"}`}>
      <div data-sky className="on-dark sticky top-0 h-[100svh] min-h-[620px] overflow-hidden bg-predawn text-paper">
        {/* sunrise glow */}
        <div data-sun aria-hidden className="pointer-events-none absolute inset-x-[-20%] bottom-[-60%] h-[120%] rounded-[50%] opacity-0" style={{ background: "radial-gradient(closest-side, #ffcf8f, #f39a5d 45%, transparent 75%)" }} />
        {/* stars before dawn */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(1px 1px at 20% 30%, #fff8, transparent), radial-gradient(1px 1px at 70% 20%, #fff8, transparent), radial-gradient(1.5px 1.5px at 85% 60%, #fff6, transparent), radial-gradient(1px 1px at 35% 70%, #fff5, transparent), radial-gradient(1px 1px at 55% 45%, #fff7, transparent)" }} />

        {allow3D ? (
          <HeroScene progress={progress} />
        ) : (
          <div className="absolute inset-0">
            <PhotoSlot slot={media["hero-espresso-pour"]} dark quiet priority sizes="100vw" illus="espresso" className="h-full w-full" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-predawn from-[30%] via-predawn/55 to-predawn/10" />
          </div>
        )}

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 pb-24 pt-[calc(var(--nav-h)+16px)] sm:px-6 md:pb-10 lg:px-10">
          <div className="flex items-start justify-between">
            <div className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-sprout">
              <span className="font-bold">001</span>
              <span className="h-px w-8 bg-current opacity-60" />
              <span>Before Sunrise</span>
              <span className="hidden sm:inline">· <span className="tnum"><span ref={clock}>4:58</span> AM</span> · Garapan</span>
            </div>
            <DateStack tone="white" />
          </div>

          <div data-copy className="mt-auto grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-6 flex items-end gap-3">
                <LeafMark size={56} draw={ready} delay={0.2} duration={0.8} />
                <span data-logo className="inline-block">
                  <Logo size={64} chip />
                </span>
              </div>
              <SplitHeadline as="h1" id="hero-title" immediate delay={0.5} stagger={0.03} className="display text-[13vw] sm:text-[10vw] lg:text-[7.4vw] 3xl:text-[150px]">
                Where coffee meets paradise.
              </SplitHeadline>
              <p data-rise className="mt-5 max-w-xl text-lg leading-snug text-paper/85 sm:text-xl">
                Specialty coffee roasted in-house. Bread baked before sunrise. Since {site.founded}.
              </p>
              <div data-rise className="mt-7 flex flex-wrap gap-2.5">
                <button type="button" className="btn btn-leaf" onClick={() => openOrder()}>
                  Order Ahead <IconArrow width={18} />
                </button>
                <a href="#menu" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), scrollToId("menu"))}>
                  See the Menu
                </a>
                <a href="#drive-thru" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), scrollToId("drive-thru"))}>
                  Find a Drive-Thru
                </a>
              </div>
            </div>
            <div data-rise className="lg:col-span-4 lg:flex lg:justify-end">
              <LocationPill />
            </div>
          </div>
        </div>

        {cinematic && (
          <div data-morning className="pointer-events-none absolute inset-x-0 bottom-[16vh] text-center text-ink opacity-0">
            <p className="label text-leaf-text">7:00 AM · Doors open</p>
            <p className="display mt-3 text-[9vw] lg:text-[5.2vw]">Good morning, Saipan.</p>
          </div>
        )}
        {cinematic && (
          <div aria-hidden className="label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-paper/60 md:flex">
            <span className="h-8 w-px animate-pulse bg-current" /> Scroll to sunrise
          </div>
        )}
      </div>
    </section>
  );
}
