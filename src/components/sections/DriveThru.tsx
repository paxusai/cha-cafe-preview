"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/data";
import { directionsUrl, weeklyRows } from "@/lib/hours";
import type { Location, Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import { ChapterHead } from "../ui/ChapterHead";
import { IconCar, IconPhone, IconPin } from "../ui/Icons";
import { Illus } from "../ui/Illus";
import { OpenBadge } from "../ui/OpenBadge";
import { PhotoSlot } from "../ui/PhotoSlot";
import { PosterFooter } from "../ui/PosterFooter";
import { SplitHeadline } from "../ui/SplitHeadline";

const CarrierScene = dynamic(() => import("../three/SmallScenes").then((m) => m.CarrierScene), { ssr: false });
const LocationsMap = dynamic(() => import("../LocationsMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-[#efebe2]" /> });

/** Mount the map (and its ~200 KB library) only when the section is close. */
function useNear(margin = "600px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: margin });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near] as const;
}

/** 008 · Coffee & Fuel: drive-thru panel, map, location cards, promo. */
export function DriveThru({ media, locations }: { media: Media; locations: Location[] }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const { cinematic, allow3D, ready, openOrder } = useApp();
  const [active, setActive] = useState(locations[0].id);
  const [mapRef, near] = useNear();

  useGSAP(
    () => {
      if (!ready || !cinematic) return;
      gsap.timeline({ scrollTrigger: { trigger: root.current!.querySelector("[data-panel]"), start: "top 85%", end: "bottom 30%", scrub: true, onUpdate: (s) => (progress.current = s.progress) } });
    },
    { dependencies: [cinematic, ready], scope: root },
  );

  return (
    <section ref={root} id="drive-thru" aria-labelledby="drive-title" className="relative bg-paper">
      <div data-panel className="on-dark grain relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-24 sm:px-6 lg:px-10 lg:pt-32">
          <ChapterHead n="008" kicker="Drive-thru" tone="white" />
          <div className="mt-6 grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SplitHeadline id="drive-title" className="display text-[17vw] sm:text-[13vw] lg:text-[8.6vw] 3xl:text-[170px]">
                Coffee &amp; Fuel.
              </SplitHeadline>
              <p className="mt-5 flex flex-wrap items-center gap-3 text-lg text-paper/80">
                <span className="rounded-full border border-white/25 px-3 py-1 text-sm font-bold uppercase tracking-wide">Cha × Mobil</span>
                Drive-thrus at Mobil Middle Road and Mobil Chalan Kiya.
              </p>
            </div>
            <div className="relative h-[38vh] min-h-[300px] lg:col-span-5 lg:h-[46vh]">
              {allow3D ? <CarrierScene progress={progress} /> : <PhotoSlot slot={media["drive-canopy"]} dark illus="kit" className="h-full w-full rounded-3xl" sizes="40vw" />}
              {allow3D && <span className="label absolute bottom-1 right-0 text-[10px] opacity-50">3D illustration</span>}
            </div>
          </div>

          {/* promo strip */}
          <div className="mt-10 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            {site.promo.offers.map((o) => (
              <div key={o.at} className="flex items-center gap-4 rounded-2xl bg-leaf p-5 text-ink">
                <span className="font-display text-4xl font-black tnum">${o.spend}</span>
                <span aria-hidden className="text-2xl">→</span>
                <span className="font-display text-4xl font-black tnum">${o.get}</span>
                <span className="text-sm font-semibold leading-tight">
                  Spend ${o.spend} at {o.at}, get ${o.get} {o.reward}
                  {o.condition ? ` (${o.condition})` : ""}.
                </span>
              </div>
            ))}
            <button type="button" onClick={() => openOrder(locations.find((l) => l.type === "drive-thru")?.id)} className="btn btn-ghost h-full min-h-14 rounded-2xl">
              <IconCar /> Order ahead for drive-thru pickup
            </button>
          </div>
          <p className="label mt-3 text-[10px] opacity-50">Promo since {site.promo.since} · drive-thru order-ahead to be confirmed</p>
          <PosterFooter className="mt-12" />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div ref={mapRef} className="relative h-[52vh] min-h-[380px] overflow-hidden rounded-[32px] border hairline bg-[#efebe2] lg:col-span-7 lg:h-[640px]">
          {near && <LocationsMap locations={locations} active={active} onSelect={setActive} />}
        </div>
        <ul className="grid gap-3 lg:col-span-5" aria-label="Locations">
          {locations.map((l) => (
            <li key={l.id}>
              <article
                className={`rounded-3xl border p-5 transition-colors ${active === l.id ? "border-ink bg-white shadow-[0_18px_40px_-26px_rgba(111,162,58,.9)]" : "hairline bg-white/60"}`}
                onMouseEnter={() => setActive(l.id)}
                onFocus={() => setActive(l.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label flex items-center gap-2 text-leaf-text">
                      {l.type === "drive-thru" ? <IconCar width={14} /> : <Illus k="espresso" className="h-4 w-4" />} {l.typeLabel}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-extrabold uppercase leading-tight">{l.name}</h3>
                    <p className="mt-1 text-sm opacity-70">
                      {l.address.street}, {l.address.locality}
                      {!l.geo?.confirmed && <span className="ml-1 opacity-70">· pin approximate</span>}
                    </p>
                  </div>
                  <OpenBadge loc={l} size="sm" short />
                </div>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm tnum">
                  {weeklyRows(l).map((r) => (
                    <div key={r.days} className="contents">
                      <dt className="opacity-60">{r.days}</dt>
                      <dd>{r.hours}</dd>
                    </div>
                  ))}
                </dl>
                {!l.hoursConfirmed && <p className="label mt-1 text-[10px] opacity-50">Hours to be confirmed</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={directionsUrl(l)} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
                    <IconPin width={18} /> Directions
                  </a>
                  <a href={`tel:${l.phone}`} className="btn btn-ghost">
                    <IconPhone width={18} /> Call
                  </a>
                  <button type="button" className="btn btn-ghost" onClick={() => openOrder(l.id)}>
                    Order ahead
                  </button>
                </div>
                {l.notes[0] && <p className="mt-3 text-xs opacity-70">{l.notes[0]}</p>}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
