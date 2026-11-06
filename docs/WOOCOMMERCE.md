# WooCommerce integration guide

Cha already runs a WordPress + WooCommerce shop at chacafeusa.com. This front end keeps
it as the commerce backend (products, cart, checkout, payments, orders) and only
replaces what customers see.

## 1. Products (read): already wired

`src/lib/server/commerce.ts` reads the public **WooCommerce Store API**, which needs no
API keys for reads:

```
GET {WOO_STORE_URL}/wp-json/wc/store/v1/products?per_page=50
```

Turn it on by setting one variable:

```
WOO_STORE_URL=https://www.chacafeusa.com
```

Products are cached for 5 minutes (`revalidate: 300`). If the request fails, the site
falls back to `data/shop.json`, so the shop never renders empty. The 3D hover preview and
the photo slot are matched by product `slug`. Keep the slugs in `data/shop.json` in sync,
or add new ones there.

## 2. Checkout hand-off (sample behaviour)

With `WOO_STORE_URL` set, **Checkout** in the cart drawer sends the customer to
`{WOO_STORE_URL}/checkout?add-to-cart={id}&quantity={qty}`. That native WooCommerce URL
only supports one product, so the next step is the cart sync below.

## 3. Full cart sync (production)

Use the Store API cart endpoints from the browser so the WooCommerce session cookie is
set on Cha's domain:

1. Serve the front end and WordPress from the same site (for example `www.chacafeusa.com`
   for the front end and `shop.chacafeusa.com` for WordPress), with CORS and
   `SameSite=None; Secure` cookies, or proxy `/wp-json/wc/store/*` through Next.js
   rewrites in `next.config.ts`.
2. `GET /wp-json/wc/store/v1/cart` → read the `Nonce` (or `Cart-Token`) header.
3. For each line in `AppProvider → cart`:
   `POST /wp-json/wc/store/v1/cart/add-item { id, quantity }` with the `Nonce` header.
4. Redirect to `/checkout`. WooCommerce takes the payment with Cha's existing gateways.

Swap step 3 into `CartDrawer.tsx → checkout()`. Everything else in the drawer stays the same.

## 4. Cake pre-orders

Recommended: create each premium cake as a **variable product** with a `Size` attribute
(Slice / Mini / Regular) and add **WooCommerce Bookings** or a date-picker add-on for the
pickup date and lead time. Then `Cakes.tsx` can post the order to the cart instead of the
email hand-off it uses now.

## 5. Order-ahead for drinks

WooCommerce can do it (a "Café" product category plus a pickup-time plugin), but a café
POS with online ordering (Square, Toast, Clover) is usually a better fit for a busy
drive-thru. `OrderDrawer.tsx` builds a clean order summary today, so it can post to
whichever platform Cha picks [CONFIRM].

## 6. Product schema

`src/lib/jsonld.ts` emits schema.org `Product` + `Offer` for every shop item, using
whatever `getProducts()` returns, so live WooCommerce prices flow into SEO automatically.
