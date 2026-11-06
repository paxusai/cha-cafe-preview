import "server-only";
import { mockProducts } from "../data";
import type { Product } from "../types";

/**
 * Commerce adapter. With WOO_STORE_URL unset (the sample), products come from
 * /data/shop.json. With it set, they come from the public WooCommerce Store API of
 * Cha's existing shop — no API keys needed for reads. See docs/WOOCOMMERCE.md.
 */
const WOO = process.env.WOO_STORE_URL?.replace(/\/$/, "");

interface StoreApiProduct {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  short_description: string;
  on_sale: boolean;
  prices: { price: string; regular_price: string; currency_minor_unit: number };
  categories: { name: string }[];
}

const strip = (html: string) => html.replace(/<[^>]+>/g, "").trim();

function previewFor(name: string): Product["preview"] {
  const n = name.toLowerCase();
  if (n.includes("tumbler")) return "tumbler";
  if (n.includes("mug")) return "mug";
  if (n.includes("kit")) return "kit";
  if (n.includes("sampler") || n.includes("box")) return "box";
  return "bag";
}

export async function getProducts(): Promise<Product[]> {
  if (!WOO) return mockProducts;
  try {
    const res = await fetch(`${WOO}/wp-json/wc/store/v1/products?per_page=50`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Store API ${res.status}`);
    const data = (await res.json()) as StoreApiProduct[];
    return data.map((p) => {
      const unit = 10 ** p.prices.currency_minor_unit;
      const mock = mockProducts.find((m) => m.slug === p.slug);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.categories[0]?.name ?? "Shop",
        price: Number(p.prices.price) / unit,
        regularPrice: Number(p.prices.regular_price) / unit,
        onSale: p.on_sale,
        description: strip(p.short_description) || mock?.description || "",
        descriptionDraft: false,
        preview: mock?.preview ?? previewFor(p.name),
        label: mock?.label ?? p.name,
        photo: mock?.photo ?? null,
        permalink: p.permalink,
      };
    });
  } catch (err) {
    console.warn("[commerce] falling back to mock products:", err);
    return mockProducts;
  }
}

export const checkoutBase = WOO ? `${WOO}/checkout` : null;
