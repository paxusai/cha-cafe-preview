export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Interval = [string, string]; // "HH:MM" 24h, Chamorro Time

export interface Location {
  id: string;
  order: number;
  name: string;
  fullName: string;
  type: "cafe" | "drive-thru";
  typeLabel: string;
  isNew?: boolean;
  opened?: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string };
  plusCode?: string;
  geo: { lat: number; lng: number; confirmed: boolean } | null;
  phone: string;
  services: string[];
  timezone: string;
  hours: Record<DayKey, Interval[]>;
  hoursConfirmed: boolean;
  notes: string[];
  confirm: string[];
}

export type Temp = "hot" | "iced" | "blended";

export interface MenuItem {
  id: string;
  name: string;
  signature?: boolean;
  original?: boolean;
  description: string;
  descriptionDraft: boolean;
  price: number | null;
  sizes?: string[];
  temps: Temp[];
  dietary: string[];
  tagsDraft: boolean;
  customize?: ("size" | "milk" | "pearls")[];
  driveThruSize?: string;
  illustration: IllustrationKey;
  photo: string | null;
}

export interface MenuCategory {
  id: string;
  label: string;
  blurb: string;
  confirm?: string;
  items: MenuItem[];
}

export interface ModifierOption {
  id: string;
  label: string;
  delta: number | null;
}

export interface Menu {
  _meta: { note: string; pricesConfirmed: boolean; currency: string; updated: string };
  modifiers: Record<"size" | "milk" | "pearls" | "cakeSize", { label: string; confirm?: string; options: ModifierOption[] }>;
  categories: MenuCategory[];
}

export type IllustrationKey =
  | "espresso"
  | "iced"
  | "milktea"
  | "blended"
  | "lemonade"
  | "croissant"
  | "bread"
  | "pastry"
  | "cookie"
  | "bagel"
  | "macaron"
  | "cake"
  | "sandwich"
  | "burrito"
  | "soup"
  | "bag"
  | "tumbler"
  | "mug"
  | "kit"
  | "box";

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  regularPrice: number;
  onSale: boolean;
  description: string;
  descriptionDraft: boolean;
  preview: "bag" | "tumbler" | "mug" | "kit" | "box";
  label: string;
  photo: string | null;
  permalink?: string;
}

/** A resolved photo slot: `src` is null when the client original hasn't been dropped in yet. */
export interface PhotoSlot {
  id: string;
  src: string | null;
  alt: string;
  label: string;
  /** Where a published photo came from, e.g. "chacafeusa.com" (shown as a small credit). */
  credit?: string;
  /** "contain" for product cut-outs on transparent backgrounds. */
  fit?: "cover" | "contain";
}

export type Media = Record<string, PhotoSlot>;

export interface Review {
  quote: string;
  name: string;
  platform: string;
  date: string;
}
