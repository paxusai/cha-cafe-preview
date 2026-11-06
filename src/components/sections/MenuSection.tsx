"use client";
import Link from "next/link";
import type { Media, Menu } from "@/lib/types";
import { MenuBrowser } from "../MenuBrowser";
import { ChapterHead } from "../ui/ChapterHead";
import { IconArrow } from "../ui/Icons";
import { SplitHeadline } from "../ui/SplitHeadline";

/** 006 · Full menu (also at /menu). */
export function MenuSection({ menu, media }: { menu: Menu; media: Media }) {
  return (
    <section id="menu" aria-labelledby="menu-title" className="relative bg-paper">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <ChapterHead n="006" kicker="Full menu" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SplitHeadline id="menu-title" className="display text-[12vw] sm:text-7xl lg:text-[5.4vw] 3xl:text-[104px]">
            All day easy eats.
          </SplitHeadline>
          <Link href="/menu" className="btn btn-ghost">
            Open the menu page <IconArrow width={18} />
          </Link>
        </div>
        <div className="mt-10">
          <MenuBrowser menu={menu} media={media} />
        </div>
      </div>
    </section>
  );
}
