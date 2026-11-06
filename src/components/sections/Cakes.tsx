"use client";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { formatPrice, livePrice, locations, menu, site } from "@/lib/data";
import type { Media } from "@/lib/types";
import { useApp } from "../AppProvider";
import type { CakeKind } from "../three/models";
import { ChapterHead } from "../ui/ChapterHead";
import { Illus } from "../ui/Illus";
import { IconMail } from "../ui/Icons";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";

const CakeScene = dynamic(() => import("../three/SmallScenes").then((m) => m.CakeScene), { ssr: false });

/** Gallery order from the brief (§4.7). Blueberry Cheesecake stays on the menu. */
const GALLERY: CakeKind[] = ["seasonal-fruit-cake", "dark-chocolate-cake", "strawberry-cream-cake", "shine-muscat-cake", "chocolate-drip-cake", "basque-cheesecake", "tiramisu"];
const LEAD_DAYS = 2; // [CONFIRM] minimum lead time for whole cakes

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + LEAD_DAYS);
  return d.toISOString().slice(0, 10);
}

/** 007 · Premium cakes and pre-order. */
export function Cakes({ media }: { media: Media }) {
  const { allow3D, notify } = useApp();
  const cakes = useMemo(() => menu.categories.find((c) => c.id === "cakes")!.items, []);
  const [kind, setKind] = useState<CakeKind>(GALLERY[0]);
  const [size, setSize] = useState("regular");
  const cake = cakes.find((c) => c.id === kind)!;
  const sizeOpt = menu.modifiers.cakeSize.options.find((o) => o.id === size)!;

  const [form, setForm] = useState({ date: "", message: "", pickup: "main", name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find((l) => l.id === form.pickup)!;
    const body = [
      "Cake pre-order from the website",
      "",
      `Cake: ${cake.name}`,
      `Size: ${sizeOpt.label}`,
      `Message on the cake: ${form.message || "(none)"}`,
      `Pickup: ${form.date} at ${loc.fullName}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      "",
      "Price and availability to be confirmed by Cha.",
    ].join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(`Cake pre-order · ${cake.name} · ${form.date}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    notify("Pre-order handed to your email app");
  };

  const field = "mt-1.5 w-full rounded-xl border hairline bg-white px-3.5 py-3 text-[16px] outline-none focus:border-leaf-text";

  return (
    <section id="cakes" aria-labelledby="cakes-title" className="relative overflow-hidden bg-[#f3efe6]">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <ChapterHead n="007" kicker="Premium cakes" />
        <SplitHeadline id="cakes-title" className="display mt-6 max-w-4xl text-[12vw] sm:text-7xl lg:text-[5.4vw] 3xl:text-[104px]">
          Cakes worth the box.
        </SplitHeadline>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative h-[46vh] min-h-[360px] overflow-hidden rounded-[32px] bg-white">
              {allow3D ? (
                <CakeScene kind={kind} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={kind} className="flex h-full items-center justify-center" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <Illus k="cake" className="h-64 w-64" label={cake.name} />
                  </motion.div>
                </AnimatePresence>
              )}
              <span className="label absolute bottom-3 left-4 text-[10px] opacity-50">{allow3D ? "3D illustration" : "Illustration"} · whole-cake photos from Cha to come</span>
            </div>
            <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a cake">
              {GALLERY.map((k) => {
                const c = cakes.find((x) => x.id === k)!;
                return (
                  <li key={k} className="shrink-0">
                    <button type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={`min-h-11 rounded-full px-4 text-sm font-bold transition-colors ${kind === k ? "bg-ink text-paper" : "bg-white hover:bg-white/70"}`}>
                      {c.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <PhotoSlot slot={media["cakes-whole"]} illus="box" className="col-span-2 aspect-[2/1] rounded-3xl sm:col-span-1 sm:aspect-square" sizes="300px" />
              <div className="col-span-2 rounded-3xl bg-white p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={kind} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="display text-3xl">{cake.name}</h3>
                    <p className="mt-2 opacity-75">{cake.description}</p>
                  </motion.div>
                </AnimatePresence>
                <fieldset className="mt-5">
                  <legend className="label mb-2 opacity-70">Size</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {menu.modifiers.cakeSize.options.map((o) => (
                      <button key={o.id} type="button" aria-pressed={size === o.id} onClick={() => setSize(o.id)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${size === o.id ? "bg-leaf text-ink" : "bg-ink/[0.05]"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-4 flex items-baseline gap-3" aria-live="polite">
                  <span className="font-display text-3xl font-extrabold tnum">{formatPrice(livePrice(cake.price, [sizeOpt.delta]))}</span>
                  <span className="text-sm opacity-60">{sizeOpt.label} · price to be confirmed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[32px] bg-ink p-6 text-paper sm:p-8 on-dark">
              <p className="label text-sprout">Pre-order a whole cake</p>
              <h3 className="display mt-2 text-4xl">Order ahead.</h3>
              {sent ? (
                <div className="mt-6 space-y-3" role="status">
                  <p className="text-lg">Your email app opened with the pre-order. Cha will confirm price and pickup.</p>
                  <button type="button" className="btn btn-leaf" onClick={() => setSent(false)}>
                    Pre-order another cake
                  </button>
                </div>
              ) : (
                <form className="mt-6 grid gap-4 text-ink" onSubmit={submit}>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-paper">
                    <span className="label opacity-70">Your cake</span>
                    <div className="font-semibold">
                      {cake.name} · {sizeOpt.label}
                    </div>
                  </div>
                  <label className="text-sm font-semibold text-paper">
                    Pickup date <span className="font-normal opacity-60">(at least {LEAD_DAYS} days ahead)</span>
                    <input type="date" required min={minDate()} value={form.date} onChange={set("date")} className={field + " text-ink"} />
                  </label>
                  <label className="text-sm font-semibold text-paper">
                    Pickup location
                    <select value={form.pickup} onChange={set("pickup")} className={field + " text-ink"}>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-paper">
                    Message on the cake <span className="font-normal opacity-60">(optional, 40 characters)</span>
                    <input maxLength={40} value={form.message} onChange={set("message")} placeholder="Happy birthday, Lola!" className={field + " text-ink"} />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-paper">
                      Name
                      <input required autoComplete="name" value={form.name} onChange={set("name")} className={field + " text-ink"} />
                    </label>
                    <label className="text-sm font-semibold text-paper">
                      Phone
                      <input required type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={field + " text-ink"} />
                    </label>
                  </div>
                  <button type="submit" className="btn btn-leaf mt-2">
                    <IconMail /> Send pre-order
                  </button>
                  <p className="text-center text-[11px] text-paper/60">Lead time, sizes, prices and pickup spots to be confirmed by Cha.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
