# Cha Cafe & Bistro: "From Leaf to Cup, Before Sunrise"

A cinematic sample website for **Cha Cafe & Bistro (Cha Saipan)**, built from the
*Cha Cafe Saipan: Research & Master Website Prompt* (Nov 5, 2026). It's a sales proposal
by Pacific Nexus AI to replace chacafeusa.com, and follows one Saipan morning at Cha,
from the 5 AM bakery shift to the drive-thru window.

## Run it

Requires Node 18.18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Nothing needs configuring: the sample runs on the mock data layer in `/data`. See
`.env.example` for the WooCommerce, WordPress and map switches.

## Stack (brief §3)

| Layer | Used here |
|-------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind CSS 4 with Cha tokens (`src/app/globals.css`) |
| Scroll story | GSAP + ScrollTrigger + SplitText (`src/lib/gsap.ts`) |
| Smooth scroll | Lenis, synced to ScrollTrigger (`src/components/SmoothScroll.tsx`) |
| 3D | React Three Fiber + drei (`src/components/three/*`), lazy-loaded per section |
| UI motion | Framer Motion (menu tabs, drawers, mobile menu, carousel) |
| Shaders | Custom GLSL: steam, latte swirl, flour-dust/bean particles, light beam (`three/shaders.tsx`) |
| Maps | MapLibre GL (open-source Mapbox GL) with a recoloured light basemap. Set a Mapbox style + token in `.env` to switch. |
| Commerce | WooCommerce Store API adapter + mock (`src/lib/server/commerce.ts`, `docs/WOOCOMMERCE.md`) |
| CMS | WordPress ACF adapter + JSON fallback (`src/lib/server/cms.ts`, `docs/CMS-SCHEMA.md`) |
| Images | `next/image`, AVIF/WebP |
| Fonts | Montserrat (display), Inter (body), JetBrains Mono (numerals), self-hosted via `@fontsource-variable` |

## Page map

| # | Section | File |
|---|---------|------|
| 001 | Before Sunrise: bean in a light beam → swirl → falling beans; pre-dawn → sunrise → bakery white | `sections/Hero.tsx`, `three/HeroScene.tsx` |
| 002 | Our story: pinned horizontal timeline (vertical stepper on mobile) | `sections/Story.tsx` |
| 003 | Roasted fresh (HARC): 3D bag with hibiscus label pours beans; La Marzocco + steam; latte swirl | `sections/Roast.tsx`, `three/RoastScene.tsx` |
| 004 | Baked every morning: pinned 5 AM kitchen, lamp switches on, flour dust, croissant + sugar | `sections/Bakery.tsx`, `three/BakeryScene.tsx` |
| 005 | Signature drinks: 3D Cha cup on a turntable, layers recolour, pearls drop; customizer | `sections/Drinks.tsx`, `three/CupScene.tsx` |
| 006 | Full menu (also `/menu`): leaf-underline tabs, search, filters, printable view | `components/MenuBrowser.tsx` |
| 007 | Premium cakes + pre-order | `sections/Cakes.tsx` |
| 008 | Coffee & Fuel: carrier slides in, map with 3 leaf pins, live status, promo | `sections/DriveThru.tsx`, `LocationsMap.tsx` |
| 009 | Shop: WooCommerce grid, cart drawer, 3D preview on hover | `sections/Shop.tsx`, `CartDrawer.tsx` |
| 010 | Cha Bistro teaser [CONFIRM] | `sections/Bistro.tsx` |
| | Reviews · For business · Final CTA · Footer | `sections/Reviews.tsx`, `Business.tsx`, `FinalCta.tsx`, `Footer.tsx` |

Global UI: sticky nav (transparent → frosted), full-screen mobile menu, chapter counter
and progress rail, mobile bottom bar, leaf cursor, first-visit preloader under 1.2 s,
order-ahead drawer, pause-motion control.

## Editing content

