import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import mediaJson from "@data/media.json";
import type { Media } from "../types";

const PUBLIC = path.join(process.cwd(), "public");
const EXT = [".avif", ".webp", ".jpg", ".jpeg", ".png"];

function resolveFile(file: string): string | null {
  if (/^https?:\/\//.test(file)) return file;
  for (const ext of EXT) {
    const rel = `${mediaJson._meta.folder}/${file}${ext}`;
    if (existsSync(path.join(PUBLIC, rel))) return rel;
  }
  return null;
}

/** Every photo slot, with `src: null` where the client's original hasn't been supplied yet. */
export function getMedia(): Media {
  const out: Media = {};
  for (const [id, s] of Object.entries(mediaJson.slots) as [string, { file: string; alt: string; label: string; credit?: string; fit?: "cover" | "contain" }][]) {
    out[id] = { id, src: resolveFile(s.file), alt: s.alt, label: s.label, credit: s.credit, fit: s.fit };
  }
  return out;
}

/** Local vector/WebP first (drop it into /public/brand), else Cha's published 300 px file. */
export function getLogo() {
  const local = mediaJson.logo.local.find((p) => existsSync(path.join(PUBLIC, p)));
  return { src: local ?? mediaJson.logo.remote, alt: mediaJson.logo.alt, isVector: !!local?.endsWith(".svg") };
}
