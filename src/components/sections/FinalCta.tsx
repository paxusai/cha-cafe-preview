"use client";
import dynamic from "next/dynamic";
import { locations, site } from "@/lib/data";
import { directionsUrl } from "@/lib/hours";
import { scrollToId } from "@/lib/scroll";
import { useApp } from "../AppProvider";
import { IconPhone } from "../ui/Icons";
import { LeafMark } from "../ui/LeafMark";
import { SplitHeadline } from "../ui/SplitHeadline";

const SteamScene = dynamic(() => import("../three/SmallScenes").then((m) => m.SteamScene), { ssr: false });

/** Final call to action: full-bleed leaf green, the leaf sways, steam rises (§4.13). */
export function FinalCta() {
  const { openOrder, allow3D } = useApp();
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-leaf text-ink">
      <div aria-hidden className="pointer-events-none absolute -right-[10%] -top-[10%] h-[120%] w-[60%] opacity-90">
        <div className="sway h-full w-full">
          <LeafMark size={900} className="h-full w-full" mono="rgba(250,248,243,.22)" />
        </div>
      </div>
      {allow3D && (
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-[8%] h-[70%] w-[38%]">
          <SteamScene color="#FAF8F3" strength={0.42} columns={3} />
        </div>
      )}
      <div className="relative mx-auto max-w-[1440px] px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
        <p className="label">Cha · Est. {site.founded} · Garapan, Saipan</p>
        <SplitHeadline as="h2" id="cta-title" className="display mt-4 max-w-5xl text-[13vw] sm:text-[11vw] lg:text-[8vw] 3xl:text-[160px]">
          See you before sunrise.
        </SplitHeadline>
        <div className="mt-10 flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-ink" onClick={() => openOrder()}>
            Order Ahead
          </button>
          <a href="#menu" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), scrollToId("menu"))}>
            Menu
          </a>
          <a href={directionsUrl(locations[0])} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Directions
          </a>
          <a href={site.contact.phoneHref} className="btn btn-ghost">
            <IconPhone width={18} /> Call {site.contact.phoneShort}
          </a>
        </div>
      </div>
    </section>
  );
}
