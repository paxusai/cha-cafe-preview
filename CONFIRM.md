# Every [CONFIRM] item

Placeholders in this sample that Cha must confirm before launch. Each one lives in a
single place, listed in the right-hand column, so the swap is a one-line edit.

## The 10 items from the research brief

| # | Item | Where it lives in the sample |
|---|------|------------------------------|
| 1 | **Full current menu with prices**: coffee, teas & blended, bread, cakes (slice / mini / regular), brunch, drive-thru, seasonal specials. Today they're only in Instagram highlights. | `data/menu.json`: every `price` is `null` (shows "TBC"). Size, milk and pearl upcharges are `delta: null`. |
| 2 | **Hours for each location.** Sources disagree. Placeholders: Main Mon–Fri 7 AM–6 PM, Sat–Sun 7 AM–9 PM; drive-thrus 6 AM–5 PM. | `data/locations/main.json`, `middle-road.json`, `chalan-kiya.json` → `hours`, `hoursConfirmed: false` |
| 3 | **Cha Bistro status.** Is the second-floor dining room still open? Menu, hours (Tripadvisor 2019: lunch 11 AM–1:30 PM, dinner 6–9 PM), reservations. | `src/components/sections/Bistro.tsx`, `data/site.json → subBrands.bistro` |
| 4 | **Exact addresses and map pins** for Mobil Middle Road (pin decoded from plus code 6P49+9X) and Mobil Chalan Kiya (pin is the village centre, **not** the station). | `data/locations/*.json → geo` (`confirmed: false` draws a dashed pin and routes Directions by plus code / name) |
| 5 | **Vector logo and brand fonts.** Only a 300 px WebP is online. | Drop `cha-logo.svg` into `public/brand/` (see README). Leaf motion paths: `src/components/ui/LeafMark.tsx → LEAF_PATHS` |
| 6 | **Coffee origins and the HARC roast lineup.** The bags show Guatemala Medium and Brazil Dark. | `data/site.json → coffee.origins` |
| 7 | **Online ordering.** Order-ahead for pickup or drive-thru? Which platform? Keep WooCommerce or move? | `src/components/OrderDrawer.tsx` (email hand-off stub), `data/site.json → contact.whatsapp` |
| 8 | **Cake pre-order process**: lead time, sizes, prices, custom messages, pickup locations. | `src/components/sections/Cakes.tsx → LEAD_DAYS = 2`, `data/menu.json → modifiers.cakeSize` |
| 9 | **Photo rights and originals** for website, Facebook and Instagram images. 25 of 37 photo slots already load photos straight from Cha's own site (chacafeusa.com): hero espresso pour, story, roast, bakery, menu, cakes, drive-thru, Bistro and all seven shop products. Still placeholders, because no matching photo was found: the 2012 Beach Road shop, the 2023 award, the Chalan Kiya drive-thru, most bakery items (croissants, taro bread, cinnamon roll, tart, banana bread, bagels), the campaign posters and the Bistro dining room. | `data/media.json` (slots with `"credit": "chacafeusa.com"` point at Cha's URLs), `public/photos/` |
| 10 | **Franchise and equipment pages**: how much to feature La Marzocco, Mazzer, Curtis, Schaerer and WMF, and the franchise inquiry. | `src/components/sections/Business.tsx` |

## Other placeholders in the build

| Item | Where |
|------|-------|
| Menu descriptions written from item names only (`descriptionDraft: true`) | `data/menu.json` |
| Hot / iced / dietary tags inferred from item names (`tagsDraft: true`) | `data/menu.json` |
| Cup sizes (Regular / Large) and their upcharges | `data/menu.json → modifiers.size` |
| Full drive-thru menu (only Lemonade Charger 24 oz is confirmed) | `data/menu.json → categories.drive` |
| Current seasonal specials (Instagram highlight "Fall Specials") | `data/menu.json → categories.seasonal` (empty) |
| Owner approval to publish the six quoted reviews | `data/reviews.json → _meta.approved: false` |
| Year Cha moved to the 50-seat space ("about two years in") | `data/site.json → story[1]` |
| Opening year of the Middle Road drive-thru | `data/site.json → story[3]` |
| Whether drive-thru order-ahead is offered with the Coffee & Fuel promo | `src/components/sections/DriveThru.tsx` |
| WhatsApp number for order hand-off (button hidden while `null`) | `data/site.json → contact.whatsapp` |
| Direct phone lines for each drive-thru (all use the main number now) | `data/locations/*.json → phone` |
| Parking guidance shown on the main café card | `data/locations/main.json → notes` |
| Newsletter / loyalty platform for "Stamp card goes digital" (form is a stub) | `src/components/StampCard.tsx` |
| Shop product descriptions (prices are verified) | `data/shop.json` |
| Privacy, refunds, terms and shipping policy text | `src/app/policies/[slug]/page.tsx` |
| Public website URL for canonical / Open Graph (defaults to chacafeusa.com) | `.env → NEXT_PUBLIC_SITE_URL` |
| 3D artist models (glTF + Draco/KTX2) to replace the procedural stand-ins | `src/components/three/models.tsx` |
