"use client";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type KeyboardEvent } from "react";
import { findMenuItem } from "@/lib/data";
import type { IllustrationKey } from "@/lib/types";
import { useApp } from "../AppProvider";
import type { DrinkId } from "../three/CupScene";
type Pearls = "fresh" | "popping" | "none";
import { ChapterHead } from "../ui/ChapterHead";
import { Customizer } from "../ui/Customizer";
import { Illus } from "../ui/Illus";
import { SplitHeadline } from "../ui/SplitHeadline";

const CupScene = dynamic(() => import("../three/CupScene"), { ssr: false });

const SHOWCASE: { id: DrinkId; tab: string; kicker: string; story: string; tint: string; illus: IllustrationKey }[] = [
  { id: "sea-salt-americano", tab: "Sea Salt Americano", kicker: "The house signature", story: "Espresso first, then a sea-salt cream float pours in.", tint: "#e9e1d3", illus: "iced" },
  { id: "milk-tea", tab: "Milk Tea", kicker: "The original, since 2012", story: "Cha's first product — the drink credited with starting Saipan's café craze. Pearls drop and settle.", tint: "#efe2cf", illus: "milktea" },
  { id: "honeydew-milk-tea", tab: "Honeydew", kicker: "Fan favourite", story: "Honeydew black milk tea, cool and sweet.", tint: "#e7efd6", illus: "milktea" },
  { id: "taro-milk-tea", tab: "Taro", kicker: "Island classic", story: "Creamy taro milk tea in its signature lilac.", tint: "#ece3f2", illus: "milktea" },
  { id: "matcha-frappe", tab: "Matcha Frappé", kicker: "Blended", story: "Grassy matcha, blended icy and smooth.", tint: "#e3ecd5", illus: "blended" },
  { id: "mango-snow", tab: "Mango Snow", kicker: "With pearls", story: "Mango purée blended to snow, with popping and tapioca pearls.", tint: "#f7e6c4", illus: "blended" },
  { id: "lemonade-charger", tab: "Lemonade Charger", kicker: "Energy without coffee", story: "Caffeinated lemonade. The 24 oz size is drive-thru only.", tint: "#f6efc6", illus: "lemonade" },
];

/** 005 · Signature drinks: a 3D Cha cup on a turntable; tabs switch the drink. */
export function Drinks() {
  const { allow3D } = useApp();
  const [i, setI] = useState(0);
  const [pearls, setPearls] = useState<Pearls>("fresh");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const d = SHOWCASE[i];
  const item = findMenuItem(d.id)!.item;

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + SHOWCASE.length) % SHOWCASE.length;
    setI(n);
    tabs.current[n]?.focus();
  };

  return (
    <section id="drinks" aria-labelledby="drinks-title" className="relative overflow-hidden transition-colors duration-700" style={{ backgroundColor: d.tint }}>
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <ChapterHead n="005" kicker="Signature drinks" />
        <SplitHeadline id="drinks-title" className="display mt-6 max-w-4xl text-[12vw] sm:text-7xl lg:text-[5.4vw] 3xl:text-[104px]">
          Pick your cup.
        </SplitHeadline>

        <div role="tablist" aria-label="Signature drinks" className="no-scrollbar -mx-4 mt-10 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" onKeyDown={onKey}>
          {SHOWCASE.map((s, n) => (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[n] = el;
              }}
              role="tab"
              id={`drink-tab-${s.id}`}
              aria-selected={n === i}
              aria-controls="drink-panel"
              tabIndex={n === i ? 0 : -1}
              onClick={() => (setI(n), setPearls("fresh"))}
              className={`relative min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${n === i ? "text-paper" : "bg-white/60 hover:bg-white"}`}
            >
              {n === i && <motion.span layoutId="drink-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{s.tab}</span>
            </button>
          ))}
        </div>

        <div id="drink-panel" role="tabpanel" aria-labelledby={`drink-tab-${d.id}`} className="mt-8 grid items-center gap-8 lg:grid-cols-12">
          <div className="relative h-[52vh] min-h-[380px] lg:col-span-7 lg:h-[68vh]">
            <div aria-hidden className="absolute inset-x-[10%] bottom-[6%] top-[4%] rounded-full bg-white/50 blur-3xl" />
            {allow3D ? (
              <CupScene drink={d.id} pearls={pearls} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={d.id} className="flex h-full items-center justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Illus k={d.illus} className="h-72 w-72" label={item.name} />
                </motion.div>
              </AnimatePresence>
            )}
            <span className="label absolute bottom-0 left-0 text-[10px] opacity-50">{allow3D ? "3D illustration" : "Illustration"} · real cup photo to come</span>
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div key={d.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}>
                <p className="label text-leaf-text">{d.kicker}</p>
                <h3 className="display mt-2 text-5xl sm:text-6xl">{item.name}</h3>
                <p className="mt-4 max-w-md text-lg leading-snug opacity-80">{d.story}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 rounded-3xl bg-white/70 p-5 backdrop-blur">
              <Customizer key={item.id} item={item} onChange={(s) => setPearls(s.pearls as Pearls)} />
            </div>
            <p className="mt-4 text-sm opacity-70">
              Milk options for lattes: <strong>skinny, oat, almond or soy</strong> — no added fat or sugar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
