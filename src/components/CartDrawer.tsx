"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/data";
import { useApp } from "./AppProvider";
import { Drawer } from "./ui/Drawer";
import { Illus } from "./ui/Illus";
import type { IllustrationKey } from "@/lib/types";

/**
 * Shop cart drawer (§4.9). In production checkout hands off to the existing
 * WooCommerce checkout (WOO_STORE_URL); the sample shows a review step instead.
 */
export function CartDrawer({ checkoutUrl, previews }: { checkoutUrl: string | null; previews: Record<string, IllustrationKey> }) {
  const { cart, setQty, cartOpen, setCartOpen, notify } = useApp();
  const [review, setReview] = useState(false);
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);

  const checkout = () => {
    if (checkoutUrl) {
      // Store API cart sync goes here (docs/WOOCOMMERCE.md §3); single-item fallback:
      const first = cart[0];
      window.location.href = `${checkoutUrl}?add-to-cart=${first.id}&quantity=${first.qty}`;
      return;
    }
    setReview(true);
  };

  return (
    <Drawer
      open={cartOpen}
      onClose={() => (setCartOpen(false), setReview(false))}
      title={review ? "Checkout" : "Your cart"}
      kicker="009 · Shop"
      footer={
        cart.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-display text-2xl font-extrabold tnum">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs opacity-60">Shipping, pickup and taxes are calculated at checkout.</p>
            {!review ? (
              <button type="button" onClick={checkout} className="btn btn-leaf w-full">
                Checkout
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ink w-full"
                onClick={() => {
                  notify("Sample site: no payment taken");
                  setReview(false);
                }}
              >
                Pay securely with WooCommerce
              </button>
            )}
          </div>
        )
      }
    >
      {cart.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <Illus k="bag" className="h-28 w-28 opacity-80" />
          <p className="font-semibold">Your cart is empty.</p>
          <p className="max-w-xs text-sm opacity-70">HARC beans, the Milk Tea Kit and Cha tumblers ship from the shop.</p>
        </div>
      ) : (
        <>
          {review && (
            <div className="mb-5 rounded-2xl bg-sprout/25 p-4 text-sm">
              <strong className="block">Sample checkout</strong>
              In production this step hands the cart to Cha&apos;s existing WooCommerce checkout (cards, shipping, pickup). No payment is taken on this sample.
            </div>
          )}
          <ul className="divide-y hairline" aria-label="Cart items">
            {cart.map((l) => (
              <li key={l.id} className="flex items-center gap-4 py-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink/[0.04]">
                  <Illus k={previews[l.slug] ?? "bag"} className="h-12 w-12" label={l.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{l.name}</div>
                  <div className="text-sm opacity-70 tnum">{formatPrice(l.price)}</div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-ink/[0.05] p-1" role="group" aria-label={`Quantity of ${l.name}`}>
                  <button type="button" className="h-9 w-9 rounded-full font-bold hover:bg-ink/10" onClick={() => setQty(l.id, l.qty - 1)} aria-label={`Remove one ${l.name}`}>
                    −
                  </button>
                  <span className="w-6 text-center font-semibold tnum" aria-live="polite">
                    {l.qty}
                  </span>
                  <button type="button" className="h-9 w-9 rounded-full font-bold hover:bg-ink/10" onClick={() => setQty(l.id, l.qty + 1)} aria-label={`Add one ${l.name}`}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Drawer>
  );
}
