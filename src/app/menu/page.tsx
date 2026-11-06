import type { Metadata } from "next";
import { MenuBrowser } from "@/components/MenuBrowser";
import { DateStack } from "@/components/ui/DateStack";
import { SITE_URL } from "@/lib/jsonld";
import { getMenu } from "@/lib/server/cms";
import { getMedia } from "@/lib/server/media";

export const metadata: Metadata = {
  title: "Menu",
  description: "The Cha menu: Sea Salt Americano, milk tea with fresh or popping pearls, frappés, croissants and taro bread baked daily, premium cakes and brunch in Garapan, Saipan.",
  alternates: { canonical: `${SITE_URL}/menu` },
  openGraph: { title: "Cha Menu · Coffee, milk tea, bakery & cakes", url: `${SITE_URL}/menu` },
};

export default async function MenuPage() {
  const [menu, media] = await Promise.all([getMenu(), Promise.resolve(getMedia())]);
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-[calc(var(--nav-h)+40px)] sm:px-6 lg:px-10">
      <div className="no-print flex items-start justify-between gap-6">
        <div>
          <p className="label text-leaf-text">006 · The full menu</p>
          <h1 className="display mt-3 text-[13vw] sm:text-7xl lg:text-8xl">The menu.</h1>
          <p className="mt-4 max-w-xl text-lg opacity-80">Roasted in-house. Baked every morning. All day easy eats on Beach Road and at our two drive-thrus.</p>
        </div>
        <DateStack />
      </div>
      <div className="mt-10">
        <MenuBrowser menu={menu} media={media} standalone />
      </div>
    </div>
  );
}
