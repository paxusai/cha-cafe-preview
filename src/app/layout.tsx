import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { BottomBar } from "@/components/BottomBar";
import { CartDrawer } from "@/components/CartDrawer";
import { ChapterRail } from "@/components/ChapterRail";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { OrderDrawer } from "@/components/OrderDrawer";
import { Preloader } from "@/components/Preloader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { buildJsonLd, SITE_URL } from "@/lib/jsonld";
import { getLogo } from "@/lib/server/media";
import { checkoutBase, getProducts } from "@/lib/server/commerce";
import { getLocations } from "@/lib/server/cms";

// Self-hosted variable fonts (§10), bundled from @fontsource-variable — no build-time
// call to Google Fonts. Montserrat ExtraBold = the 2026 campaign display face.
const display = localFont({ src: "../../node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2", weight: "100 900", variable: "--font-montserrat", display: "swap" });
const body = localFont({ src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
const mono = localFont({ src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2", weight: "100 800", variable: "--font-jetbrains", display: "swap" });

const TITLE = "Cha Cafe & Bistro | Specialty Coffee Roaster & Bakery in Garapan, Saipan";
const DESCRIPTION =
  "Cha Cafe & Bistro roasts specialty coffee in-house and bakes fresh bread daily on Beach Road, Garapan. Milk tea since 2012 and two Mobil drive-thrus on Saipan.";

export const metadata: Metadata = {
  // Origin only: Next adds any basePath to the OG image URL itself, so page URLs below use SITE_URL in full.
  metadataBase: new URL(new URL(SITE_URL).origin),
  title: { default: TITLE, template: "%s | Cha Cafe & Bistro" },
  description: DESCRIPTION,
  applicationName: "Cha Cafe & Bistro",
  keywords: ["Cha Cafe", "Cha Saipan", "coffee Saipan", "bakery Garapan", "milk tea Saipan", "drive-thru Saipan", "Hafa Adai Roasting Company"],
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: "Cha Cafe & Bistro",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    url: `${SITE_URL}/`,
  },
  twitter: { card: "summary_large_image", site: "@chasaipan", title: TITLE, description: DESCRIPTION },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [products, locations] = await Promise.all([getProducts(), getLocations()]);
  const logo = getLogo();
  const jsonLd = buildJsonLd(locations, products, logo.src.startsWith("http") ? logo.src : `${SITE_URL}${logo.src}`);
  const previews = Object.fromEntries(products.map((p) => [p.slug, p.preview]));

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* First-visit preloader only: hide it before paint for returning visitors. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('cha:visited'))document.documentElement.classList.add('visited')}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`[data-split]{opacity:1!important}#preloader{display:none}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <AppProvider logo={logo}>
          <Preloader />
          <SmoothScroll />
          <Nav />
          <ChapterRail />
          <main id="main">{children}</main>
          <Footer />
          <BottomBar />
          <CartDrawer checkoutUrl={checkoutBase} previews={previews} />
          <OrderDrawer />
          <Cursor />
        </AppProvider>
      </body>
    </html>
  );
}
