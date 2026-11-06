"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose } from "./Icons";

/** Slide-out drawer: Esc closes, focus is trapped and restored, ARIA dialog. */
export function Drawer({ open, onClose, title, kicker, children, footer, width = "max-w-md" }: { open: boolean; onClose: () => void; title: string; kicker?: string; children: ReactNode; footer?: ReactNode; width?: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("button, a, input, select, textarea")?.focus(), 60);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute("disabled"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", key);
      restore.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" data-chrome data-lenis-prevent>
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-paper shadow-2xl`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.87, 0, 0.13, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b hairline px-5 py-4">
              <div>
                {kicker && <div className="label text-leaf-text">{kicker}</div>}
                <h2 className="display mt-1 text-2xl">{title}</h2>
              </div>
              <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5" aria-label={`Close ${title}`}>
                <IconClose />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
            {footer && <div className="border-t hairline px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
