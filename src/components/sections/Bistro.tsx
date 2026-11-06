"use client";
import { site } from "@/lib/data";
import type { Media } from "@/lib/types";
import { ChapterHead } from "../ui/ChapterHead";
import { IconMail, IconPhone } from "../ui/Icons";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";

const PLATES = ["Shrimp", "Lemongrass pork with red rice", "Steamed buns", "Rice noodles", "Sweet rice wraps", "Steaks"];

/** 010 · Cha Bistro — upstairs dining teaser [CONFIRM if active]. */
export function Bistro({ media }: { media: Media }) {
  return (
    <section id="bistro" aria-labelledby="bistro-title" className="on-dark relative overflow-hidden text-paper" style={{ background: "radial-gradient(120% 90% at 80% 0%, #3a2416 0%, #1a120c 45%, #0e0b09 100%)" }}>
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <ChapterHead n="010" kicker="Cha Bistro · Upstairs" tone="white" />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e0a526]/50 px-3 py-1 text-xs font-semibold text-[#f0c86a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0c86a]" /> Current status to be confirmed
            </p>
            <SplitHeadline id="bistro-title" className="display mt-5 text-[12vw] sm:text-7xl lg:text-[5vw] 3xl:text-[100px]">
              Upstairs, after dark.
            </SplitHeadline>
            <p className="mt-5 max-w-lg text-lg text-paper/80">
              A second-floor dining room above the bakery, opened in 2019: modern Chamorro and international plates by a local executive chef.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 border-t border-white/10 sm:grid-cols-2">
              {PLATES.map((p, i) => (
                <li key={p} className="flex items-baseline gap-3 border-b border-white/10 py-3">
                  <span className="label text-[#f0c86a]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-lg font-bold uppercase">{p}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="label opacity-60">Lunch</dt>
                <dd className="mt-1 text-lg font-semibold tnum">11 AM–1:30 PM</dd>
              </div>
              <div>
                <dt className="label opacity-60">Dinner</dt>
                <dd className="mt-1 text-lg font-semibold tnum">6–9 PM</dd>
              </div>
            </dl>
            <p className="label mt-2 text-[10px] opacity-50">Hours as listed on Tripadvisor (2019) · to be confirmed</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a href={site.contact.phoneHref} className="btn bg-[#f0c86a] text-ink">
                <IconPhone width={18} /> Reserve by phone
              </a>
              <a href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Cha Bistro reservation")}`} className="btn btn-ghost">
                <IconMail width={18} /> Email a request
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-6">
            <PhotoSlot slot={media["bistro-plate"]} dark className="row-span-2 min-h-[320px] rounded-3xl" sizes="(max-width:1024px) 50vw, 25vw" />
            <PhotoSlot slot={media["bistro-menu"]} dark quiet className="aspect-square rounded-3xl" sizes="(max-width:1024px) 50vw, 25vw" />
            <PhotoSlot slot={media["bistro-brunch"]} dark quiet className="aspect-square rounded-3xl" sizes="(max-width:1024px) 50vw, 25vw" />
            <PhotoSlot slot={media["bistro-plates"]} dark quiet className="col-span-2 aspect-[16/9] rounded-3xl" sizes="(max-width:1024px) 100vw, 50vw" />
            <p className="label col-span-2 text-[10px] opacity-50">Photos from Cha&apos;s own site (chacafeusa.com) · dining-room photo and photo rights to be confirmed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
