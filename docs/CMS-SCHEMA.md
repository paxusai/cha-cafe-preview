# CMS schema: owner-editable menu, prices, hours and specials

The brief asks that Cha can edit the menu, prices, hours and specials without a developer.
The sample reads JSON files. Production reads the same shapes from WordPress (ACF),
because Cha already runs WordPress.

## Where the data comes from

| Data | Sample source | Production source | Loader |
|------|---------------|-------------------|--------|
| Menu, prices, modifiers | `data/menu.json` | `GET {WP_API_URL}/wp-json/cha/v1/menu` | `src/lib/server/cms.ts → getMenu()` |
| Locations and hours | `data/locations/*.json` (one file per location) | `GET {WP_API_URL}/wp-json/cha/v1/locations` | `getLocations()` |
| Shop products | `data/shop.json` | WooCommerce Store API | `src/lib/server/commerce.ts` |
| Business facts, story, promo | `data/site.json` | (optional) ACF options page | `src/lib/data.ts` |

Set `WP_API_URL` and the loaders switch over. If WordPress is unreachable they fall back
to the JSON files.

## ACF field groups

### Options page "Cha Menu"

- `categories` (Repeater)
  - `id` (Text, slug, e.g. `coffee`)
  - `label` (Text, e.g. "Coffee")
  - `blurb` (Text)
  - `items` (Repeater)
    - `id` (Text, slug)
    - `name` (Text)
    - `description` (Textarea)
    - `price` (Number, empty = "TBC")
    - `temps` (Checkbox: hot, iced, blended)
    - `dietary` (Checkbox: Dairy-free, Dairy-free option, Plant milk option, No added sugar, Contains nuts, Coconut, Coffee-free)
    - `customize` (Checkbox: size, milk, pearls)
    - `signature` (True/False)
    - `photo` (Image, optional)
- `modifiers` (Group): `size`, `milk`, `pearls`, `cakeSize`, each a Repeater of `id`, `label`, `delta` (Number)

### Custom post type "Location"

- `order` (Number), `name`, `fullName`, `type` (Select: cafe, drive-thru), `typeLabel`
- `address` (Group: street, locality, region, postalCode, country)
- `plusCode` (Text)
- `geo` (Google Map field → lat, lng) + `geoConfirmed` (True/False)
- `phone` (Text)
- `services` (Repeater of Text)
- `hours` (Group: mon … sun, each a Repeater of `open` / `close` time pickers, 24 h)
- `hoursConfirmed` (True/False)
- `notes` (Repeater of Text)

### Options page "Specials & promo"

- `seasonal` (Relationship to menu items, or its own Repeater with the item fields above)
- `promo` (Group: title, offers Repeater {spend, at, get, reward, condition}, since)

## REST endpoints (small plugin)

Register `cha/v1/menu` and `cha/v1/locations` with `register_rest_route` and return the
ACF values in the exact JSON shape of `data/menu.json` and `data/locations/*.json`. On
save, call the Next.js on-demand revalidation route with the `menu` or `locations` tag
so changes go live within seconds.

## Sanity alternative

If Cha prefers Sanity, keep the same three document types (`menu`, `location`, `promo`).
`cms.ts` is the only file that changes.
