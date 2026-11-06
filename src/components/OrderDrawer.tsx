"use client";
import { useEffect, useMemo, useState } from "react";
import { findMenuItem, formatPrice, locations, menu, site } from "@/lib/data";
import { todayHours } from "@/lib/hours";
import { useApp } from "./AppProvider";
import { Customizer } from "./ui/Customizer";
import { Drawer } from "./ui/Drawer";
import { OpenBadge } from "./ui/OpenBadge";
import { IconCar, IconMail } from "./ui/Icons";

/**
 * Order ahead for pickup or drive-thru (§9). No POS integration yet [CONFIRM
 * platform], so the order is handed to Cha by email (and WhatsApp once a number
 * is confirmed in data/site.json).
 */
export function OrderDrawer() {
  const { orderOpen, setOrderOpen, orderLocation, order, setOrderQty, clearOrder, addToOrder, notify } = useApp();
  const [locId, setLocId] = useState(orderLocation);
  const [time, setTime] = useState("asap");
  const [at, setAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pick, setPick] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setLocId(orderLocation), [orderLocation, orderOpen]);
  const loc = locations.find((l) => l.id === locId) ?? locations[0];
  const picked = pick ? findMenuItem(pick) : null;
  const orderable = useMemo(() => menu.categories.filter((c) => c.items.length && c.id !== "cakes"), []);

  const body = () => {
    const lines = order.map((l) => `• ${l.qty} × ${l.name}${l.options.length ? ` (${l.options.join(", ")})` : ""} — ${formatPrice(l.price)}`);
    return [
      `New order-ahead request from the website`,
      ``,
      `Location: ${loc.fullName}`,
      `Mode: ${loc.type === "drive-thru" ? "Drive-thru pickup" : "Counter pickup"}`,
      `Pickup: ${time === "asap" ? "As soon as possible" : at}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      ``,
      ...lines,
      notes ? `\nNotes: ${notes}` : "",
      ``,
      `Prices to be confirmed by Cha.`,
    ].join("\n");
  };

  const submit = (via: "email" | "whatsapp") => {
    if (!order.length) return setError("Add at least one item.");
    if (!name.trim() || !phone.trim()) return setError("Add your name and phone so Cha can confirm.");
    if (time === "at" && !at) return setError("Pick a pickup time.");
    setError("");
    const subject = `Order ahead · ${name} · ${loc.name} · ${time === "asap" ? "ASAP" : at}`;
    if (via === "whatsapp" && site.contact.whatsapp) {
      window.open(`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(body())}`, "_blank", "noopener");
    } else {
      window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
    }
    setSent(true);
    notify("Order handed to your email app");
  };

  const field = "w-full rounded-xl border hairline bg-white px-3.5 py-3 text-[16px] outline-none focus:border-leaf-text";

  return (
    <Drawer
      open={orderOpen}
      onClose={() => (setOrderOpen(false), setSent(false))}
      title={sent ? "See you soon" : "Order ahead"}
      kicker="Pickup · Drive-thru"
      width="max-w-lg"
      footer={
        !sent && (
          <div className="space-y-2">
            {error && (
              <p role="alert" className="text-sm font-semibold text-hibiscus">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-leaf flex-1" onClick={() => submit("email")}>
                <IconMail /> Send order to Cha
              </button>
              {site.contact.whatsapp && (
                <button type="button" className="btn btn-ink" onClick={() => submit("whatsapp")}>
                  WhatsApp
                </button>
              )}
            </div>
            <p className="text-center text-[11px] opacity-60">Sample hand-off by email · online ordering platform to be confirmed</p>
          </div>
        )
      }
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-lg">
            Your email app opened with the order for <strong>{loc.name}</strong>. Cha confirms by phone or email before your pickup.
          </p>
          <p className="text-sm opacity-70">No email app? Call {site.contact.phone} and read your order out.</p>
          <div className="flex gap-2">
            <a className="btn btn-ink" href={site.contact.phoneHref}>
              Call {site.contact.phoneShort}
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => (clearOrder(), setSent(false))}>
              Start a new order
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-7" onSubmit={(e) => (e.preventDefault(), submit("email"))}>
          <fieldset>
            <legend className="label mb-3">1 · Where</legend>
            <div className="space-y-2">
              {locations.map((l) => (
                <label key={l.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors ${locId === l.id ? "border-ink bg-white" : "hairline hover:bg-white/60"}`}>
                  <input type="radio" name="order-loc" className="mt-1 accent-[var(--leaf-text)]" checked={locId === l.id} onChange={() => setLocId(l.id)} />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {l.type === "drive-thru" && <IconCar width={16} />}
                      {l.name}
                      {l.isNew && <span className="rounded-full bg-hibiscus px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-80">
                      <OpenBadge loc={l} size="sm" short />
                      <span className="tnum">Today {todayHours(l)}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">2 · When</legend>
            <div className="flex flex-wrap gap-2">
              {[
                ["asap", "As soon as possible"],
                ["at", "At a time"],
              ].map(([v, l]) => (
                <label key={v} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ${time === v ? "bg-ink text-paper" : "bg-ink/[0.05]"}`}>
                  <input type="radio" className="sr-only" name="order-time" checked={time === v} onChange={() => setTime(v)} />
                  {l}
                </label>
              ))}
              {time === "at" && (
                <input type="time" aria-label="Pickup time (Chamorro Time)" className={`${field} w-auto`} value={at} onChange={(e) => setAt(e.target.value)} required />
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">3 · What</legend>
            {order.length > 0 && (
              <ul className="mb-4 divide-y hairline rounded-2xl border hairline bg-white">
                {order.map((l) => (
                  <li key={l.key} className="flex items-center gap-3 px-3.5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{l.name}</div>
                      {l.options.length > 0 && <div className="text-xs opacity-70">{l.options.join(" · ")}</div>}
                    </div>
                    <span className="text-sm tnum opacity-70">{formatPrice(l.price)}</span>
                    <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${l.name}`}>
                      <button type="button" className="h-9 w-9 rounded-full bg-ink/5 font-bold" onClick={() => setOrderQty(l.key, l.qty - 1)} aria-label={`Remove one ${l.name}`}>
                        −
                      </button>
                      <span className="w-5 text-center tnum">{l.qty}</span>
                      <button type="button" className="h-9 w-9 rounded-full bg-ink/5 font-bold" onClick={() => setOrderQty(l.key, l.qty + 1)} aria-label={`Add one ${l.name}`}>
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="order-pick">
              Add an item
            </label>
            <select id="order-pick" className={field} value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">Choose from the menu…</option>
              {orderable.map((c) => (
                <optgroup key={c.id} label={c.label}>
                  {c.items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {picked && (
              <div className="mt-3 rounded-2xl bg-white p-4">
                <div className="mb-3 font-semibold">{picked.item.name}</div>
                {picked.item.customize?.length ? (
                  <Customizer key={picked.item.id} item={picked.item} compact />
                ) : (
                  <button type="button" className="btn btn-leaf" onClick={() => addToOrder({ itemId: picked.item.id, name: picked.item.name, options: [], price: picked.item.price })}>
                    Add {picked.item.name}
                  </button>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="label mb-3">4 · Who</legend>
            <label className="block text-sm font-semibold">
              Name
              <input className={`${field} mt-1.5`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block text-sm font-semibold">
              Phone
              <input className={`${field} mt-1.5`} type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              Notes <span className="font-normal opacity-60">(optional)</span>
              <textarea className={`${field} mt-1.5 min-h-20`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Car colour for the drive-thru, allergies…" />
            </label>
          </fieldset>
        </form>
      )}
    </Drawer>
  );
}
