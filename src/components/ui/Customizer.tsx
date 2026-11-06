"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, livePrice, menu } from "@/lib/data";
import type { MenuItem } from "@/lib/types";
import { useApp } from "../AppProvider";

type Key = "size" | "milk" | "pearls";

/**
 * Drink customizer (§9): size, milk, pearls with a live price. Prices stay "TBC"
 * until Cha confirms them — the maths is wired, the numbers aren't invented.
 */
export function Customizer({ item, tone = "light", compact, onChange }: { item: MenuItem; tone?: "light" | "dark"; compact?: boolean; onChange?: (sel: Record<Key, string>) => void }) {
  const { addToOrder, openOrder } = useApp();
  const keys = (item.customize ?? []) as Key[];
  const [sel, setSel] = useState<Record<Key, string>>({ size: "regular", milk: "regular", pearls: keys.includes("pearls") ? "fresh" : "none" });
  const changed = useRef(onChange);
  changed.current = onChange;
  useEffect(() => changed.current?.(sel), [sel]);

  const chosen = useMemo(() => keys.map((k) => menu.modifiers[k].options.find((o) => o.id === sel[k])!), [keys, sel]);
  const price = livePrice(item.price, chosen.map((o) => o.delta));
  const optionLabels = chosen.filter((o) => o.delta !== 0 || o.id !== "regular").map((o) => o.label).filter((l) => l !== "No pearls");

  const chip = (active: boolean) =>
    tone === "dark"
      ? active
        ? "bg-paper text-ink"
        : "bg-white/8 text-paper hover:bg-white/15"
      : active
        ? "bg-ink text-paper"
        : "bg-ink/[0.05] text-ink hover:bg-ink/10";

  return (
    <div className="space-y-4">
      {keys.map((k) => (
        <fieldset key={k}>
          <legend className="label mb-2 opacity-70">{menu.modifiers[k].label}</legend>
          <div className="flex flex-wrap gap-1.5">
            {menu.modifiers[k].options.map((o) => (
              <label key={o.id} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf-text ${chip(sel[k] === o.id)}`}>
                <input type="radio" className="sr-only" name={`${item.id}-${k}`} value={o.id} checked={sel[k] === o.id} onChange={() => setSel((s) => ({ ...s, [k]: o.id }))} />
                {o.label}
                {k === "size" && o.id === "large" && item.driveThruSize ? <span className="ml-1 opacity-60">· {item.driveThruSize} drive-thru</span> : null}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className={`flex items-center justify-between gap-3 border-t pt-4 ${tone === "dark" ? "border-white/15" : "hairline"}`}>
        <div aria-live="polite">
          <div className="label opacity-60">Live price</div>
          <div className="font-display text-2xl font-extrabold tnum">
            {formatPrice(price)}
            {price === null && <span className="ml-2 align-middle font-sans text-xs font-medium opacity-60">price confirmed by Cha</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-leaf"
            onClick={() => {
              addToOrder({ itemId: item.id, name: item.name, options: optionLabels, price });
              if (!compact) openOrder();
            }}
          >
            Add to order
          </button>
        </div>
      </div>
    </div>
  );
}
