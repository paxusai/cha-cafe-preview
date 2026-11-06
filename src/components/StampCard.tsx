"use client";
import { useState } from "react";
import { LeafMark } from "./ui/LeafMark";

/** Newsletter / loyalty sign-up: "Stamp card goes digital" [CONFIRM programme]. */
export function StampCard() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="border-b border-white/10">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-10">
        <div className="flex items-center gap-6">
          <div className="grid shrink-0 grid-cols-5 gap-1.5" aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-full border ${i < 7 ? "border-leaf bg-leaf/15" : "border-white/20"}`}>
                {i < 7 && <LeafMark size={16} />}
              </span>
            ))}
          </div>
          <div>
            <p className="label text-sprout">Loyalty</p>
            <h3 className="display mt-1 text-3xl sm:text-4xl">Stamp card goes digital.</h3>
          </div>
        </div>
        {done ? (
          <p role="status" className="text-lg">
            You&apos;re on the list. We&apos;ll email you when the digital stamp card launches.
          </p>
        ) : (
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              // Stub: wire to the chosen ESP / loyalty platform [CONFIRM].
              setDone(true);
            }}
          >
            <label htmlFor="stamp-email" className="sr-only">
              Email address
            </label>
            <input
              id="stamp-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-5 text-[16px] text-paper placeholder:text-white/40 focus:border-sprout focus:outline-none"
            />
            <button type="submit" className="btn btn-leaf min-h-12">
              Join the list
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
