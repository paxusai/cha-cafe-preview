import type Lenis from "lenis";

let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Smooth-scroll to a section id (or "/" top). Falls back to native scrolling. */
export function scrollToId(id: string) {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return false;
  const nav = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
  if (instance) {
    instance.scrollTo(id === "top" ? 0 : el, { offset: id === "top" ? 0 : -nav + 1, duration: 1.4 });
  } else {
    const y = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - nav + 1;
    window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
  return true;
}
