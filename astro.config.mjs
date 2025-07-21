import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://company-ai-prompts.netlify.app",
  output: "static",
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