/**
 * Static data layer (safe for client and server). The JSON files in /data are the
 * sample's "CMS". In production these are replaced by WordPress ACF / WooCommerce via
 * src/lib/server/cms.ts — see docs/CMS-SCHEMA.md.
 */
import siteJson from "@data/site.json";
import menuJson from "@data/menu.json";
import reviewsJson from "@data/reviews.json";
import shopJson from "@data/shop.json";
import main from "@data/locations/main.json";
import middleRoad from "@data/locations/middle-road.json";
import chalanKiya from "@data/locations/chalan-kiya.json";
import type { Location, Menu, Product, Review } from "./types";

export const site = siteJson;
export const menu = menuJson as unknown as Menu;
export const reviews = reviewsJson as { aggregate: { platform: string; stars: number; count: number }; reviews: Review[] };
export const mockProducts = shopJson.products as Product[];
export const locations = ([main, middleRoad, chalanKiya] as unknown as Location[]).sort((a, b) => a.order - b.order);

export const TBC = "TBC";

export function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return TBC;
  return `$${n.toFixed(2)}`;
}

export function findMenuItem(id: string) {
  for (const c of menu.categories) {
    const item = c.items.find((i) => i.id === id);
    if (item) return { item, category: c };
  }
  return null;
}

/**
 * Live price for the drink customizer: base + modifier deltas. If the base or any
 * chosen delta is still unconfirmed (null), the whole price is "TBC".
 */
export function livePrice(base: number | null, deltas: (number | null)[]) {
  if (base === null) return null;
  let total = base;
  for (const d of deltas) {
    if (d === null) return null;
    total += d;
  }
  return total;
}

export const CHAPTERS = [
  { n: "001", id: "sunrise", label: "Before Sunrise" },
  { n: "002", id: "story", label: "Our Story" },
  { n: "003", id: "roast", label: "Roasted Fresh" },
  { n: "004", id: "bakery", label: "Baked Every Morning" },
  { n: "005", id: "drinks", label: "Signature Drinks" },
  { n: "006", id: "menu", label: "Full Menu" },
  { n: "007", id: "cakes", label: "Premium Cakes" },
  { n: "008", id: "drive-thru", label: "Coffee & Fuel" },
  { n: "009", id: "shop", label: "Shop" },
  { n: "010", id: "bistro", label: "Cha Bistro" },
] as const;
