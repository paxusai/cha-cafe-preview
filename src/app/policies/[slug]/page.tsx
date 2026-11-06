import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/data";

/** Policy pages are placeholders until Cha supplies its own text [CONFIRM]. */
const POLICIES: Record<string, { title: string; intro: string; points: string[] }> = {
  privacy: {
    title: "Privacy policy",
    intro: "How Cha Cafe & Bistro handles the information you share through this website.",
    points: [
      "Order-ahead, cake pre-order and inquiry forms open your own email app; nothing is stored by this website.",
      "Your cart is kept in your own browser only.",
      "Checkout runs on Cha's WooCommerce shop, which has its own privacy terms.",
      `Questions: ${site.contact.email}.`,
    ],
  },
  refunds: {
    title: "Refunds",
    intro: "Refund and exchange terms for shop orders and cake pre-orders.",
    points: ["Refund window and conditions for shop goods.", "Cancellation terms and deposits for cake pre-orders.", `Contact ${site.contact.email} or ${site.contact.phone}.`],
  },
  terms: {
    title: "Terms of use",
    intro: "The terms that apply when you use this website and place orders.",
    points: ["Menu items and prices may change; prices shown as TBC are confirmed by Cha.", "Order-ahead requests are confirmed by Cha before pickup.", "Promotions run while stated and may have conditions."],
  },
  shipping: {
    title: "Shipping",
    intro: "Shipping and pickup options for coffee beans, kits and merchandise.",
    points: ["Pickup at Cha Main, Beach Road, Garapan.", "Island delivery and off-island shipping options and rates.", "Processing times."],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POLICIES[slug];
  return p ? { title: p.title, robots: { index: false } } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POLICIES[slug];
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-[calc(var(--nav-h)+48px)] sm:px-6">
      <p className="label text-leaf-text">Policies</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">{p.title}</h1>
      <p className="mt-6 rounded-2xl bg-sprout/25 p-4 text-sm">Draft placeholder — Cha to supply the final policy text before launch.</p>
      <p className="mt-6 text-lg opacity-80">{p.intro}</p>
      <ul className="mt-6 list-disc space-y-2 pl-5">
        {p.points.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <Link href="/" className="btn btn-ink mt-10">
        Back to Cha
      </Link>
    </article>
  );
}
