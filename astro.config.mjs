import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://astroship.web3templates.com",
  output: "static",
  integrations: [tailwind(), mdx(), sitemap(), icon()],
  adapter: netlify(),
  image: {
    service: passthroughImageService()
  }
});