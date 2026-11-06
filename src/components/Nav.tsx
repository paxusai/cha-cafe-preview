"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scrollToId } from "@/lib/scroll";
import { locations, site } from "@/lib/data";
import { useApp } from "./AppProvider";
import { Logo } from "./ui/Logo";
import { OpenBadge } from "./ui/OpenBadge";
import { IconCart, IconClose, IconMenu, IconPause, IconPlay, IconPhone } from "./ui/Icons";

export const NAV_LINKS = [
  { id: "menu", label: "Menu" },
  { id: "bakery", label: "Bakery" },
  { id: "cakes", label: "Cakes" },
  { id: "drive-thru", label: "Drive-Thru" },
  { id: "shop", label: "Shop" },
  { id: "story", label: "Story" },
];

export function useSectionLink() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  return {
    onHome,
    href: (id: string) => (onHome ? `#${id}` : `/#${id}`),
    onClick: (id: string, after?: () => void) => (e: MouseEvent) => {
      if (!onHome) return after?.();
      e.preventDefault();
      after?.();
      scrollToId(id);
    },
  };
}

export function Nav() {
  const { cart, setCartOpen, openOrder, motionPaused, setMotionPaused } = useApp();
  const { onHome, href, onClick } = useSectionLink();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = cart.reduce((n, l) => n + l.qty, 0);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const solid = scrolled || !onHome;
  const fg = solid ? "text-ink" : "text-paper";

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header
        data-chrome
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500 ${solid ? "frost shadow-[0_1px_0_rgba(22,22,22,0.08)]" : "bg-transparent"} ${fg}`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav aria-label="Primary" className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="Cha Cafe & Bistro — home" className="shrink-0" onClick={onHome ? (e) => (e.preventDefault(), scrollToId("top")) : undefined}>
            <Logo size={46} chip={!solid} />
          </Link>

          <ul className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <Link href={href(l.id)} onClick={onClick(l.id)} className="group relative rounded-full px-3 py-2 text-sm font-semibold">
                  {l.label}
                  <span className="absolute inset-x-3 bottom-1 h-[2px] origin-left scale-x-0 bg-leaf transition-transform duration-500 group-hover:scale-x-100" style={{ transitionTimingFunction: "var(--ease-enter)" }} />
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMotionPaused(!motionPaused)}
              className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-current/10 md:inline-flex"
              aria-pressed={motionPaused}
              aria-label={motionPaused ? "Resume motion" : "Pause motion"}
              title={motionPaused ? "Resume motion" : "Pause motion"}
            >
              {motionPaused ? <IconPlay /> : <IconPause />}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-current/10"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <IconCart />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-leaf px-1 text-[11px] font-bold text-ink tnum">{count}</span>
              )}
            </button>
            <button type="button" onClick={() => openOrder()} className="btn btn-leaf hidden sm:inline-flex">
              Order
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-current/10 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <IconMenu />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="on-dark fixed inset-0 z-[60] flex flex-col bg-ink text-paper"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.87, 0, 0.13, 1] }}
          >
            <div className="flex items-center justify-between px-4 sm:px-6" style={{ height: "var(--nav-h)" }}>
              <Logo size={46} chip />
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close menu">
                <IconClose />
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-1 px-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}>
                  <Link href={href(l.id)} onClick={onClick(l.id, () => setOpen(false))} className="display flex items-baseline gap-4 py-1.5 text-[13vw] sm:text-7xl">
                    <span className="label text-sprout">{String(i + 1).padStart(3, "0")}</span>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-white/10 px-6 py-5">
              {locations.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{l.name}</span>
                  <OpenBadge loc={l} size="sm" tone="dark" short />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" className="btn btn-leaf flex-1" onClick={() => (setOpen(false), openOrder())}>
                  Order ahead
                </button>
                <a href={site.contact.phoneHref} className="btn btn-ghost flex-1">
                  <IconPhone /> Call
                </a>
              </div>
              <button type="button" onClick={() => setMotionPaused(!motionPaused)} className="label inline-flex min-h-11 items-center gap-2 opacity-70" aria-pressed={motionPaused}>
                {motionPaused ? <IconPlay width={14} /> : <IconPause width={14} />} {motionPaused ? "Resume motion" : "Pause motion"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
