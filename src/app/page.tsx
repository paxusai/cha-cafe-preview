import { Bakery } from "@/components/sections/Bakery";
import { Bistro } from "@/components/sections/Bistro";
import { Business } from "@/components/sections/Business";
import { Cakes } from "@/components/sections/Cakes";
import { Drinks } from "@/components/sections/Drinks";
import { DriveThru } from "@/components/sections/DriveThru";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { MenuSection } from "@/components/sections/MenuSection";
import { Reviews } from "@/components/sections/Reviews";
import { Roast } from "@/components/sections/Roast";
import { Shop } from "@/components/sections/Shop";
import { Story } from "@/components/sections/Story";
import { getMenu, getLocations } from "@/lib/server/cms";
import { getProducts } from "@/lib/server/commerce";
import { getMedia } from "@/lib/server/media";

/** One Saipan morning at Cha: "From Leaf to Cup, Before Sunrise". */
export default async function Home() {
  const [menu, locations, products] = await Promise.all([getMenu(), getLocations(), getProducts()]);
  const media = getMedia();

  return (
    <>
      <Hero media={media} />
      <Story media={media} />
      <Roast media={media} />
      <Bakery media={media} />
      <Drinks />
      <MenuSection menu={menu} media={media} />
      <Cakes media={media} />
      <DriveThru media={media} locations={locations} />
      <Shop products={products} media={media} />
      <Bistro media={media} />
      <Reviews />
      <Business />
      <FinalCta />
    </>
  );
}
