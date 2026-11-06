import Link from "next/link";
import { locations, site } from "@/lib/data";
import { weeklyRows } from "@/lib/hours";
import { Logo } from "./ui/Logo";
import { OpenBadge } from "./ui/OpenBadge";
import { IconSocial } from "./ui/Icons";
import { StampCard } from "./StampCard";

const POLICIES = [
  { slug: "privacy", label: "Privacy" },
  { slug: "refunds", label: "Refunds" },
  { slug: "terms", label: "Terms" },
  { slug: "shipping", label: "Shipping" },
];

export function Footer() {
  return (
    <footer className="on-dark relative bg-ink pb-24 text-paper md:pb-0" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Cha Cafe &amp; Bistro — locations and contact
      </h2>
      <StampCard />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-3">
          <Logo size={72} chip />
          <p className="mt-5 max-w-xs text-sm leading-relaxed opacity-75">{site.ownerDescription}</p>
          <p className="label mt-6 text-sprout">Est. {site.founded} · Garapan, Saipan</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 lg:col-span-6">
          {locations.map((l) => (
            <div key={l.id}>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">{l.name}</h3>
              <p className="mt-1 text-sm opacity-70">{l.address.street}</p>
              <div className="mt-3">
                <OpenBadge loc={l} size="sm" tone="dark" short />
              </div>
              <dl className="mt-3 space-y-1 text-sm tnum">
                {weeklyRows(l).map((r) => (
                  <div key={r.days} className="flex justify-between gap-3">
                    <dt className="opacity-70">{r.days}</dt>
                    <dd>{r.hours}</dd>
                  </div>
                ))}
              </dl>
              {!l.hoursConfirmed && <p className="label mt-2 text-[10px] opacity-50">Hours to be confirmed</p>}
            </div>
          ))}
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div>
            <h3 className="label opacity-60">Contact</h3>
            <a href={site.contact.phoneHref} className="mt-2 block text-lg font-semibold hover:text-sprout">
              {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="block hover:text-sprout">
              {site.contact.email}
            </a>
          </div>
          <div>
            <h3 className="label opacity-60">Follow</h3>
            <ul className="mt-2 flex gap-2">
              {site.social.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/8 hover:bg-white/15" aria-label={`${s.label}${s.stat ? ` (${s.stat})` : ""}`}>
                    <IconSocial id={s.id} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label opacity-60">For business</h3>
            <Link href="/#business" className="mt-2 block text-sm hover:text-sprout">
              Franchise &amp; wholesale · {site.coffee.distributor.join(" / ")} distributor
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link href={`/policies/${p.slug}`} className="inline-flex min-h-11 items-center opacity-70 hover:opacity-100 md:min-h-0">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="opacity-60">
            © {new Date().getFullYear()} {site.name}. Est. {site.founded}. · {site.proposal.line}
          </p>
        </div>
      </div>
    </footer>
  );
}
