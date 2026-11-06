import "server-only";
import { locations as staticLocations, menu as staticMenu } from "../data";
import type { Location, Menu } from "../types";

/**
 * CMS adapter. The owner edits menu, prices, hours and specials in WordPress (ACF
 * options pages, schema in docs/CMS-SCHEMA.md). Until WP_API_URL is set, the sample
 * reads /data/menu.json and /data/locations/*.json — same shape either way.
 */
const WP = process.env.WP_API_URL?.replace(/\/$/, "");

async function fromWp<T>(route: string): Promise<T | null> {
  if (!WP) return null;
  try {
    const res = await fetch(`${WP}/wp-json/cha/v1/${route}`, { next: { revalidate: 60, tags: [route] } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMenu(): Promise<Menu> {
  return (await fromWp<Menu>("menu")) ?? staticMenu;
}

export async function getLocations(): Promise<Location[]> {
  const live = await fromWp<Location[]>("locations");
  return (live ?? staticLocations).slice().sort((a, b) => a.order - b.order);
}
