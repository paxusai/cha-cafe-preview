import Image from "next/image";
import type { IllustrationKey, PhotoSlot as Slot } from "@/lib/types";
import { Illus } from "./Illus";

interface Props {
  slot?: Slot;
  className?: string;
  dark?: boolean;
  sizes?: string;
  priority?: boolean;
  illus?: IllustrationKey;
  /** Hide the "client original" badge (e.g. tiny thumbnails). */
  quiet?: boolean;
}

/**
 * Real photos first (§6). Renders the client's original from /public/photos when it
 * exists; otherwise a labelled placeholder so a render is never mistaken for a photo.
 */
export function PhotoSlot({ slot, className = "", dark, sizes = "(max-width: 768px) 100vw, 50vw", priority, illus, quiet }: Props) {
  if (slot?.src) {
    // Photos hosted on Cha's own site load directly; local originals go through next/image (AVIF/WebP).
    const remote = slot.src.startsWith("http");
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={slot.src} alt={slot.alt} fill sizes={sizes} priority={priority} unoptimized={remote} className={slot.fit === "contain" ? "object-contain p-[8%]" : "object-cover"} />
        {slot.credit && !quiet && <span className="label absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">Photo · {slot.credit}</span>}
      </div>
    );
  }
  return (
    <div
      className={`photo-slot ${dark ? "dark text-paper" : "text-ink"} relative flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={slot ? `${slot.alt} (photo to be supplied)` : "Photo to be supplied"}
    >
      {illus && <Illus k={illus} className="h-[46%] w-[46%] max-h-40 opacity-90" />}
      {!quiet && (
        <span className={`label absolute bottom-3 left-3 flex items-center gap-2 rounded-full px-2.5 py-1 ${dark ? "bg-white/10" : "bg-white/70"} backdrop-blur-sm`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          {slot?.label ?? "Photo"} · client original
        </span>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-3 rounded-[inherit] border border-dashed border-current opacity-15" />
    </div>
  );
}
