"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { formatPrice } from "@/lib/data";
import type { Media, Product } from "@/lib/types";
import { useApp } from "../AppProvider";
import { ChapterHead } from "../ui/ChapterHead";
import { IconCart } from "../ui/Icons";
import { Illus } from "../ui/Illus";
import { PhotoSlot } from "../ui/PhotoSlot";
import { SplitHeadline } from "../ui/SplitHeadline";

const ProductScene = dynamic(() => import("../three/SmallScenes").then((m) => m.ProductScene), { ssr: false });

function ProductCard({ p, media }: { p: Product; media: Media }) {
  const { addToCart, allow3D } = useApp();
  const [hover, setHover] = useState(false);
  const photo = p.photo ? media[p.photo] : undefined;
  return (
    <li className="lift group flex flex-col overflow-hidden rounded-3xl border hairline bg-white" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="relative aspect-square bg-[#f3efe6]">
        {photo?.src ? (
          <div className="absolute inset-0">
            <PhotoSlot slot={photo} quiet className="h-full w-full" sizes="(max-width:768px) 50vw, 25vw" />
          </div>
        ) :<div className="absolute inset-0 flex items-center justify-center"><Illus k={p.preview} className="h-1/2 w-1/2" label={p.name} /></div>}
        {/* 3D preview on hover (desktop) */}
        {allow3D && hover && (
          <div className="absolute inset-0 bg-[#f3efe6]">
            <ProductScene kind={p.preview} label={p.label} />
            <span className="label absolute bottom-2 left-3 text-[10px] opacity-50">3D preview</span>
          </div>
        )}
        {p.onSale && <span className="absolute left-3 top-3 rounded-full bg-hibiscus px-2.5 py-1 text-[11px] font-bold uppercase text-white">Sale</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="label opacity-50">{p.category}</p>
        <h3 className="mt-1 font-display text-lg font-extrabold uppercase leading-tight">{p.name}</h3>
        <p className="mt-1 text-sm opacity-70">{p.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="tnum">
            <span className="font-display text-2xl font-extrabold">{formatPrice(p.price)}</span>
            {p.onSale && (
              <span className="ml-2 text-sm line-through opacity-50">
                <span className="sr-only">was </span>
                {formatPrice(p.regularPrice)}
              </span>
            )}
          </p>
          <button type="button" onClick={() => addToCart(p)} className="btn btn-leaf" aria-label={`Add ${p.name} to cart`}>
            <IconCart width={18} /> Add
          </button>
        </div>
      </div>
    </li>
  );
}

/** 009 · Shop — WooCommerce product grid (mock data layer in the sample). */
export function Shop({ products, media }: { products: Product[]; media: Media }) {
  const { setCartOpen, cart } = useApp();
  const count = cart.reduce((n, l) => n + l.qty, 0);
  return (
    <section id="shop" aria-labelledby="shop-title" className="relative bg-paper">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <ChapterHead n="009" kicker="Shop" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SplitHeadline id="shop-title" className="display text-[12vw] sm:text-7xl lg:text-[5.4vw] 3xl:text-[104px]">
            Take Cha home.
          </SplitHeadline>
          <button type="button" onClick={() => setCartOpen(true)} className="btn btn-ink">
            <IconCart /> Cart{count ? ` · ${count}` : ""}
          </button>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} media={media} />
          ))}
        </ul>
        <p className="label mt-4 text-[10px] opacity-50">Prices and product photos from the chacafeusa.com shop, Nov 5, 2026 · checkout via WooCommerce</p>
      </div>
    </section>
  );
}
