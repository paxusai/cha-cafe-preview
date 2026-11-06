"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";

export interface CartLine {
  id: number;
  slug: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderLine {
  key: string;
  itemId: string;
  name: string;
  options: string[];
  price: number | null;
  qty: number;
}

export interface Logo {
  src: string;
  alt: string;
  isVector: boolean;
}

interface AppState {
  logo: Logo;
  /** Client capabilities have been detected (false during SSR/first paint) */
  ready: boolean;
  /** OS-level prefers-reduced-motion */
  reducedMotion: boolean;
  /** User pressed the pause-motion control (WCAG 2.2.2) */
  motionPaused: boolean;
  setMotionPaused: (v: boolean) => void;
  /** Full cinematic mode: pinning, scrubbing, smooth scroll */
  cinematic: boolean;
  /** 3D allowed: desktop/tablet, capable device, motion allowed */
  allow3D: boolean;
  isMobile: boolean;

  cart: CartLine[];
  addToCart: (p: Product, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;

  order: OrderLine[];
  addToOrder: (line: Omit<OrderLine, "key" | "qty">) => void;
  setOrderQty: (key: string, qty: number) => void;
  clearOrder: () => void;
  orderOpen: boolean;
  orderLocation: string;
  openOrder: (locationId?: string) => void;
  setOrderOpen: (v: boolean) => void;

  toast: string | null;
  notify: (msg: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(k);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode — cart simply won't persist */
    }
  },
};

function detectLowPower() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) < 4 || !!n.connection?.saveData;
}

export function AppProvider({ children, logo }: { children: ReactNode; logo: Logo }) {
  const [reducedMotion, setReduced] = useState(false);
  const [motionPaused, setMotionPausedState] = useState(false);
  const [isMobile, setMobile] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [ready, setReady] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState<OrderLine[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderLocation, setOrderLocation] = useState("main");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mm = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReduced(mq.matches);
      setMobile(mm.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    mm.addEventListener("change", sync);
    setLowPower(detectLowPower());
    setMotionPausedState(store.get("cha:motionPaused", false));
    setCart(store.get("cha:cart", []));
    setReady(true);
    return () => {
      mq.removeEventListener("change", sync);
      mm.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (ready) store.set("cha:cart", cart);
  }, [cart, ready]);

  useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", motionPaused);
    document.documentElement.classList.toggle("reduced", reducedMotion);
  }, [motionPaused, reducedMotion]);

  const setMotionPaused = useCallback((v: boolean) => {
    setMotionPausedState(v);
    store.set("cha:motionPaused", v);
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const addToCart = useCallback(
    (p: Product, qty = 1) => {
      setCart((c) => {
        const hit = c.find((l) => l.id === p.id);
        if (hit) return c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + qty } : l));
        return [...c, { id: p.id, slug: p.slug, name: p.name, price: p.price, qty }];
      });
      notify(`${p.name} added to cart`);
    },
    [notify],
  );

  const setQty = useCallback((id: number, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);

  const addToOrder = useCallback(
    (line: Omit<OrderLine, "key" | "qty">) => {
      const key = `${line.itemId}|${line.options.join("|")}`;
      setOrder((o) => {
        const hit = o.find((l) => l.key === key);
        if (hit) return o.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
        return [...o, { ...line, key, qty: 1 }];
      });
      notify(`${line.name} added to your order`);
    },
    [notify],
  );

  const setOrderQty = useCallback((key: string, qty: number) => {
    setOrder((o) => (qty <= 0 ? o.filter((l) => l.key !== key) : o.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const openOrder = useCallback((locationId?: string) => {
    if (locationId) setOrderLocation(locationId);
    setCartOpen(false);
    setOrderOpen(true);
  }, []);

  const value = useMemo<AppState>(() => {
    const cinematic = ready && !reducedMotion;
    return {
      logo,
      ready,
      reducedMotion,
      motionPaused,
      setMotionPaused,
      cinematic,
      allow3D: cinematic && !isMobile && !lowPower,
      isMobile,
      cart,
      addToCart,
      setQty,
      cartOpen,
      setCartOpen,
      order,
      addToOrder,
      setOrderQty,
      clearOrder: () => setOrder([]),
      orderOpen,
      orderLocation,
      openOrder,
      setOrderOpen,
      toast,
      notify,
    };
  }, [logo, ready, reducedMotion, motionPaused, setMotionPaused, isMobile, lowPower, cart, addToCart, setQty, cartOpen, order, addToOrder, setOrderQty, orderOpen, orderLocation, openOrder, toast, notify]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
