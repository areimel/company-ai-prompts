import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://company-ai-prompts.netlify.app",
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  integrations: [tailwind(), mdx(), sitemap(), icon()],
  image: {
    service: passthroughImageService()
  },
  vite: {
    define: {
      // Ensure environment variables are available in client-side code
      'import.meta.env.PUBLIC_GOOGLE_GEMINI_API_KEY': JSON.stringify(process.env.PUBLIC_GOOGLE_GEMINI_API_KEY)
    }
  }
});