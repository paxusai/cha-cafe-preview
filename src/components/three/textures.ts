import * as THREE from "three";
import { LEAF_PATHS } from "../ui/LeafMark";

const cssFont = (v: string, fallback: string) => {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback;
};

function finish(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#A9CB7F";
  ctx.fill(new Path2D(LEAF_PATHS.light));
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "#6FA23A";
  ctx.fill(new Path2D(LEAF_PATHS.dark));
  ctx.restore();
}

function drawHibiscus(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    const g = ctx.createRadialGradient(0, -r * 0.2, r * 0.1, 0, -r * 0.55, r * 0.75);
    g.addColorStop(0, "#9e1f2a");
    g.addColorStop(0.35, "#D2373C");
    g.addColorStop(1, "#ea5a5a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.42, r * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = "#f3c94b";
  ctx.lineWidth = r * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(r * 0.55, -r * 0.55);
  ctx.stroke();
  ctx.fillStyle = "#f3c94b";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(r * 0.55 + Math.cos(i) * r * 0.08, -r * 0.55 + Math.sin(i) * r * 0.08, r * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** HARC coffee-bag label: white, tropical hibiscus, origin + roast (as on Cha's bags). */
export function hibiscusLabel(origin: string, roast: string) {
  const W = 560,
    H = 640;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const display = cssFont("--font-montserrat", "Arial Black, sans-serif");
  const mono = cssFont("--font-jetbrains", "monospace");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#D2373C";
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // tropical leaves + hibiscus cluster
  ctx.save();
  ctx.fillStyle = "#6FA23A";
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(W / 2, 250);
    ctx.rotate(-1.4 + i * 0.56);
    ctx.beginPath();
    ctx.ellipse(0, -120, 34, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  drawHibiscus(ctx, W / 2 - 70, 230, 92, 0.3);
  drawHibiscus(ctx, W / 2 + 85, 270, 70, -0.5);

  ctx.textAlign = "center";
  ctx.fillStyle = "#161616";
  ctx.font = `600 22px ${mono}`;
  ctx.fillText("HAFA ADAI ROASTING CO.", W / 2, 72);
  ctx.font = `800 72px ${display}`;
  ctx.fillText(origin.toUpperCase(), W / 2, 470, W - 70);
  ctx.font = `700 30px ${display}`;
  ctx.fillStyle = "#D2373C";
  ctx.fillText(`${roast.toUpperCase()} ROAST`, W / 2, 515);
  ctx.fillStyle = "#161616";
  ctx.font = `500 20px ${mono}`;
  ctx.fillText("SMALL BATCH · SAIPAN · EST. 2012", W / 2, 585);
  return finish(c);
}

/** Leaf motif decal for cups, tumblers, mugs (stand-in until the vector logo arrives). */
export function leafDecal(withWord = false, ink = "#161616") {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  drawLeaf(ctx, withWord ? 74 : 32, withWord ? 40 : 24, withWord ? 1.7 : 3);
  if (withWord) {
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.font = `600 22px ${cssFont("--font-jetbrains", "monospace")}`;
    ctx.fillText("SAIPAN · 2012", 128, 210);
  }
  return finish(c);
}

/** Kraft label for the Milk Tea Kit / bakery box. */
export function kraftLabel(text: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#faf8f3";
  ctx.fillRect(0, 0, 512, 320);
  drawLeaf(ctx, 220, 26, 1.1);
  ctx.textAlign = "center";
  ctx.fillStyle = "#161616";
  ctx.font = `800 54px ${cssFont("--font-montserrat", "sans-serif")}`;
  ctx.fillText(text.toUpperCase(), 256, 200, 470);
  ctx.font = `500 22px ${cssFont("--font-jetbrains", "monospace")}`;
  ctx.fillStyle = "#4E7D24";
  ctx.fillText(sub.toUpperCase(), 256, 250);
  return finish(c);
}

/** Soft round sprite for particle systems. */
export function dotSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
