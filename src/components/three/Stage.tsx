"use client";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "../AppProvider";

/**
 * Lazy WebGL stage: the canvas only mounts while its section is near the viewport,
 * so at most one or two GL contexts exist at once (§10 "3D lazy-loaded").
 * Motion paused → renders on demand only.
 */
export function Stage({
  children,
  className = "",
  camera = { position: [0, 0, 6], fov: 35 },
  label,
  margin = "300px",
  ...rest
}: { children: ReactNode; className?: string; label: string; margin?: string } & Omit<CanvasProps, "children">) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const { motionPaused } = useApp();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={host} className={className} role="img" aria-label={`3D illustration: ${label}`}>
      {live && (
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={camera}
          frameloop={motionPaused ? "demand" : "always"}
          {...rest}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
