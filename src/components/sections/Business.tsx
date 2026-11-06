"use client";
import { useState } from "react";
import { site } from "@/lib/data";
import { IconMail } from "../ui/Icons";

/** For business: distributor brands, wholesale beans, franchise inquiry → chasaipan@gmail.com (§4.12). */
export function Business() {
  const [f, setF] = useState({ type: "Franchise", name: "", company: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const field = "mt-1.5 w-full rounded-xl border hairline bg-white px-3.5 py-3 text-[16px] outline-none focus:border-leaf-text";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [`${f.type} inquiry from the website`, "", `Name: ${f.name}`, `Company: ${f.company}`, `Email: ${f.email}`, `Phone: ${f.phone}`, "", f.message].join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(`${f.type} inquiry · ${f.company || f.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section id="business" aria-labelledby="business-title" className="relative border-t hairline bg-[#f3efe6]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <p className="label text-leaf-text">For business</p>
          <h2 id="business-title" className="display mt-3 text-5xl">
            Equipment, wholesale &amp; franchise.
          </h2>
          <p className="mt-4 max-w-md opacity-80">Cha is an official equipment distributor, supplies HARC beans wholesale and welcomes franchise inquiries.</p>
          <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Official distributor for">
            {site.coffee.distributor.map((b) => (
              <li key={b} className="flex min-h-16 items-center justify-center rounded-2xl border hairline bg-white px-3 text-center font-display text-sm font-extrabold uppercase tracking-wide">
                {b}
              </li>
            ))}
            <li className="flex min-h-16 items-center justify-center rounded-2xl bg-ink px-3 text-center text-xs font-semibold text-paper">Official distributor</li>
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5">
              <h3 className="font-display font-extrabold uppercase">Wholesale beans</h3>
              <p className="mt-1 text-sm opacity-75">HARC small-batch coffee for hotels, restaurants and offices.</p>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <h3 className="font-display font-extrabold uppercase">Franchise</h3>
              <p className="mt-1 text-sm opacity-75">Bring Cha&apos;s standards to a new location.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {sent ? (
            <div className="rounded-[32px] bg-white p-8" role="status">
              <h3 className="display text-3xl">Thanks — check your email app.</h3>
              <p className="mt-2 opacity-75">Your inquiry is addressed to {site.contact.email}. Hit send and the Cha team will reply.</p>
              <button type="button" className="btn btn-ghost mt-5" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 rounded-[32px] bg-white p-6 sm:grid-cols-2 sm:p-8">
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-semibold">I&apos;m interested in</legend>
                <div className="flex flex-wrap gap-1.5">
                  {["Franchise", "Wholesale beans", "Equipment"].map((t) => (
                    <label key={t} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-bold ${f.type === t ? "bg-ink text-paper" : "bg-ink/[0.05]"}`}>
                      <input type="radio" name="biz-type" className="sr-only" checked={f.type === t} onChange={() => setF((s) => ({ ...s, type: t }))} />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="text-sm font-semibold">
                Name
                <input required autoComplete="name" value={f.name} onChange={set("name")} className={field} />
              </label>
              <label className="text-sm font-semibold">
                Company
                <input autoComplete="organization" value={f.company} onChange={set("company")} className={field} />
              </label>
              <label className="text-sm font-semibold">
                Email
                <input required type="email" autoComplete="email" value={f.email} onChange={set("email")} className={field} />
              </label>
              <label className="text-sm font-semibold">
                Phone
                <input type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} className={field} />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Message
                <textarea required value={f.message} onChange={set("message")} className={`${field} min-h-28`} placeholder="Tell us about your location, volumes or the equipment you need." />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <p className="text-xs opacity-60">Sends to {site.contact.email}</p>
                <button type="submit" className="btn btn-leaf">
                  <IconMail /> Send inquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