- **Menu and prices:** `data/menu.json`. Set `price` to a number to replace "TBC". Modifier
  upcharges are `delta` values, and the drink customizer's live price uses them.
- **Hours:** one file per location in `data/locations/`, 24 h `"HH:MM"` in Chamorro Time
  (Pacific/Saipan). The live "Open now · Closes at…" badges, footer, JSON-LD and map cards
  all read from these files.
- **Facts, story, promo, taglines:** `data/site.json`.
- **Reviews:** `data/reviews.json`. Real, verbatim quotes only. Never invent reviews.
- **Shop:** `data/shop.json`, or live from WooCommerce once `WOO_STORE_URL` is set.

## Swapping in real photos

The sample ships with **labelled photo slots** instead of stock images ("Never use stock
photos of other cafés", brief §6).

1. Get the originals from Cha (photo rights are a [CONFIRM] item).
2. Name each file after its slot id in `data/media.json` (e.g. `hero-espresso-pour.jpg`,
   `bakery-taro-bread.webp`, `harc-machine.avif`) and drop it into `public/photos/`.
3. Restart or rebuild. `src/lib/server/media.ts` finds the file and `next/image` serves it
   as AVIF/WebP. A full `https://` URL in `media.json` works too.

Every 3D object carries a "3D illustration" label so a render is never presented as a
product photo.

## Swapping in the vector logo

The logo is **never redrawn**. Until the vector arrives, the site loads Cha's own
published file (`chacafeusa.com/wp-content/uploads/2026/03/cha-logo-300x300.webp`).

1. Save the vector as `public/brand/cha-logo.svg`. It's picked up automatically
   (`.webp` / `.png` also work).
2. For the leaf-draw animations (preloader, hero, cursor, final CTA, favicon), copy the two
   leaf paths from the vector into `LEAF_PATHS` in `src/components/ui/LeafMark.tsx` and
   `src/app/icon.svg`. Those paths are a motion stand-in for the leaf only.
3. Brand fonts: if Cha has licensed campaign fonts, replace the `localFont` sources in
   `src/app/layout.tsx`.

## Open Graph

`src/app/opengraph-image.png` is a campaign-style card (black panel, date stack,
three locations), 1200 × 630. When real photos arrive, replace the file, or add
`opengraph-image.png` files per route. Its alt text is in `opengraph-image.alt.txt`.

## GitHub Pages preview

Live preview: **https://paxusai.github.io/cha-cafe-preview/**

`.github/workflows/pages.yml` rebuilds and republishes it on every push to `main`, as a
static site (no server). To build the same thing locally:

```bash
# stop `npm run dev` first; both use .next
PAGES_BASE_PATH=/cha-cafe-preview NEXT_PUBLIC_SITE_URL=https://paxusai.github.io/cha-cafe-preview npm run build
```

The site is written to `out/`. On a real server (`npm run build && npm start`, or
Vercel), leave both variables unset.

## Accessibility and performance notes

- One H1 per page, semantic sections, ARIA for tabs, the carousel, the cart and drawers;
  focus rings; 44 px tap targets; `#4E7D24` for green text (AA).
- `prefers-reduced-motion`: no pinning, scrubbing, 3D or smooth scroll, just static images
  and fades. The nav's pause button stops auto motion (carousel, 3D loops, CSS animation).
- Mobile (<768 px) and low-power devices get stills instead of WebGL. Each 3D canvas mounts
  only near the viewport. three.js and MapLibre are split out of the initial bundle.
- Run Lighthouse against `npm run build && npm start`, not the dev server.

## Deliverables checklist (brief, last section)

- [x] Full source
- [x] `data/menu.json` and the locations/hours config (`data/locations/*.json`)
- [x] CMS schema: `docs/CMS-SCHEMA.md`
- [x] WooCommerce integration guide: `docs/WOOCOMMERCE.md`
- [x] README for swapping in real photos and the vector logo (this file)
- [x] Every [CONFIRM] item: `CONFIRM.md`

*Website proposal by Pacific Nexus AI.*
