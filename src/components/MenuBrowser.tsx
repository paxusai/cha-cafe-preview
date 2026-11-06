"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { formatPrice } from "@/lib/data";
import type { Media, Menu, MenuItem } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Customizer } from "./ui/Customizer";
import { IconPrint, IconSearch } from "./ui/Icons";
import { LeafMark } from "./ui/LeafMark";
import { PhotoSlot } from "./ui/PhotoSlot";

const FILTERS = [
  { id: "hot", label: "Hot", test: (i: MenuItem) => i.temps.includes("hot") },
  { id: "iced", label: "Iced", test: (i: MenuItem) => i.temps.includes("iced") },
  { id: "blended", label: "Blended", test: (i: MenuItem) => i.temps.includes("blended") },
  { id: "signature", label: "Signature", test: (i: MenuItem) => !!i.signature },
  { id: "plant", label: "Dairy-free option", test: (i: MenuItem) => i.dietary.some((d) => /dairy-free|plant/i.test(d)) },
];

function Card({ item, media }: { item: MenuItem; media: Media }) {
  const { addToOrder } = useApp();
  const [open, setOpen] = useState(false);
  const canCustomize = !!item.customize?.length;
  return (
    <li className="lift print-break flex flex-col overflow-hidden rounded-3xl border hairline bg-white">
      <div className="relative">
        <PhotoSlot slot={item.photo ? media[item.photo] : undefined} illus={item.illustration} className="aspect-[5/3] w-full" sizes="(max-width:768px) 100vw, 33vw" quiet={!item.photo} />
        {!item.photo && <span className="label absolute bottom-3 left-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px]">Illustration</span>}
        {item.signature && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-paper">
            <LeafMark size={12} /> {item.original ? "Original 2012" : "Signature"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-lg font-extrabold uppercase leading-tight">{item.name}</h4>
          <span className={`shrink-0 font-display text-lg font-extrabold tnum ${item.price === null ? "text-ink/40" : ""}`} aria-label={item.price === null ? "Price to be confirmed" : undefined}>
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed opacity-75">{item.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.temps.map((t) => (
            <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${t === "hot" ? "bg-hibiscus/10 text-hibiscus" : t === "iced" ? "bg-[#dbe8f2] text-[#2b5b80]" : "bg-sprout/30 text-leaf-text"}`}>
              {t}
            </span>
          ))}
          {item.dietary.map((d) => (
            <span key={d} className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[11px] font-semibold">
              {d}
            </span>
          ))}
          {item.sizes && <span className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[11px] font-semibold">Slice · Mini · Regular</span>}
        </div>
        <div className="mt-auto pt-4 no-print">
          {canCustomize ? (
            <button type="button" className="btn btn-ghost w-full" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? "Close" : "Customize & add"}
            </button>
          ) : (
            <button type="button" className="btn btn-ghost w-full" onClick={() => addToOrder({ itemId: item.id, name: item.name, options: [], price: item.price })}>
              Add to order
            </button>
          )}
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-4">
                <Customizer item={item} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

/** 006 · Full menu: tabs with an animated leaf underline, search, filters, print. */
export function MenuBrowser({ menu, media, initial, standalone }: { menu: Menu; media: Media; initial?: string; standalone?: boolean }) {
  const [tab, setTab] = useState(initial ?? menu.categories[0].id);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // /menu#bakery deep links
    const h = window.location.hash.slice(1);
    if (h && menu.categories.some((c) => c.id === h)) setTab(h);
    if (standalone && new URLSearchParams(window.location.search).has("print")) {
      const t = window.setTimeout(() => window.print(), 700);
      return () => window.clearTimeout(t);
    }
  }, [menu, standalone]);

  const searching = q.trim().length > 0 || filters.length > 0;
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const active = FILTERS.filter((f) => filters.includes(f.id));
    const pool = searching ? menu.categories : menu.categories.filter((c) => c.id === tab);
    return pool
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => (!needle || `${i.name} ${i.description} ${i.dietary.join(" ")}`.toLowerCase().includes(needle)) && active.every((f) => f.test(i))),
      }))
      .filter((c) => !searching || c.items.length);
  }, [menu, tab, q, filters, searching]);
  const total = results.reduce((n, c) => n + c.items.length, 0);

  const onKey = (e: KeyboardEvent) => {
    const idx = menu.categories.findIndex((c) => c.id === tab);
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (idx + dir + menu.categories.length) % menu.categories.length;
    setTab(menu.categories[n].id);
    tabRefs.current[n]?.focus();
  };

  return (
    <div>
      <div className="no-print flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Menu categories" onKeyDown={onKey} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
          {menu.categories.map((c, n) => {
            const active = !searching && c.id === tab;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[n] = el;
                }}
                role="tab"
                id={`menu-tab-${c.id}`}
                aria-selected={active}
                aria-controls="menu-panel"
                tabIndex={c.id === tab ? 0 : -1}
                onClick={() => (setTab(c.id), setQ(""), setFilters([]))}
                className={`relative min-h-11 shrink-0 px-3 pb-3 pt-2 text-sm font-bold transition-opacity ${active ? "" : "opacity-60 hover:opacity-100"}`}
              >
                {c.label}
                {active && (
                  <motion.span layoutId="leaf-underline" className="absolute inset-x-2 bottom-0 flex items-center" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
                    <span className="h-[3px] flex-1 rounded-full bg-leaf" />
                    <LeafMark size={14} className="-ml-0.5 -mt-2" />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-72 lg:flex-none">
            <span className="sr-only">Search the menu</span>
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: taro, oat, croissant…"
              className="min-h-12 w-full rounded-full border hairline bg-white pl-11 pr-4 text-[16px] outline-none focus:border-leaf-text"
            />
          </label>
          {standalone ? (
            <button type="button" className="btn btn-ink min-h-12" onClick={() => window.print()} aria-label="Print the full menu">
              <IconPrint /> <span className="hidden sm:inline">Print</span>
            </button>
          ) : (
            <Link href="/menu?print=1" className="btn btn-ink min-h-12" aria-label="Open the printable menu">
              <IconPrint /> <span className="hidden sm:inline">Print</span>
            </Link>
          )}
        </div>
      </div>

      <div className="no-print mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filters">
        {FILTERS.map((f) => {
          const on = filters.includes(f.id);
          return (
            <button key={f.id} type="button" aria-pressed={on} onClick={() => setFilters((s) => (on ? s.filter((x) => x !== f.id) : [...s, f.id]))} className={`min-h-10 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${on ? "bg-leaf text-ink" : "bg-ink/[0.05] hover:bg-ink/10"}`}>
              {f.label}
            </button>
          );
        })}
        {searching && (
          <button type="button" onClick={() => (setQ(""), setFilters([]))} className="min-h-10 px-3 text-[13px] font-semibold underline">
            Clear
          </button>
        )}
        <span className="ml-auto self-center text-xs opacity-60" aria-live="polite">
          {searching ? `${total} result${total === 1 ? "" : "s"}` : ""}
        </span>
      </div>

      <div id="menu-panel" role="tabpanel" aria-labelledby={searching ? undefined : `menu-tab-${tab}`} aria-label={searching ? "Search results" : undefined} className="no-print mt-8">
        {results.map((c) => (
          <div key={c.id} className="mb-10">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="display text-3xl">{c.label}</h3>
              <p className="text-sm opacity-70">{c.blurb}</p>
            </div>
            {c.items.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.items.map((i) => (
                  <Card key={i.id} item={i} media={media} />
                ))}
              </ul>
            ) : (
              <div className="rounded-3xl border border-dashed hairline p-10 text-center">
                <LeafMark size={36} className="mx-auto" />
                <p className="mt-3 font-semibold">Fresh specials land here.</p>
                <p className="mt-1 text-sm opacity-60">{c.confirm ?? "Coming soon."}</p>
              </div>
            )}
            {c.confirm && c.items.length > 0 && <p className="label mt-3 text-[10px] opacity-50">More items to be confirmed by Cha</p>}
          </div>
        ))}
        {searching && total === 0 && <p className="py-10 text-center opacity-70">Nothing matches — try &ldquo;latte&rdquo; or &ldquo;taro&rdquo;.</p>}
        <p className="label mt-2 text-[10px] opacity-50">Prices to be confirmed (TBC) · descriptions are drafts pending Cha&apos;s approval</p>
      </div>

      {/* Printable menu */}
      <div className="print-only">
        <h2 className="display mb-1 text-3xl">Cha Cafe &amp; Bistro — Menu</h2>
        <p className="mb-6 text-sm">Beach Road, Garapan, Saipan · +1 (670) 233-2421 · Prices TBC</p>
        {menu.categories.map((c) => (
          <section key={c.id} className="print-break mb-5">
            <h3 className="mb-2 border-b border-black pb-1 font-display text-lg font-extrabold uppercase">{c.label}</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {c.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span>{i.name}</span>
                  <span className="tnum">{formatPrice(i.price)}</span>
                </li>
              ))}
              {!c.items.length && <li className="italic">Ask about today&apos;s specials</li>}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
