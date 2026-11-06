"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { Location } from "@/lib/types";
import { LEAF_PATHS } from "./ui/LeafMark";

/**
 * Three-location map with glowing leaf pins (§4.8). MapLibre GL = the open-source
 * Mapbox GL engine; set NEXT_PUBLIC_MAP_STYLE_URL (+ NEXT_PUBLIC_MAPBOX_TOKEN) to use
 * a Mapbox Studio style instead. The free default basemap is recoloured to Cha's
 * light palette after load.
 */
const STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function recolor(map: maplibregl.Map) {
  const style = map.getStyle() as StyleSpecification;
  for (const l of style.layers ?? []) {
    try {
      const id = l.id.toLowerCase();
      if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#FAF8F3");
      else if (l.type === "fill" && id.includes("water")) map.setPaintProperty(l.id, "fill-color", "#dbe6e4");
      else if (l.type === "fill" && /park|wood|grass|landcover|landuse/.test(id)) map.setPaintProperty(l.id, "fill-color", "#e8efdc");
      else if (l.type === "fill" && id.includes("building")) map.setPaintProperty(l.id, "fill-color", "#efebe2");
      else if (l.type === "line" && /road|highway|street|transportation/.test(id)) map.setPaintProperty(l.id, "line-color", "#ffffff");
      else if (l.type === "symbol") {
        map.setPaintProperty(l.id, "text-color", "#4a4a4a");
        map.setPaintProperty(l.id, "text-halo-color", "#FAF8F3");
      }
    } catch {
      /* layer without that paint property */
    }
  }
}

function pin(loc: Location, active: boolean) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "group relative flex h-11 w-11 items-center justify-center";
  el.setAttribute("aria-label", `${loc.name}${loc.geo?.confirmed ? "" : " (approximate pin)"}`);
  el.innerHTML = `
    <span class="pulse-ring absolute inset-1 rounded-full" style="background:${active ? "rgba(111,162,58,.55)" : "rgba(111,162,58,.35)"}"></span>
    <span class="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#161616] shadow-[0_0_0_4px_rgba(111,162,58,.35),0_8px_20px_-6px_rgba(111,162,58,.9)] ${loc.geo?.confirmed ? "" : "outline-2 outline-dashed outline-offset-2 outline-[#4E7D24]"}">
      <svg width="20" height="20" viewBox="0 0 64 66" aria-hidden="true"><path d="${LEAF_PATHS.light}" fill="#A9CB7F"/><path d="${LEAF_PATHS.dark}" fill="#6FA23A"/></svg>
    </span>`;
  return el;
}

export default function LocationsMap({ locations, active, onSelect }: { locations: Location[]; active: string; onSelect: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<string, maplibregl.Marker>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: host.current,
        style: STYLE,
        center: [145.72, 15.19],
        zoom: 11.6,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        transformRequest: TOKEN ? (url) => (url.includes("mapbox.com") ? { url: `${url}${url.includes("?") ? "&" : "?"}access_token=${TOKEN}` } : { url }) : undefined,
      });
    } catch {
      setFailed(true);
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("load", () => {
      recolor(m);
      const pts = locations.filter((l) => l.geo);
      const b = new maplibregl.LngLatBounds();
      pts.forEach((l) => {
        const el = pin(l, l.id === active);
        el.addEventListener("click", () => onSelect(l.id));
        markers.current[l.id] = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([l.geo!.lng, l.geo!.lat]).addTo(m);
        b.extend([l.geo!.lng, l.geo!.lat]);
      });
      m.fitBounds(b, { padding: { top: 70, bottom: 70, left: 60, right: 60 }, maxZoom: 13, duration: 0 });
    });
    m.on("error", (e) => {
      if (String(e.error?.message ?? "").includes("style")) setFailed(true);
    });
    return () => {
      m.remove();
      map.current = null;
      markers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    const l = locations.find((x) => x.id === active);
    if (!m || !l?.geo) return;
    Object.entries(markers.current).forEach(([id, mk]) => mk.getElement().style.zIndex = id === active ? "2" : "1");
    m.easeTo({ center: [l.geo.lng, l.geo.lat], zoom: Math.max(m.getZoom(), 12.4), duration: 900 });
  }, [active, locations]);

  if (failed)
    return (
      <div className="flex h-full items-center justify-center rounded-[inherit] bg-[#efebe2] p-8 text-center text-sm opacity-80">
        Map unavailable right now. Use the Directions buttons for each location.
      </div>
    );
  return <div ref={host} className="h-full w-full" aria-label="Map of Cha's three locations on Saipan" role="region" />;
}
