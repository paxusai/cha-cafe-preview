"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/data";
import { useApp } from "./AppProvider";
import { useSectionLink } from "./Nav";
import { IconBook, IconCart, IconPhone, IconPin } from "./ui/Icons";

/** Mobile bottom bar (§Global UI): Order · Menu · Locations · Call. Plus toasts. */
export function BottomBar() {
  const { openOrder, toast } = useApp();
  const { href, onClick } = useSectionLink();
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            data-chrome
            className="fixed inset-x-0 bottom-20 z-[80] mx-auto w-max max-w-[90vw] rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-xl md:bottom-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <nav data-chrome aria-label="Quick actions" className="frost fixed inset-x-0 bottom-0 z-50 flex border-t hairline pb-[env(safe-area-inset-bottom)] md:hidden">
        <button type="button" className={`${item} text-leaf-text`} onClick={() => openOrder()}>
          <IconCart /> Order
        </button>
        <Link className={item} href={href("menu")} onClick={onClick("menu")}>
          <IconBook /> Menu
        </Link>
        <Link className={item} href={href("drive-thru")} onClick={onClick("drive-thru")}>
          <IconPin /> Locations
        </Link>
        <a className={item} href={site.contact.phoneHref}>
          <IconPhone /> Call
        </a>
      </nav>
    </>
  );
}
