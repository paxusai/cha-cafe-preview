import { openingHoursSpec } from "./hours";
import { site } from "./data";
import type { Location, Product } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chacafeusa.com").replace(/\/$/, "");

const award = `${site.award.program} ${site.award.year} – ${site.award.title} (${site.award.level})`;
const sameAs = site.social.map((s) => s.url);

/** §10: Organization + one CafeOrCoffeeShop per location, plus Product schema for the shop. */
export function buildJsonLd(locations: Location[], products: Product[], logo: string) {
  const orgId = `${SITE_URL}/#organization`;
  const org = {
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    alternateName: site.alsoKnownAs,
    url: SITE_URL,
    logo,
    foundingDate: String(site.founded),
    founder: { "@type": "Person", name: site.owner.name },
    email: site.contact.email,
    telephone: site.contact.phone,
    award,
    sameAs,
    subOrganization: { "@type": "Organization", name: "Hafa Adai Roasting Company", alternateName: "HARC" },
  };

  const shops = locations.map((l) => ({
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/#${l.id}`,
    name: l.fullName,
    parentOrganization: { "@id": orgId },
    image: logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address.street,
      addressLocality: `${l.address.locality}, Saipan`,
      addressRegion: "MP",
      postalCode: l.address.postalCode,
      addressCountry: l.address.country,
    },
    ...(l.geo ? { geo: { "@type": "GeoCoordinates", latitude: l.geo.lat, longitude: l.geo.lng } } : {}),
    telephone: site.contact.phone,
    openingHoursSpecification: openingHoursSpec(l),
    priceRange: "$",
    servesCuisine: ["Specialty coffee", "Milk tea", "Bakery", "American", "Breakfast"],
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: false,
    sameAs,
    award,
  }));

  const items = products.map((p) => ({
    "@type": "Product",
    "@id": `${SITE_URL}/#product-${p.slug}`,
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: "Cha" },
    category: p.category,
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/#shop`,
    },
  }));

  return { "@context": "https://schema.org", "@graph": [org, ...shops, ...items] };
}
